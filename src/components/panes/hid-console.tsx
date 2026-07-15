import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import styled from 'styled-components';
import {AccentSelect} from '../inputs/accent-select';
import {Pane} from './pane';
import {isQMKConsoleDevice, QMK_CONSOLE_FILTER} from 'src/shims/node-hid';
import {formatNumberAsHex} from 'src/utils/format';
import {useTranslation} from 'react-i18next';
import {useAppSelector} from 'src/store/hooks';
import {
  getIsSelectedDeviceReady,
  getSelectedConnectedDevice,
} from 'src/store/devicesSlice';

const Container = styled.div`
  box-sizing: border-box;
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 12px;
  min-height: 0;
  padding: 20px;
`;

const Toolbar = styled.div`
  display: flex;
  gap: 10px;
`;

const Console = styled.pre`
  background: #111;
  border: 1px solid var(--border_color_cell);
  border-radius: 4px;
  box-sizing: border-box;
  color: #e6e6e6;
  flex: 1;
  font:
    12px/1.45 ui-monospace,
    SFMono-Regular,
    Menlo,
    Consolas,
    monospace;
  margin: 0;
  min-height: 0;
  overflow: auto;
  padding: 14px;
  white-space: pre-wrap;
  word-break: break-word;
`;

const ActionButton = styled.button`
  background: var(--bg_menu);
  border: 1px solid var(--color_accent);
  border-radius: 4px;
  color: var(--color_accent);
  cursor: pointer;
  padding: 0 18px;

  &:disabled {
    cursor: default;
    opacity: 0.45;
  }
`;

let sessionOutputs: Record<string, string> = {};
const deviceKey = (device: HIDDevice) => {
  return `${device.vendorId}:${device.productId}:${device.productName ?? ''}`;
};

type HIDConsoleProps = {
  isActive?: boolean;
  params?: unknown;
};

