import {createSelector, createSlice, PayloadAction} from '@reduxjs/toolkit';
import type {RootState, AppThunk} from './index';
import {getSelectedDevicePath, getSelectedKeyboardAPI} from './devicesSlice';
import {KeyboardAPI, KeyboardValue} from 'src/utils/keyboard-api';
import type {ConnectedDevice} from '../types/types';

type FirmwareVersionMap = {[devicePath: string]: number};

type FirmwareState = {
  firmwareVersionMap: FirmwareVersionMap;
};

const initialState: FirmwareState = {
  firmwareVersionMap: {},
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
  },
});

export const {updateFirmwareVersion} = firmwareSlice.actions;

export default firmwareSlice.reducer;

// Selectors
export const getFirmwareVersionMap = (state: RootState) =>
  (state.firmware as FirmwareState).firmwareVersionMap;

export const getSelectedFirmwareVersion = createSelector(
  getFirmwareVersionMap,
  getSelectedDevicePath,
  (map, path) => (path ? map[path] : undefined),
);

// Thunk to load firmware version from device
export const loadFirmwareVersion =
  (connectedDevice: ConnectedDevice): AppThunk =>
  async (dispatch, getState) => {
    const state = getState();
    const api = getSelectedKeyboardAPI(state) as KeyboardAPI;
    const {path} = connectedDevice;

    try {
      const result = await api.getKeyboardValue(
        KeyboardValue. FIRMWARE_VERSION,
        [],
        4, // Read 4 bytes for 32-bit value
      );

      // Parse 32-bit value from 4 bytes (big-endian)
      const version = (result[0] << 24) | (result[1] << 16) | (result[2] << 8) | result[3];

      dispatch(updateFirmwareVersion({devicePath: path, version}));
    } catch (e) {
      console.error('Failed to load firmware version:', e);
    }
  };