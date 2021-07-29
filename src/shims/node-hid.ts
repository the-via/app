import type {WebVIADevice} from '../types';
// This is a bit cray
const globalBuffer: {[path: string]: ArrayBuffer[]} = {};
const eventWaitBuffer: {[path: string]: ((a: Uint8Array) => void)[]} = {};
const filterHIDDevices = (devices: HIDDevice[]) =>
  devices.filter((device) =>
    device.collections?.some(
      (collection) =>
        collection.usage === 0x61 && collection.usagePage === 0xff60,
    ),
  );
const ExtendedHID = {
  _cache: {} as {[key: string]: any},
  requestDevices: async () => {
    await navigator.hid.requestDevice({
      filters: [
        {
          usagePage: 0xff60,
          usage: 0x61,
        },
      ],
    });
  },
  getFilteredDevices: async () => {
    return filterHIDDevices(await navigator.hid.getDevices());
  },
  devices: async () => {
    let devices = await ExtendedHID.getFilteredDevices();
    // TODO: This is a hack to avoid spamming the requestDevices popup
    if (devices.length === 0) {
      await ExtendedHID.requestDevices();
      devices = await ExtendedHID.getFilteredDevices();
    }
    return devices.map((device) => {
      // This is super important in order to have a stable way to identify the same device
      // that was already scanned. It's a bit hacky but https://github.com/WICG/webhid/issues/7
      // ¯\_(ツ)_/¯
      const path = (device as any).__path || `via-path:${Math.random()}`;
      (device as any).__path = path;
      const HIDDevice = {
        _device: device,
        usage: 0x61,
        usagePage: 0xff60,
        interface: 0x0001,
        vendorId: device.vendorId ?? -1,
        productId: device.productId ?? -1,
        path,
      };
      return (ExtendedHID._cache[path] = HIDDevice);
    });
  },
  HID: class HID {
    _hidDevice?: WebVIADevice;
    usage: number = -1;
    usagePage: number = -1;
    interface: number = -1;
    vendorId: number = -1;
    productId: number = -1;
    path: string = '';
    openPromise: Promise<void> = Promise.resolve();
    constructor(path: string) {
      this._hidDevice = ExtendedHID._cache[path];
      // TODO: seperate open attempt from constructor as it's async
      // Attempt to connect to the device

      if (this._hidDevice) {
        this.vendorId = this._hidDevice.vendorId;
        this.productId = this._hidDevice.productId;
        this.path = this._hidDevice.path;
        this.usage = this._hidDevice.usage ?? this.usage;
        this.usagePage = this._hidDevice.usagePage ?? this.usagePage;
        this.interface = this._hidDevice.interface;
        globalBuffer[this.path] = globalBuffer[this.path] || [];
        eventWaitBuffer[this.path] = eventWaitBuffer[this.path] || [];
        if (!this._hidDevice._device.opened) {
          this.open();
        }
      } else {
        throw new Error('Missing hid device in cache');
      }
    }
    async open() {
      if (this._hidDevice && !this._hidDevice._device.opened) {
        this.openPromise = this._hidDevice._device.open();
        this.setupListeners();
        await this.openPromise;
      }
      return Promise.resolve();
    }
    setupListeners() {
      if (this._hidDevice) {
        this._hidDevice._device.addEventListener('inputreport', (e) => {
          if (eventWaitBuffer[this.path].length !== 0) {
            (eventWaitBuffer[this.path].shift() as any)(
              new Uint8Array(e.data.buffer),
            );
          } else {
            globalBuffer[this.path].push(new Uint8Array(e.data.buffer));
          }
        });
      }
    }

    read(fn: (err?: Error, data?: ArrayBuffer) => void) {
      if (globalBuffer[this.path].length > 0) {
        fn(undefined, globalBuffer[this.path].shift() as any);
      } else {
        eventWaitBuffer[this.path].push((data) => fn(undefined, data));
      }
    }
    async write(arr: number[]) {
      await this.openPromise;
      const data = new Uint8Array(arr.slice(1));
      await this._hidDevice?._device.sendReport(0, data);
    }
  },
};

export const HID = ExtendedHID;
