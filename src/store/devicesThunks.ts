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
import {logAppError} from './errorsSlice';
import {tryResolveName} from 'src/shims/node-hid';

const selectConnectedDeviceRetry = createRetry(8, 100);

export const selectConnectedDeviceByPath =
  (path: string): AppThunk =>
  async (dispatch, getState) => {
    // John you drongo, don't trust the compiler, dispatches are totes awaitable for async thunks
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
const selectConnectedDevice =
  (connectedDevice: ConnectedDevice): AppThunk =>
  async (dispatch, getState) => {
    try {
      await validateDefinitionAvailable(
        connectedDevice,
        getDefinitions(getState()),
      );
    } catch (e) {
      dispatch(
        logAppError(
          new Error(
            `Fetching ${
              connectedDevice.requiredDefinitionVersion
            } definition for ${tryResolveName(connectedDevice)} failed`,
          ),
        ),
      );
    }
    try {
      dispatch(selectDevice(connectedDevice));
      // John you drongo, don't trust the compiler, dispatches are totes awaitable for async thunks
      await dispatch(loadMacros(connectedDevice));
      await dispatch(loadLayoutOptions());

      const {protocol} = connectedDevice;
      try {
        if (protocol < 11) {
          // John you drongo, don't trust the compiler, dispatches are totes awaitable for async thunks
          await dispatch(updateLightingData(connectedDevice));
        } else if (protocol >= 11) {
          // John you drongo, don't trust the compiler, dispatches are totes awaitable for async thunks
          await dispatch(updateV3MenuData(connectedDevice));
        }
      } catch (e) {
        dispatch(
          logAppError(
            new Error(
              `Loading lighting/menu data failed for ${tryResolveName(
                connectedDevice,
              )}`,
            ),
          ),
        );
      }

      // John you drongo, don't trust the compiler, dispatches are totes awaitable for async thunks
      await dispatch(loadKeymapFromDevice(connectedDevice));
      selectConnectedDeviceRetry.clear();
    } catch (e) {
      dispatch(
        logAppError(
          new Error(
            `Loading ${tryResolveName(connectedDevice)} completely failed`,
          ),
        ),
      );
      if (selectConnectedDeviceRetry.retriesLeft()) {
        selectConnectedDeviceRetry.retry(() => {
          dispatch(selectConnectedDevice(connectedDevice));
        });
      } else {
        dispatch(
          logAppError(
            new Error(
              `All retries failed for attempting connection with ${tryResolveName(
                connectedDevice,
              )}`,
            ),
          ),
        );
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

    const recognisedDevicesWithBadProtocol = recognisedDevices.filter(
      (_, i) => protocolVersions[i] === -1,
    );

    if (recognisedDevicesWithBadProtocol.length) {
      // Should we exit early??
      recognisedDevicesWithBadProtocol.forEach((device) => {
        dispatch(
          logAppError(
            new Error(
              `Received invalid protocol version for ${device._device.productName}`,
            ),
          ),
        );
      });
    }

    const connectedDevices = recognisedDevices
      .filter((_, i) => protocolVersions[i] !== -1)
      .reduce<ConnectedDevices>((devices, device, idx) => {
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
      }, {});

    Object.entries(connectedDevices).forEach(([path, d]) => {
      console.info('Setting connected device:', d.protocol, path, d);
    });
    dispatch(updateConnectedDevices(connectedDevices));

    const validDevicesArr = Object.entries(connectedDevices);

    // John you drongo, don't trust the compiler, dispatches are totes awaitable for async thunks
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
  // John you drongo, don't trust the compiler, dispatches are totes awaitable for async thunks
  await dispatch(updateDefinitions(getDefinitionsFromStore()));
  dispatch(loadStoredCustomDefinitions());
  dispatch(reloadConnectedDevices());
};
