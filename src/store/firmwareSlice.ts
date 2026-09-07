import {createSelector, createSlice, PayloadAction} from '@reduxjs/toolkit';
import type {RootState, AppThunk} from './index';
import {getSelectedDevicePath, getSelectedKeyboardAPI} from './devicesSlice';
import {KeyboardAPI} from 'src/utils/keyboard-api';
import {KeyboardValue} from 'src/utils/keyboard-values';
import {
  formatKeycodesVersion,
  KeycodesVersionProtocolError,
  MAXIMUM_SUPPORTED_KEYCODES_VERSION,
  MINIMUM_SUPPORTED_KEYCODES_VERSION,
  readKeycodesVersion,
  UnsupportedKeycodesVersionError,
} from 'src/utils/keycodes-version';
import type {ConnectedDevice} from '../types/types';
import {extractDeviceInfo, logKeyboardAPIError} from './errorsSlice';

type FirmwareVersionMap = {[devicePath: string]: number};
type KeycodesVersionMap = {[devicePath: string]: number};

type FirmwareState = {
  firmwareVersionMap: FirmwareVersionMap;
  keycodesVersionMap: KeycodesVersionMap;
};

const initialState: FirmwareState = {
  firmwareVersionMap: {},
  keycodesVersionMap: {},
};

export const firmwareSlice = createSlice({
  name: 'firmware',
  initialState,
  reducers: {
    updateFirmwareVersion: (
      state,
      action: PayloadAction<{devicePath: string; version: number}>,
    ) => {
      const {devicePath, version} = action.payload;
      state.firmwareVersionMap[devicePath] = version;
    },
    updateKeycodesVersion: (
      state,
      action: PayloadAction<{devicePath: string; version: number}>,
    ) => {
      const {devicePath, version} = action.payload;
      state.keycodesVersionMap[devicePath] = version;
    },
  },
});

export const {updateFirmwareVersion, updateKeycodesVersion} =
  firmwareSlice.actions;

export default firmwareSlice.reducer;

// Selectors
export const getFirmwareVersionMap = (state: RootState) =>
  (state.firmware as FirmwareState).firmwareVersionMap;
export const getKeycodesVersionMap = (state: RootState) =>
  (state.firmware as FirmwareState).keycodesVersionMap;

export const getSelectedFirmwareVersion = createSelector(
  getFirmwareVersionMap,
  getSelectedDevicePath,
  (map, path) => (path ? map[path] : undefined),
);

export const getSelectedKeycodesVersion = createSelector(
  getKeycodesVersionMap,
  getSelectedDevicePath,
  (map, path) => (path ? map[path] : undefined),
);

export const loadKeycodesVersion =
  (connectedDevice: ConnectedDevice): AppThunk =>
  async (dispatch) => {
    if (connectedDevice.protocol < 13) {
      return;
    }

    const api = new KeyboardAPI(connectedDevice.path);
    let version: number;
    try {
      version = await readKeycodesVersion(api);
    } catch (error) {
      if (error instanceof KeycodesVersionProtocolError) {
        const details =
          error instanceof UnsupportedKeycodesVersionError
            ? `Device reports unsupported QMK keycode version ${formatKeycodesVersion(error.version)}. This version of VIA supports ${formatKeycodesVersion(MINIMUM_SUPPORTED_KEYCODES_VERSION)} through ${formatKeycodesVersion(MAXIMUM_SUPPORTED_KEYCODES_VERSION)}. Update VIA before assigning keycodes.`
            : `Device reports VIA protocol ${connectedDevice.protocol}, but ${error.message.toLowerCase()}. Firmware may contain incompatible VIA and QMK revisions.`;
        dispatch(
          logKeyboardAPIError({
            commandName: 'GET_KEYBOARD_VALUE / KEYCODES_VERSION',
            commandBytes: [0x02, KeyboardValue.KEYCODES_VERSION],
            responseBytes: [
              0x02,
              KeyboardValue.KEYCODES_VERSION,
              ...error.responseBytes,
            ],
            deviceInfo: extractDeviceInfo(connectedDevice),
            details,
          }),
        );
      }
      throw error;
    }
    dispatch(
      updateKeycodesVersion({devicePath: connectedDevice.path, version}),
    );
  };

// Thunk to load firmware version from device
export const loadFirmwareVersion =
  (connectedDevice: ConnectedDevice): AppThunk =>
  async (dispatch, getState) => {
    const state = getState();
    const api = getSelectedKeyboardAPI(state) as KeyboardAPI;
    const {path} = connectedDevice;

    try {
      const result = await api.getKeyboardValue(
        KeyboardValue.FIRMWARE_VERSION,
        [],
        4, // Read 4 bytes for 32-bit value
      );

      // Parse 32-bit value from 4 bytes (big-endian)
      const version =
        (result[0] << 24) | (result[1] << 16) | (result[2] << 8) | result[3];

      dispatch(updateFirmwareVersion({devicePath: path, version}));
    } catch (e) {
      console.error('Failed to load firmware version:', e);
    }
  };
