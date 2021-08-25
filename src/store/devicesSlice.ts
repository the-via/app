import {createSelector, createSlice, PayloadAction} from '@reduxjs/toolkit';
import type {
  ConnectedDevice,
  ConnectedDevices,
  Device,
  DeviceLayerMap,
  KeyboardDictionary,
  VendorProductIdMap,
} from 'src/types/types';
import {
  getDefinitionsFromStore,
  getMissingDefinition,
  getSupportedIdsFromStore,
  syncStore,
} from 'src/utils/device-store';
import {
  getRecognisedDevices,
  getVendorProductId,
} from 'src/utils/hid-keyboards';
import {KeyboardAPI} from 'src/utils/keyboard-api';
import type {AppThunk, RootState} from '.';
import {
  getDefinitions,
  loadLayoutOptions,
  updateDefinitions,
} from './definitionsSlice';
import {loadKeymapFromDevice} from './keymapSlice';
import {updateLightingData} from './lightingSlice';
import {loadMacros} from './macrosSlice';
import {updateV3MenuData} from './menusSlice';

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
  },
});

export const {selectDevice, updateConnectedDevices, updateSupportedIds} =
  deviceSlice.actions;

export default deviceSlice.reducer;

export const selectConnectedDeviceByPath =
  (path: string): AppThunk =>
  async (dispatch, getState) => {
    await dispatch(reloadConnectedDevices());
    const connectedDevice = getConnectedDevices(getState())[path];
    if (connectedDevice) {
      dispatch(selectConnectedDevice(connectedDevice));
    }
  };

// TODO: should we change these other thunks to use the selected device state instead of params?
// Maybe not? the nice this about this is we don't have to null check the device
export const selectConnectedDevice =
  (connectedDevice: ConnectedDevice): AppThunk =>
  async (dispatch) => {
    dispatch(selectDevice(connectedDevice));
    dispatch(loadMacros(connectedDevice));
    dispatch(loadLayoutOptions());

    const {protocol} = connectedDevice;
    if (protocol < 10) {
      dispatch(updateLightingData(connectedDevice));
    }
    if (protocol >= 10) {
      dispatch(updateV3MenuData(connectedDevice));
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

    // TODO: replace with a call to an action from the definition store
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

export const loadSupportedIds = (): AppThunk => async (dispatch) => {
  await syncStore();
  dispatch(updateSupportedIds(getSupportedIdsFromStore()));
  dispatch(updateDefinitions(getDefinitionsFromStore()));
  dispatch(reloadConnectedDevices());
};

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
