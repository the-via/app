import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import type {
  ConnectedDevices,
  Device,
  DeviceMap,
  VendorProductIdMap,
} from 'src/types/types';
import {
  getRecognisedDevices,
  getVendorProductId,
} from 'src/utils/hid-keyboards';
import {KeyboardAPI} from 'src/utils/keyboard-api';
import type {AppThunk} from '.';

export type DevicesState = {
  rawDeviceMap: DeviceMap;
  selectedDevicePath: string | null;
  connectedDevices: ConnectedDevices;
  supportedIds: VendorProductIdMap;
};

const initialState: DevicesState = {
  rawDeviceMap: {},
  selectedDevicePath: null,
  connectedDevices: {},
  supportedIds: [],
};

export const deviceSlice = createSlice({
  name: 'devices',
  initialState,
  reducers: {
    // Redux Toolkit allows us to write "mutating" logic in reducers. It
    // doesn't actually mutate the state because it uses the Immer library,
    // which detects changes to a "draft state" and produces a brand new
    // immutable state based off those changes
    selectDevice: (state, {payload}: PayloadAction<Device | null>) => {
      // TODO: set selectedKey to null, but this lives in the keymap slice
      if (!payload) {
        state.selectedDevicePath = null;
      } else {
        state.selectedDevicePath = payload.path;
      }
    },
    validateDevices: (state, {payload}: PayloadAction<Device[]>) => {
      // TODO: is there a better way to do this? what does this even do?
      // TODO: listen to this action and update lighting map in lighting slice accordingly
      // Filter current device data based on current connected devices
      const validatedDeviceMap = payload.reduce((acc: DeviceMap, {path}) => {
        acc[path] = state.rawDeviceMap[path];
        return acc;
      }, {});
      state.rawDeviceMap = validatedDeviceMap;
    },
    updateConnectedDevices: (
      state,
      {payload}: PayloadAction<ConnectedDevices>,
    ) => {
      state.connectedDevices = payload;
    },
  },
});

// This scans for potentially compatible devices, filter out the ones that have the correct protocol
// and then optionally will select the first one if the current selection is non-existent
export const reloadConnectedDevices =
  (): AppThunk => async (dispatch, getState) => {
    const state = getState().devices;

    const recognisedDevices = await getRecognisedDevices(state.supportedIds);

    const protocolVersions = await Promise.all(
      recognisedDevices.map((device) =>
        new KeyboardAPI(device).getProtocolVersion(),
      ),
    );

    const connectedDevices = recognisedDevices.reduce<ConnectedDevices>(
      (devices, device, idx) => {
        const protocol = protocolVersions[idx];
        devices[device.path] = {
          api: new KeyboardAPI(device),
          device,
          protocol,
          requiredDefinitionVersion: protocol >= 10 ? 'v3' : 'v2',
          vendorProductId: getVendorProductId(
            device.vendorId,
            device.productId,
          ),
        };

        return devices;
      },
      {},
    );

    // TODO: get definitions from definition store
    const definitions = getDefinitions(state);
    const missingDefinitions = await Promise.all(
      Object.values(connectedDevices)
        // Check if we already have the required definition in the store
        .filter(({vendorProductId, requiredDefinitionVersion}) => {
          return (
            !definitions ||
            !definitions[vendorProductId] ||
            !definitions[vendorProductId][requiredDefinitionVersion]
          );
        })
        // Go and get it if we don't
        .map(({device, requiredDefinitionVersion}) =>
          getMissingDefinition(device, requiredDefinitionVersion),
        ),
    );

    // TODO: set definitions in definition store
    dispatch(
      updateDefinitions(
        missingDefinitions.reduce<KeyboardDictionary>(
          (p, [definition, version]) => ({
            ...p,
            [definition.vendorProductId]: {
              ...p[definition.vendorProductId],
              [version]: definition,
            },
          }),
          {},
        ),
      ),
    );
  };

export const {selectDevice, updateConnectedDevices, validateDevices} =
  deviceSlice.actions;

export default deviceSlice.reducer;
