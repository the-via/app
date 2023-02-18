import {createSelector, createSlice, PayloadAction} from '@reduxjs/toolkit';
import type {DefinitionVersion} from '@the-via/reader';
import type {
  ConnectedDevice,
  ConnectedDevices,
  VendorProductIdMap,
} from '../types/types';

import type {RootState} from './index';

export type DevicesState = {
  selectedDevicePath: string | null;
  connectedDevices: ConnectedDevices;
  supportedIds: VendorProductIdMap;
};

const initialState: DevicesState = {
  selectedDevicePath: null,
  connectedDevices: {},
  supportedIds: {},
};

export const deviceSlice = createSlice({
  name: 'devices',
  initialState,
  reducers: {
    // TODO: change to just pass the device path instead of the whole device
    selectDevice: (state, action: PayloadAction<ConnectedDevice | null>) => {
      if (!action.payload) {
        state.selectedDevicePath = null;
      } else {
        state.selectedDevicePath = action.payload.device.path;
      }
    },
    updateConnectedDevices: (
      state,
      action: PayloadAction<ConnectedDevices>,
    ) => {
      state.connectedDevices = action.payload;
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
  selectDevice,
  updateConnectedDevices,
  updateSupportedIds,
  ensureSupportedIds,
} = deviceSlice.actions;

export default deviceSlice.reducer;

export const getConnectedDevices = (state: RootState) =>
  state.devices.connectedDevices;
export const getSelectedDevicePath = (state: RootState) =>
  state.devices.selectedDevicePath;
export const getSupportedIds = (state: RootState) => state.devices.supportedIds;
export const getSelectedConnectedDevice = createSelector(
  getConnectedDevices,
  getSelectedDevicePath,
  (devices, path) => path && devices[path],
);
