import type {
  KeyboardDefinitionIndex,
  VIADefinitionV2,
  VIADefinitionV3,
} from 'via-reader';

export type Settings = {
  allowKeyboardKeyRemapping: boolean;
  showDesignTab: boolean;
  disableFastRemap: boolean;
  disableHardwareAcceleration: boolean;
};

export type KeyboardDefinitions<T extends VIADefinitionV2 | VIADefinitionV3> =
  KeyboardDefinitionIndex & {
    definitions: Record<number, T>;
  };

export type StoreData = {
  v2Definitions: KeyboardDefinitions<VIADefinitionV2>;
  v3Definitions: KeyboardDefinitions<VIADefinitionV3>;
  settings: Settings;
};
export class Store {
  store: StoreData;
  constructor(defaults: StoreData) {
    const store = localStorage.getItem('electronStore');
    this.store = store ? JSON.parse(store) : defaults;
  }
  get<K extends keyof StoreData>(key: K): StoreData[K] {
    return this.store[key];
  }
  set<K extends keyof StoreData>(key: K, value: StoreData[K]) {
    this.store = {
      ...this.store,
      [key]: value,
    };
    localStorage.setItem('electronStore', JSON.stringify(this.store));
  }
}
