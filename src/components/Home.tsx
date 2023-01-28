import React, {createRef, FC, ReactNode, useEffect, useState} from 'react';
import styled from 'styled-components';
import {mapEvtToKeycode, getByteForCode} from '../utils/key';
import {startMonitoring, usbDetect} from '../utils/usb-hid';
import {Title} from './title-bar';
import {
  getLightingDefinition,
  isVIADefinitionV2,
  LightingValue,
} from '@the-via/reader';
import {getNextKey} from './positioned-keyboard';
import {useDispatch} from 'react-redux';
import {getSelectedConnectedDevice} from 'src/store/devicesSlice';
import {
  loadSupportedIds,
  reloadConnectedDevices,
} from 'src/store/devicesThunks';
import {
  disableGlobalHotKeys,
  enableGlobalHotKeys,
  getAllowGlobalHotKeys,
  getAllowKeyboardKeyRemapping,
  getDisableFastRemap,
} from '../store/settingsSlice';
import {useAppSelector} from 'src/store/hooks';
import {
  getSelectedKey,
  getSelectedLayerIndex,
  updateKey,
  updateSelectedKey as updateSelectedKeyAction,
} from 'src/store/keymapSlice';
import {
  getKeycodeDict,
  getSelectedDefinition,
  getSelectedKeyDefinitions,
} from 'src/store/definitionsSlice';

const ErrorHome = styled.div`
  background: var(--color_jet);
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  height: 100%;
  overflow: hidden;
`;

const UsbError = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: center;
  margin: 0 auto;
  max-width: 650px;
  text-align: center;
`;

const UsbErrorIcon = styled.div`
  font-size: 2rem;
`;

const UsbErrorHeading = styled.h1`
  margin: 1rem 0 0;
`;

const UsbErrorWebHIDLink = styled.a`
  text-decoration: underline;
`;

const timeoutRepeater =
  (fn: () => void, timeout: number, numToRepeat = 0) =>
  () =>
    setTimeout(() => {
      fn();
      if (numToRepeat > 0) {
        timeoutRepeater(fn, timeout, numToRepeat - 1)();
      }
    }, timeout);

interface HomeProps {
  children?: React.ReactNode;
  hasHIDSupport: boolean;
}

export const Home = (props: HomeProps) => {
  const {hasHIDSupport} = props;

  const dispatch = useDispatch();
  const allowKeyRemappingViaKeyboard = useAppSelector(
    getAllowKeyboardKeyRemapping,
  );
  const globalHotKeysAllowed = useAppSelector(getAllowGlobalHotKeys);
  const selectedKey = useAppSelector(getSelectedKey);
  const selectedDevice = useAppSelector(getSelectedConnectedDevice);
  const selectedDefinition = useAppSelector(getSelectedDefinition);
  const selectedLayerIndex = useAppSelector(getSelectedLayerIndex);
  const selectedKeyDefinitions = useAppSelector(getSelectedKeyDefinitions);
  const disableFastRemap = useAppSelector(getDisableFastRemap);
  const keycodeDict = useAppSelector(getKeycodeDict);

  const updateDevicesRepeat: () => void = timeoutRepeater(
    () => {
      dispatch(reloadConnectedDevices());
    },
    500,
    1,
  );

  const updateSelectedKey = async (value: number) => {
    if (
      selectedLayerIndex !== null &&
      selectedKey !== null &&
      selectedDefinition
    ) {
      // Redux
      dispatch(updateKey(selectedKey, value));
      dispatch(
        updateSelectedKeyAction(
          disableFastRemap
            ? null
            : getNextKey(selectedKey, selectedKeyDefinitions),
        ),
      );
    }
  };

  const handleKeys = (evt: KeyboardEvent): void => {
    if (
      allowKeyRemappingViaKeyboard &&
      globalHotKeysAllowed &&
      selectedKey !== null
    ) {
      const keycode = mapEvtToKeycode(evt);
      if (keycode !== undefined) {
        updateSelectedKey(getByteForCode(keycode, keycodeDict));
      }
    }
  };

  const enableKeyPressListener = () => {
    const body = document.body;
    if (body) {
      body.addEventListener('keydown', handleKeys);
    }
  };

  const disableKeyPressListener = () => {
    const body = document.body;
    if (body) {
      body.removeEventListener('keydown', handleKeys);
    }
  };

  const toggleLights = async () => {
    if (!selectedDevice) {
      return;
    }
    const {api} = selectedDevice;

    // TODO: Some sort of toggling lights on v3 firmware
    if (!isVIADefinitionV2(selectedDefinition)) {
      return;
    }

    if (
      api &&
      selectedDefinition &&
      getLightingDefinition(
        selectedDefinition.lighting,
      ).supportedLightingValues.includes(LightingValue.BACKLIGHT_EFFECT)
    ) {
      const val = await api.getRGBMode();
      const newVal =
        val !== 0
          ? 0
          : getLightingDefinition(selectedDefinition.lighting).effects.length -
            1;
      api.setRGBMode(newVal);
      api.timeout(200);
      api.setRGBMode(val);
      api.timeout(200);
      api.setRGBMode(newVal);
      api.timeout(200);
      await api.setRGBMode(val);
    }
  };

  const [, setSelectedTitle] = useState<string | null>(null);

  const homeElem = createRef<HTMLDivElement>();

  useEffect(() => {
    if (!hasHIDSupport) {
      return;
    }

    if (homeElem.current) {
      homeElem.current.focus();
    }

    startMonitoring();
    dispatch(enableGlobalHotKeys());
    usbDetect.on('change', updateDevicesRepeat);
    dispatch(loadSupportedIds());
    enableKeyPressListener();

    return () => {
      // Cleanup function equiv to componentWillUnmount
      usbDetect.off('change', updateDevicesRepeat);
      dispatch(disableGlobalHotKeys());
      disableKeyPressListener();
    };
  }, []); // Passing an empty array as the second arg makes the body of the function equiv to componentDidMount (not including the cleanup func)

  useEffect(() => {
    setSelectedTitle(selectedDevice ? Title.KEYS : null);
    dispatch(updateSelectedKeyAction(null));
    toggleLights();
  }, [selectedDevice]);

  return (
    <ErrorHome ref={homeElem} tabIndex={0} style={{flex: 1}}>
      {!hasHIDSupport ? (
        <UsbError>
          <UsbErrorIcon>❌</UsbErrorIcon>
          <UsbErrorHeading>USB Detection Error</UsbErrorHeading>
          <p>
            Looks like there was a problem getting USB detection working. Right
            now, we only support{' '}
            <UsbErrorWebHIDLink
              href="https://caniuse.com/?search=webhid"
              target="_blank"
            >
              browsers that have WebHID enabled
            </UsbErrorWebHIDLink>
            , so make sure yours is compatible before trying again.
          </p>
        </UsbError>
      ) : (
        props.children
      )}
    </ErrorHome>
  );
};
