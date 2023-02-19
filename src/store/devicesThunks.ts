// This is conceptually an extension of devicesSlice, but has been separated to remove circular module dependencies between deviceSlice and other slices that import from it

import {
  getDefinitionsFromStore,
  getMissingDefinition,
  getSupportedIdsFromStore,
  syncStore,
} from '../utils/device-store';
import {getRecognisedDevices, getVendorProductId} from '../utils/hid-keyboards';
import {KeyboardAPI} from '../utils/keyboard-api';
import type {AppThunk} from './index';
import {
  reloadDefinitions,
  loadLayoutOptions,
  updateDefinitions,
  getDefinitions,
  getBasicKeyToByte,
  loadStoredCustomDefinitions,
} from './definitionsSlice';
import {loadKeymapFromDevice} from './keymapSlice';
import {updateLightingData} from './lightingSlice';
import {loadMacros} from './macrosSlice';
import {updateV3MenuData} from './menusSlice';
import {
  clearAllDevices,
  getConnectedDevices,
  getSelectedDevicePath,
  getSupportedIds,
  selectDevice,
  updateConnectedDevices,
  updateSupportedIds,
} from './devicesSlice';
import type {ConnectedDevice, ConnectedDevices} from 'src/types/types';
import type {KeyboardDictionary} from '@the-via/reader';
import {createRetry} from 'src/utils/retry';

const selectConnectedDeviceRetry = createRetry(8, 100);

export const selectConnectedDeviceByPath =
  (path: string): AppThunk =>
  async (dispatch, getState) => {
    await dispatch(reloadConnectedDevices());
    const connectedDevice = getConnectedDevices(getState())[path];
    if (connectedDevice) {
      dispatch(selectConnectedDevice(connectedDevice));
    }
  };

const validateDefinitionAvailable = async (
  device: ConnectedDevice,
  definitions: KeyboardDictionary,
) => {
  const definition =
    definitions &&
    definitions[device.vendorProductId] &&
    definitions[device.vendorProductId][device.requiredDefinitionVersion];
  if (!definition) {
    console.log('missing definition: fetching new one');
    await getMissingDefinition(device, device.requiredDefinitionVersion);
  }
};

// TODO: should we change these other thunks to use the selected device state instead of params?
// Maybe not? the nice this about this is we don't have to null check the device
export const selectConnectedDevice =
  (connectedDevice: ConnectedDevice): AppThunk =>
  async (dispatch, getState) => {
    try {
      await validateDefinitionAvailable(
        connectedDevice,
        getDefinitions(getState()),
      );
      dispatch(selectDevice(connectedDevice));
      await dispatch(loadMacros(connectedDevice));
      await dispatch(loadLayoutOptions());

      const {protocol} = connectedDevice;
      if (protocol < 11) {
        await dispatch(updateLightingData(connectedDevice));
      }
      if (protocol >= 11) {
        await dispatch(updateV3MenuData(connectedDevice));
      }

      await dispatch(loadKeymapFromDevice(connectedDevice));
      selectConnectedDeviceRetry.clear();
    } catch (e) {
      console.log('Loading keyboard failed:', e);
      if (selectConnectedDeviceRetry.retriesLeft()) {
        selectConnectedDeviceRetry.retry(() => {
          dispatch(selectConnectedDevice(connectedDevice));
        });
      } else {
        console.log('Hard resetting device store:', e);
        dispatch(clearAllDevices());
      }
    }
  };

// This scans for potentially compatible devices, filter out the ones that have the correct protocol
// and then optionally will select the first one if the current selection is non-existent
export const reloadConnectedDevices =
  (): AppThunk => async (dispatch, getState) => {
    const state = getState();
    const selectedDevicePath = getSelectedDevicePath(state);

    // TODO: should we store in local storage for when offline?
    // Might be worth looking at whole store to work out which bits to store locally
    const supportedIds = getSupportedIds(state);

    const recognisedDevices = await getRecognisedDevices(supportedIds);

    const protocolVersions = await Promise.all(
      recognisedDevices.map((device) =>
        new KeyboardAPI(device.path).getProtocolVersion(),
      ),
    );

    const connectedDevices = recognisedDevices.reduce<ConnectedDevices>(
      (devices, device, idx) => {
        const {path, productId, vendorId} = device;
        const protocol = protocolVersions[idx];
        devices[device.path] = {
          path,
          productId,
          vendorId,
          protocol,
          requiredDefinitionVersion: protocol >= 11 ? 'v3' : 'v2',
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
    await dispatch(reloadDefinitions(connectedDevices));
    // If we haven't chosen a selected device yet and there is a valid device, try that
    if (
      (!selectedDevicePath || !connectedDevices[selectedDevicePath]) &&
      validDevicesArr.length > 0
    ) {
      const firstConnectedDevice = validDevicesArr[0][1];
      dispatch(selectConnectedDevice(firstConnectedDevice));
    } else if (validDevicesArr.length === 0) {
      dispatch(selectDevice(null));
    }
  };

export const loadSupportedIds = (): AppThunk => async (dispatch) => {
  await syncStore();
  dispatch(updateSupportedIds(getSupportedIdsFromStore()));
  dispatch(updateDefinitions(getDefinitionsFromStore()));
  await dispatch(loadStoredCustomDefinitions());
  dispatch(reloadConnectedDevices());
};
