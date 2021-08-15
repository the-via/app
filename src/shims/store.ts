export let Store: any;

// In an Electron context
if ((globalThis as any).require) {
  Store = (globalThis as any).require('electron-store');
}
// On the web
else {
  Store = class Store {
    store: any;
    constructor(props: any) {
      const store = localStorage.getItem('via-app-store');
      this.store = store ? JSON.parse(store) : props.defaults;
    }
    get(key: string) {
      return this.store[key];
    }
    set(key: string) {
      this.store[key] = arguments[1];
      localStorage.setItem('via-app-store', JSON.stringify(this.store));
    }
  };
}
