import type {KeyboardDictionary} from 'src/types';
import type {ThemeDefinition} from 'via-reader';

export type RemoteData = {
  generatedAt: number;
  definitions: KeyboardDictionary;
  theme: ThemeDefinition;
};

export type Settings = {
  allowKeyboardKeyRemapping: boolean;
  showDesignTab: boolean;
  disableFastRemap: boolean;
  disableHardwareAcceleration: boolean;
};

export type StoreData = {
  remoteData: RemoteData;
  settings: Settings;
};

// Under what circumstance does the following evalutate to true?

// export let Store: any;
// if ((globalThis as any).require) {
//   Store = (globalThis as any).require('electron-store');
// } else {
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
// }
