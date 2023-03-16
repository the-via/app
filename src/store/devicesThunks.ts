// This is conceptually an extension of devicesSlice, but has been separated to remove circular module dependencies between deviceSlice and other slices that import from it

import {
  getDefinitionsFromStore,
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
  getKeycodeDict,
} from './definitionsSlice';
import {loadKeymapFromDevice} from './keymapSlice';
import {updateLightingData} from './lightingSlice';
import {loadMacros} from './macrosSlice';
import {updateV3MenuData} from './menusSlice';
import {
  clearAllDevices,
  getConnectedDevices,
  getForceAuthorize,
  getSelectedDevicePath,
  getSupportedIds,
  selectDevice,
  setForceAuthorize,
  updateConnectedDevices,
  updateSupportedIds,
} from './devicesSlice';
import type {
  AuthorizedDevice,
  ConnectedDevice,
  ConnectedDevices,
  WebVIADevice,
} from 'src/types/types';
import {createRetry} from 'src/utils/retry';
import {extractDeviceInfo, logAppError} from './errorsSlice';
import {tryForgetDevice} from 'src/shims/node-hid';
import {isAuthorizedDeviceConnected} from 'src/utils/type-predicates';

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

// TODO: should we change these other thunks to use the selected device state instead of params?
// Maybe not? the nice this about this is we don't have to null check the device
const selectConnectedDevice =
  (connectedDevice: ConnectedDevice): AppThunk =>
  async (dispatch) => {
    const deviceInfo = extractDeviceInfo(connectedDevice);
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
          logAppError({
            message: 'Loading lighting/menu data failed',
            deviceInfo,
          }),
        );
      }

      // John you drongo, don't trust the compiler, dispatches are totes awaitable for async thunks
      await dispatch(loadKeymapFromDevice(connectedDevice));
      selectConnectedDeviceRetry.clear();
    } catch (e) {
      if (selectConnectedDeviceRetry.retriesLeft()) {
        dispatch(
          logAppError({
            message: 'Loading device failed - retrying',
            deviceInfo,
          }),
        );
        selectConnectedDeviceRetry.retry(() => {
          dispatch(selectConnectedDevice(connectedDevice));
        });
      } else {
        dispatch(
          logAppError({
            message: 'All retries failed for attempting connection with device',
            deviceInfo,
          }),
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
    const forceRequest = getForceAuthorize(state);

    // TODO: should we store in local storage for when offline?
    // Might be worth looking at whole store to work out which bits to store locally
    const supportedIds = getSupportedIds(state);

    const recognisedDevices = await getRecognisedDevices(
      supportedIds,
      forceRequest,
    );

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
      recognisedDevicesWithBadProtocol.forEach((device: WebVIADevice) => {
        const deviceInfo = extractDeviceInfo(device);
        dispatch(
          logAppError({
            message: 'Received invalid protocol version from device',
            deviceInfo,
          }),
        );
      });
    }

    const authorizedDevices: AuthorizedDevice[] = recognisedDevices
      .filter((_, i) => protocolVersions[i] !== -1)
      .map((device, idx) => {
        const {path, productId, vendorId, productName} = device;
        const protocol = protocolVersions[idx];
        return {
          path,
          productId,
          vendorId,
          protocol,
          productName,
          hasResolvedDefinition: false,
          requiredDefinitionVersion: protocol >= 11 ? 'v3' : 'v2',
          vendorProductId: getVendorProductId(
            device.vendorId,
            device.productId,
          ),
        };
      });

    await dispatch(reloadDefinitions(authorizedDevices));

    const newDefinitions = getDefinitions(getState());
    const connectedDevices = authorizedDevices
      .filter((device, i) =>
        isAuthorizedDeviceConnected(device, newDefinitions),
      )
      .reduce<ConnectedDevices>((devices, device, idx) => {
        devices[device.path] = {
          ...device,
          hasResolvedDefinition: true,
        };
        return devices;
      }, {});

    // Remove authorized devices that we could not find definitions for
    authorizedDevices
      .filter((device) => !isAuthorizedDeviceConnected(device, newDefinitions))
      .forEach(tryForgetDevice);

    const validDevicesArr = Object.entries(connectedDevices);
    validDevicesArr.forEach(([path, d]) => {
      console.info('Setting connected device:', d.protocol, path, d);
    });
    dispatch(updateConnectedDevices(connectedDevices));

    // John you drongo, don't trust the compiler, dispatches are totes awaitable for async thunks
    // If we haven't chosen a selected device yet and there is a valid device, try that
    if (
      (!selectedDevicePath || !connectedDevices[selectedDevicePath]) &&
      validDevicesArr.length > 0
    ) {
      const firstConnectedDevice = validDevicesArr[0][1];

      dispatch(selectConnectedDevice(firstConnectedDevice));
    } else if (validDevicesArr.length === 0) {
      dispatch(selectDevice(null));
      dispatch(setForceAuthorize(true));
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
