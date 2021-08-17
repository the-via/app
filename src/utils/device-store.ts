import {getTheme, KeyboardDefinitionIndex} from 'via-reader';
import {Store} from '../shims/electron-store';
import type {Device} from 'src/types/types';
import {getVendorProductId} from './hid-keyboards';

export type Settings = {
  allowKeyboardKeyRemapping: boolean;
  showDesignTab: boolean;
  disableFastRemap: boolean;
  disableHardwareAcceleration: boolean;
};

const devicesURL = '/definitions/v2/supported_kbs.json';
const remoteDefaultData: KeyboardDefinitionIndex = {
  generatedAt: -1,
  version: '2.0.0',
  theme: getTheme(),
  vendorProductIds: [],
};
const deviceStore = new Store({
  remoteData: remoteDefaultData,
  settings: {
    allowKeyboardKeyRemapping: false,
    showDesignTab: false,
    disableFastRemap: false,
    disableHardwareAcceleration: false,
  },
});

let lastJSON = deviceStore.get('remoteData');

export async function syncStore() {
  try {
    const response = await fetch(devicesURL);
    const json = await response.json();
    if (json.generatedAt !== lastJSON.generatedAt) {
      lastJSON = json;
      deviceStore.set('remoteData', json);
    }
  } catch (e) {
    console.warn(e);
  }
  return lastJSON;
}

export async function getDefinition(device: Device) {
  const filename = getVendorProductId(device.vendorId, device.productId);
  const url = `/definitions/v2/${filename}.json`;
  const response = await fetch(url);
  const json = await response.json();
  return json;
}

export function getSupportedIdsFromStore() {
  return lastJSON.vendorProductIds;
}

export function getThemeFromStore() {
  return lastJSON.theme;
}

export function getSettings(): Settings {
  return deviceStore.get('settings');
}

export function setSettings(settings: Settings) {
  return deviceStore.set('settings', settings);
}
