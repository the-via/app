import React, {createRef, useEffect} from 'react';
import styled from 'styled-components';
import {getByteForCode} from '../utils/key';
import {startMonitoring, usbDetect} from '../utils/usb-hid';
import {
  getLightingDefinition,
  isVIADefinitionV2,
  isVIADefinitionV3,
  LightingValue,
} from '@the-via/reader';
import {
  getConnectedDevices,
  getSelectedKeyboardAPI,
} from 'src/store/devicesSlice';
import {
  loadSupportedIds,
  reloadConnectedDevices,
} from 'src/store/devicesThunks';
import {getDisableFastRemap} from '../store/settingsSlice';
import {useAppDispatch, useAppSelector} from 'src/store/hooks';
import {
  getSelectedKey,
  getSelectedLayerIndex,
  updateSelectedKey as updateSelectedKeyAction,
} from 'src/store/keymapSlice';
import {
  getBasicKeyToByte,
  getSelectedDefinition,
  getSelectedKeyDefinitions,
} from 'src/store/definitionsSlice';
import {OVERRIDE_HID_CHECK} from 'src/utils/override';
import {KeyboardValue} from 'src/utils/keyboard-api';
import {useTranslation} from 'react-i18next';

const ErrorHome = styled.div`
  background: var(--bg_gradient);
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  height: 100%;
  overflow: hidden;
  height: auto;
  left: 0;
  right: 0;
  bottom: 0;
  padding-top: 24px;
  position: absolute;
  border-top: 1px solid var(--border_color_cell);
`;

const UsbError = styled.div`
  align-items: center;
  display: flex;
  color: var(--color_label);
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
  color: var(--color_label-highlighted);
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

export const Home: React.FC<HomeProps> = (props) => {
  const {t} = useTranslation();
  const {hasHIDSupport} = props;

  const dispatch = useAppDispatch();
  const selectedKey = useAppSelector(getSelectedKey);
  const selectedDefinition = useAppSelector(getSelectedDefinition);
  const connectedDevices = useAppSelector(getConnectedDevices);
  const selectedLayerIndex = useAppSelector(getSelectedLayerIndex);
  const selectedKeyDefinitions = useAppSelector(getSelectedKeyDefinitions);
  const disableFastRemap = useAppSelector(getDisableFastRemap);
  const {basicKeyToByte} = useAppSelector(getBasicKeyToByte);
  const api = useAppSelector(getSelectedKeyboardAPI);

  const updateDevicesRepeat: () => void = timeoutRepeater(
    () => {
      dispatch(reloadConnectedDevices());
    },
    500,
    1,
  );

  const toggleLights = async () => {
    if (!api || !selectedDefinition) {
      return;
    }

    const delay = 200;

    if (
      isVIADefinitionV2(selectedDefinition) &&
      getLightingDefinition(
        selectedDefinition.lighting,
      ).supportedLightingValues.includes(LightingValue.BACKLIGHT_EFFECT)
    ) {
      const val = await api.getRGBMode();
      const newVal = val !== 0 ? 0 : 1;
      for (let i = 0; i < 3; i++) {
        api.timeout(i === 0 ? 0 : delay);
        api.setRGBMode(newVal);
        api.timeout(delay);
        await api.setRGBMode(val);
      }
    }

    if (isVIADefinitionV3(selectedDefinition)) {
      for (let i = 0; i < 6; i++) {
        api.timeout(i === 0 ? 0 : delay);
        await api.setKeyboardValue(KeyboardValue.DEVICE_INDICATION, i);
      }
    }
  };

  const homeElem = createRef<HTMLDivElement>();

  useEffect(() => {
    if (!hasHIDSupport) {
      return;
    }

    if (homeElem.current) {
      homeElem.current.focus();
    }

    startMonitoring();
    usbDetect.on('change', updateDevicesRepeat);
    dispatch(loadSupportedIds());

    return () => {
      // Cleanup function equiv to componentWillUnmount
      usbDetect.off('change', updateDevicesRepeat);
    };
  }, []); // Passing an empty array as the second arg makes the body of the function equiv to componentDidMount (not including the cleanup func)

  useEffect(() => {
    dispatch(updateSelectedKeyAction(null));

    // Only trigger flashing lights when multiple devices are connected
    // if (Object.values(connectedDevices).length > 1) {
    //   toggleLights();
    // }
  }, [api]);

  return !hasHIDSupport && !OVERRIDE_HID_CHECK ? (
    <ErrorHome ref={homeElem} tabIndex={0}>
      <UsbError>
        <UsbErrorIcon>❌</UsbErrorIcon>
        <UsbErrorHeading>{t('USB Detection Error')}</UsbErrorHeading>
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
    </ErrorHome>
  ) : (
    <>{props.children}</>
  );
};
