import {getTheme} from 'via-reader';
import {Store} from '../shims/electron-store';

export type Settings = {
  allowKeyboardKeyRemapping: boolean;
  showDesignTab: boolean;
  disableFastRemap: boolean;
  disableHardwareAcceleration: boolean;
};

const remoteBaseURL = 'https://www.caniusevia.com';
const devicesURL = new URL('keyboards.v2.json', remoteBaseURL);
const remoteDefaultData = {
  generatedAt: -1,
  definitions: {},
  theme: getTheme()
};
const deviceStore = new Store({
  defaults: {
    remoteData: remoteDefaultData,
    settings: {
      allowKeyboardKeyRemapping: false,
      showDesignTab: false,
      disableFastRemap: false,
      disableHardwareAcceleration: false
    }
  }
});
let lastJSON = deviceStore.get('remoteData');

export async function syncStore() {
  try {
    const response = await fetch(devicesURL.href);
    const json = await response.json();
    if (json.generatedAt !== lastJSON.generatedAt) {
      lastJSON = json;
      deviceStore.set('remoteData', json);
    }
  } catch (e) {
    console.warn(e);
  }
  return lastJSON.remoteData;
}

export function getDevicesFromStore() {
  return lastJSON.definitions;
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