export const HIDConsole = ({isActive = true}: HIDConsoleProps) => {
  const {t} = useTranslation();
  const selectedConnectedDevice = useAppSelector(getSelectedConnectedDevice);
  const isSelectedDeviceReady = useAppSelector(getIsSelectedDeviceReady);
  const [devices, setDevices] = useState<HIDDevice[]>([]);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [outputs, setOutputs] = useState<Record<string, string>>(
    sessionOutputs,
  );
  const consoleRef = useRef<HTMLPreElement>(null);
  const lastScopedPath = useRef<string | null>(null);
  const autoFollowedPath = useRef<string | null>(null);
  const decoder = useMemo(() => new TextDecoder(), []);

  useEffect(() => {
    sessionOutputs = outputs;
  }, [outputs]);

  const refreshDevices = useCallback(async () => {
    const consoleDevices = (await navigator.hid.getDevices()).filter(
      isQMKConsoleDevice,
    );
    setDevices(consoleDevices);
    setSelectedKey((current) =>
      current && consoleDevices.some((device) => deviceKey(device) === current)
        ? current
        : null,
    );
  }, []);

  useEffect(() => {
    refreshDevices();
    navigator.hid.addEventListener('connect', refreshDevices);
    navigator.hid.addEventListener('disconnect', refreshDevices);
    return () => {
      navigator.hid.removeEventListener('connect', refreshDevices);
      navigator.hid.removeEventListener('disconnect', refreshDevices);
    };
  }, [refreshDevices]);

  useEffect(() => {
    const scopedPath = selectedConnectedDevice?.path ?? null;
    if (lastScopedPath.current !== scopedPath) {
      lastScopedPath.current = scopedPath;
      autoFollowedPath.current = null;
      setSelectedKey(null);
    }
  }, [selectedConnectedDevice?.path]);

  useEffect(() => {
    if (!selectedConnectedDevice || !isSelectedDeviceReady) {
      return;
    }
    if (autoFollowedPath.current === selectedConnectedDevice.path) return;

    const consoleDevice = devices.find(
      (device) =>
        device.vendorId === selectedConnectedDevice.vendorId &&
        device.productId === selectedConnectedDevice.productId,
    );
    if (consoleDevice) {
      setSelectedKey(deviceKey(consoleDevice));
      autoFollowedPath.current = selectedConnectedDevice.path;
    }
  }, [devices, isSelectedDeviceReady, selectedConnectedDevice]);

  const selectedDevice = devices.find(
    (device) => deviceKey(device) === selectedKey,
  );

  useEffect(() => {
    if (!selectedDevice) return;

    let cancelled = false;

    const handleReport = (event: HIDInputReportEvent) => {
      const bytes = new Uint8Array(
        event.data.buffer,
        event.data.byteOffset,
        event.data.byteLength,
      );
      const text = decoder.decode(bytes).replaceAll('\0', '');
      if (text) {
        setOutputs((current) => ({
          ...current,
          [selectedKey as string]:
            (current[selectedKey as string] ?? '') + text,
        }));
      }
    };

    const startListening = async () => {
      try {
        if (!selectedDevice.opened) await selectedDevice.open();
        if (!cancelled) {
          selectedDevice.addEventListener('inputreport', handleReport);
        }
      } catch (error) {
        if (!cancelled) {
          const message = error instanceof Error ? error.message : String(error);
          setOutputs((current) => ({
            ...current,
            [selectedKey as string]: `[Unable to open HID console: ${message}]\n`,
          }));
        }
      }
    };

    startListening();
    return () => {
      cancelled = true;
      selectedDevice.removeEventListener('inputreport', handleReport);
    };
  }, [decoder, selectedDevice, selectedKey]);

  const output = selectedKey ? (outputs[selectedKey] ?? '') : '';

  useLayoutEffect(() => {
    if (isActive && consoleRef.current) {
      consoleRef.current.scrollTo({
        top: consoleRef.current.scrollHeight,
        behavior: 'auto',
      });
    }
  }, [isActive, output, selectedKey]);

  const options = devices.map((device) => ({
    value: deviceKey(device),
    label: `${device.productName || t('Unnamed device')} (${formatNumberAsHex(device.vendorId, 4)}:${formatNumberAsHex(device.productId, 4)})`,
  }));

  const authorizeDevice = async () => {
    try {
      const requestedDevices = await navigator.hid.requestDevice({
        filters: [QMK_CONSOLE_FILTER],
      });
      const consoleDevice = requestedDevices.find(isQMKConsoleDevice);
      if (!consoleDevice) return;

      setDevices((current) => [
        ...current.filter(
          (candidate) => deviceKey(candidate) !== deviceKey(consoleDevice),
        ),
        consoleDevice,
      ]);
      setSelectedKey(deviceKey(consoleDevice));
    } catch (error) {
      // Cancelling the browser's device picker leaves the current selection alone.
      if (error instanceof DOMException && error.name === 'NotFoundError') return;
      const message = error instanceof Error ? error.message : String(error);
      setOutputs((current) => ({
        ...current,
        authorization: `[Unable to authorize HID console: ${message}]\n`,
      }));
      setSelectedKey('authorization');
    }
  };

  const save = () => {
    if (!selectedDevice) return;

    const exportedAt = new Date();
    const vendorId = formatNumberAsHex(selectedDevice.vendorId, 4);
    const productId = formatNumberAsHex(selectedDevice.productId, 4);
    const header = [
      'HID Console Log',
      `Board: ${selectedDevice.productName || 'Unnamed device'}`,
      `Vendor ID: ${vendorId}`,
      `Product ID: ${productId}`,
      `Device ID: ${vendorId}:${productId}`,
      `Exported: ${exportedAt.toISOString()}`,
      '',
      '--- Console Output ---',
      '',
    ].join('\n');
    const url = URL.createObjectURL(
      new Blob([header, output], {type: 'text/plain'}),
    );
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `hid-console-${exportedAt.toISOString().replaceAll(':', '-')}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Pane>
      <Container>
        <Toolbar>
          <AccentSelect
            value={
              options.find((option) => option.value === selectedKey) ?? null
            }
            options={options}
            placeholder={
              options.length
                ? t('Select console device')
                : t('No console device connected')
            }
            isDisabled={!options.length}
            onChange={(option: any) => setSelectedKey(option?.value ?? null)}
          />
          <ActionButton onClick={authorizeDevice}>
            {t('Add device')}
          </ActionButton>
          <ActionButton
            onClick={() =>
              selectedKey &&
              setOutputs((current) => ({...current, [selectedKey]: ''}))
            }
            disabled={!output}
          >
            {t('Clear')}
          </ActionButton>
          <ActionButton onClick={save} disabled={!output}>
            {t('Save')}
          </ActionButton>
        </Toolbar>
        <Console ref={consoleRef}>{output}</Console>
      </Container>
    </Pane>
  );
};
