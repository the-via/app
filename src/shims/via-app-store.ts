import type {StoreData} from '../types/types';

export default function isObject(val: unknown): val is Object {
  return val != null && typeof val === 'object' && Array.isArray(val) === false;
}

const mergeSettings = (defaults: StoreData, storedSettings: StoreData) => {
  let settings = {...defaults};
  // Merge with 1 level deep
  Object.entries(settings).forEach(([key, val]) => {
    // Top level keys are namespaces
    if (isObject(val) && isObject(storedSettings)) {
      settings[key as keyof StoreData] = {
        ...val,
        ...storedSettings[key as keyof StoreData],
      } as any;
    }
  });
  return settings;
};

export class Store {
  store: StoreData;
  constructor(defaults: StoreData) {
    const store = localStorage.getItem('via-app-store');
    this.store = store ? mergeSettings(JSON.parse(store), defaults) : defaults;
  }
  get<K extends keyof StoreData>(key: K): StoreData[K] {
    return this.store[key];
  }
  set<K extends keyof StoreData>(key: K, value: StoreData[K]) {
    this.store = {
      ...this.store,
      [key]: value,
    };
    localStorage.setItem('via-app-store', JSON.stringify(this.store));
  }
}
