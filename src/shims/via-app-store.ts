import type {StoreData} from '../types/types';
import defaultsDeep from 'lodash.defaultsdeep';

export class Store {
  store: StoreData;
  constructor(defaults: StoreData) {
    const store = localStorage.getItem('via-app-store');
    this.store = store ? defaultsDeep(JSON.parse(store), defaults) : defaults;
  }
  get<K extends keyof StoreData>(key: K): StoreData[K] {
    return this.store[key];
  }
  set<K extends keyof StoreData>(key: K, value: StoreData[K]) {
    const newStoreData = {
      ...this.store,
      [key]: {...value},
    };
    this.store = newStoreData;
    // This ends up triggering an error about .get proxy failing for JSON.stringify
    // because it's inside an async function, so we delay it out of that event loop
    setTimeout(() => {
      localStorage.setItem('via-app-store', JSON.stringify(newStoreData));
    }, 0);
  }
}
