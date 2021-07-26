import type {WebVIADevice} from '../types';
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
  devices: async () => {
    let devices = await navigator.hid.getDevices();
    // TODO: This is a hack to avoid spamming the requestDevices popup
    if (devices.length === 0) {
      await ExtendedHID.requestDevices();
      devices = await navigator.hid.getDevices();
    }
    return devices.map((device) => {
      const HIDDevice = {
        _device: device,
        usage: 0x61,
        usagePage: 0xff60,
        interface: 0x0001,
        vendorId: device.vendorId ?? -1,
        productId: device.productId ?? -1,
        path: `${Math.random()}`,
      };
      return (ExtendedHID._cache[HIDDevice.path] = HIDDevice);
    });
  },
  HID: class HID {
    _hidDevice?: WebVIADevice;
    _buffer: ArrayBuffer[] = [];
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
        await this.openPromise;
        this._hidDevice._device.addEventListener('inputreport', (e) => {
          this._buffer.push(new Uint8Array(e.data.buffer));
        });
      }
      return Promise.resolve();
    }
    async read(fn: (err?: Error, data?: ArrayBuffer) => void) {
      if (this._buffer.length > 0) {
        fn(undefined, this._buffer.shift());
      } else {
        await new Promise((res, rej) => {
          const once = () => {
            this._hidDevice?._device.removeEventListener('inputreport', once);
            res(undefined);
          };
          this._hidDevice?._device.addEventListener('inputreport', once);
        });
        fn(undefined, this._buffer.shift());
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
