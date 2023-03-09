import {createSelector, createSlice, PayloadAction} from '@reduxjs/toolkit';
import type {DefinitionVersion} from '@the-via/reader';
import {KeyboardAPI} from 'src/utils/keyboard-api';
import type {
  ConnectedDevice,
  ConnectedDevices,
  VendorProductIdMap,
} from '../types/types';

import type {RootState} from './index';

type DevicesState = {
  selectedDevicePath: string | null;
  connectedDevicePaths: ConnectedDevices;
  supportedIds: VendorProductIdMap;
  forceAuthorize: boolean;
};

const initialState: DevicesState = {
  selectedDevicePath: null,
  connectedDevicePaths: {},
  supportedIds: {},
  forceAuthorize: false,
};

const deviceSlice = createSlice({
  name: 'devices',
  initialState,
  reducers: {
    // TODO: change to just pass the device path instead of the whole device
    selectDevice: (state, action: PayloadAction<ConnectedDevice | null>) => {
      if (!action.payload) {
        state.selectedDevicePath = null;
      } else {
        state.selectedDevicePath = action.payload.path;
      }
    },
    setForceAuthorize: (state, action: PayloadAction<boolean>) => {
      state.forceAuthorize = action.payload;
    },
    updateConnectedDevices: (
      state,
      action: PayloadAction<ConnectedDevices>,
    ) => {
      state.connectedDevicePaths = action.payload;
    },
    clearAllDevices: (state) => {
      state.selectedDevicePath = null;
      state.connectedDevicePaths = {};
    },
    updateSupportedIds: (state, action: PayloadAction<VendorProductIdMap>) => {
      state.supportedIds = action.payload;
    },
    ensureSupportedIds: (
      state,
      action: PayloadAction<{productIds: number[]; version: DefinitionVersion}>,
    ) => {
      const {productIds, version} = action.payload;
      productIds.forEach((productId) => {
        state.supportedIds[productId] = state.supportedIds[productId] ?? {};
        // Side effect
        state.supportedIds[productId][version] = true;
      });
    },
  },
});

export const {
  clearAllDevices,
  selectDevice,
  updateConnectedDevices,
  updateSupportedIds,
  ensureSupportedIds,
  setForceAuthorize,
} = deviceSlice.actions;

export default deviceSlice.reducer;

export const getForceAuthorize = (state: RootState) =>
  state.devices.forceAuthorize;
export const getConnectedDevices = (state: RootState) =>
  state.devices.connectedDevicePaths;
export const getSelectedDevicePath = (state: RootState) =>
  state.devices.selectedDevicePath;
export const getSupportedIds = (state: RootState) => state.devices.supportedIds;
export const getSelectedConnectedDevice = createSelector(
  getConnectedDevices,
  getSelectedDevicePath,
  (devices, path) => path && devices[path],
);
export const getSelectedKeyboardAPI = createSelector(
  getSelectedDevicePath,
  (path) => path && new KeyboardAPI(path),
);
