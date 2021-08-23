import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import type {
  ConnectedDevice,
  ConnectedDevices,
  Device,
  DeviceLayerMap,
  VendorProductIdMap,
} from 'src/types/types';
import {
  getRecognisedDevices,
  getVendorProductId,
} from 'src/utils/hid-keyboards';
import {KeyboardAPI} from 'src/utils/keyboard-api';
import type {AppThunk, RootState} from '.';
import {loadMacros} from './macrosSlice';

export type DevicesState = {
  selectedDevicePath: string | null;
  connectedDevices: ConnectedDevices;
  supportedIds: VendorProductIdMap;
};

const initialState: DevicesState = {
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
    // immutable state based off those change

    // TODO: change to just pass the device path instead of the whole device
    selectDevice: (state, action: PayloadAction<Device | null>) => {
      // TODO: set selectedKey to null, but this lives in the keymap slice
      if (!action.payload) {
        state.selectedDevicePath = null;
      } else {
        state.selectedDevicePath = action.payload.path;
      }
    },
    validateDevices: (state, action: PayloadAction<Device[]>) => {
      // TODO: is there a better way to do this? what does this even do?
      // TODO: listen to this action and update lighting map in lighting and keymap slices accordingly
      // Filter current device data based on current connected devices
      const validatedDeviceMap = action.payload.reduce(
        (acc: DeviceLayerMap, {path}) => {
          acc[path] = state.rawDeviceMap[path];
          return acc;
        },
        {},
      );
      state.rawDeviceMap = validatedDeviceMap;
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
  },
});

export const {
  selectDevice,
  updateConnectedDevices,
  validateDevices,
  updateSupportedIds,
} = deviceSlice.actions;

export default deviceSlice.reducer;

export const selectConnectedDevice =
  (connectedDevice: ConnectedDevice): AppThunk =>
  async (dispatch) => {
    dispatch(selectDevice(connectedDevice.device));
    dispatch(loadMacros(connectedDevice.device));
    dispatch(loadLayoutOptions());

    const {protocol} = connectedDevice;
    if (protocol < 10) {
      dispatch(updateLightingData(connectedDevice.device));
    }
    if (protocol >= 10) {
      dispatch(updateV3MenuData(connectedDevice.device));
    }

    dispatch(loadKeymapFromDevice(connectedDevice));
  };

// This scans for potentially compatible devices, filter out the ones that have the correct protocol
// and then optionally will select the first one if the current selection is non-existent
export const reloadConnectedDevices =
  (): AppThunk => async (dispatch, getState) => {
    const state = getState();
    const selectedDevicePath = getSelectedDevicePath(state);
    const supportedIds = getSupportedIds(state);

    const recognisedDevices = await getRecognisedDevices(supportedIds);

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

    Object.entries(connectedDevices).forEach(([path, d]) => {
      console.info('Setting connected device:', d.protocol, path, d);
    });
    dispatch(updateConnectedDevices(connectedDevices));
    const validDevicesArr = Object.entries(connectedDevices);
    if (
      typeof selectedDevicePath === 'string' &&
      !connectedDevices[selectedDevicePath] &&
      validDevicesArr.length > 0
    ) {
      const firstConnectedDevice = validDevicesArr[0][1];
      dispatch(selectConnectedDevice(firstConnectedDevice));
    } else if (validDevicesArr.length === 0) {
      dispatch(selectDevice(null));
    }

    // // TODO: replace with a call to an action from the definition store
    // const definitions = getDefinitions(state);
    // const missingDefinitions = await Promise.all(
    //   Object.values(connectedDevices)
    //     // Check if we already have the required definition in the store
    //     .filter(({vendorProductId, requiredDefinitionVersion}) => {
    //       return (
    //         !definitions ||
    //         !definitions[vendorProductId] ||
    //         !definitions[vendorProductId][requiredDefinitionVersion]
    //       );
    //     })
    //     // Go and get it if we don't
    //     .map(({device, requiredDefinitionVersion}) =>
    //       getMissingDefinition(device, requiredDefinitionVersion),
    //     ),
    // );

    // // TODO: set definitions in definition store
    // dispatch(
    //   updateDefinitions(
    //     missingDefinitions.reduce<KeyboardDictionary>(
    //       (p, [definition, version]) => ({
    //         ...p,
    //         [definition.vendorProductId]: {
    //           ...p[definition.vendorProductId],
    //           [version]: definition,
    //         },
    //       }),
    //       {},
    //     ),
    //   ),
    // );
  };

export const getSelectedDevicePath = (state: RootState) =>
  state.devices.selectedDevicePath;

export const getSupportedIds = (state: RootState) => state.devices.supportedIds;
