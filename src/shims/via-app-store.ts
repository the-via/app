import type {StoreData} from '../types/types';

export class Store {
  store: StoreData;
  constructor(defaults: StoreData) {
    const store = localStorage.getItem('via-app-store');
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
    localStorage.setItem('via-app-store', JSON.stringify(this.store));
  }
}
