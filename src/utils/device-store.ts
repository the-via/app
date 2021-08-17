import {
  getTheme,
  KeyboardDefinitionIndex,
  VIADefinitionV2,
  VIADefinitionV3,
} from 'via-reader';
import {KeyboardDefinitions, Store, StoreData} from '../shims/electron-store';
import type {Device} from 'src/types/types';
import {getVendorProductId} from './hid-keyboards';
import type {PropertiesOfType, ValueOf} from './generic-types';

export type Settings = {
  allowKeyboardKeyRemapping: boolean;
  showDesignTab: boolean;
  disableFastRemap: boolean;
  disableHardwareAcceleration: boolean;
};

const deviceStore = new Store({
  v2Definitions: {
    generatedAt: -1,
    version: '2.0.0',
    theme: getTheme(),
    vendorProductIds: [],
    definitions: {},
  },
  v3Definitions: {
    generatedAt: -1,
    version: '3.0.0',
    theme: getTheme(),
    vendorProductIds: [],
    definitions: {},
  },
  settings: {
    allowKeyboardKeyRemapping: false,
    showDesignTab: false,
    disableFastRemap: false,
    disableHardwareAcceleration: false,
  },
});

type DefinitionProperties = PropertiesOfType<
  StoreData,
  KeyboardDefinitionIndex
>;

const getDefinitionRoot = <K extends keyof DefinitionProperties>(
  definitionType: K,
) => `/definitions/${definitionType === 'v2Definitions' ? 'v2' : 'v3'}`;

export async function syncStore<K extends keyof DefinitionProperties>(
  definitionType: K,
): Promise<KeyboardDefinitionIndex> {
  const lastJSON = deviceStore.get(definitionType);

  try {
    const devicesURL = `${getDefinitionRoot(
      definitionType,
    )}/supported_kbs.json`;
    const response = await fetch(devicesURL);
    const json = await response.json();

    if (json.generatedAt !== lastJSON.generatedAt) {
      deviceStore.set(definitionType, json);
    }
  } catch (e) {
    console.warn(e);
  }

  return lastJSON;
}

export async function getMissingDefinition<
  K extends keyof DefinitionProperties,
>(definitionType: K, device: Device) {
  const filename = getVendorProductId(device.vendorId, device.productId);
  const url = `${getDefinitionRoot(definitionType)}/${filename}.json`;
  const response = await fetch(url);
  const json: ValueOf<StoreData[K]['definitions']> = await response.json();
  const definition = deviceStore.get(definitionType);
  deviceStore.set(definitionType, {
    ...definition,
    definitions: {...definition.definitions, [filename]: json},
  });
  return json;
}

export const getSupportedIdsFromStore = <K extends keyof DefinitionProperties>(
  definitionType: K,
) => deviceStore.get(definitionType).vendorProductIds;

export const getThemeFromStore = <K extends keyof DefinitionProperties>(
  definitionType: K,
) => deviceStore.get(definitionType).theme;

export function getSettings(): Settings {
  return deviceStore.get('settings');
}

export function setSettings(settings: Settings) {
  return deviceStore.set('settings', settings);
}
