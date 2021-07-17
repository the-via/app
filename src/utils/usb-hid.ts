import {HID} from '../shims/node-hid';
import {usbDetect} from '../shims/usb-detection';
export {HID} from '../shims/node-hid';
export {usbDetect} from '../shims/usb-detection';

export type Device = {
  productId: number;
  vendorId: number;
  interface: number;
  usage?: number;
  usagePage?: number;
  path: string;
};

export function scanDevices(): Device[] {
  const devices = HID.devices();
  return devices;
}

export function initDevice({path}: Pick<Device, 'path'>): Device {
  return new HID.HID(path);
}

usbDetect.startMonitoring();
