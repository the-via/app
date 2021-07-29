import {HID} from '../shims/node-hid';
import {usbDetect} from '../shims/usb-detection';
import type {Device} from '../types';

export {HID} from '../shims/node-hid';
export {usbDetect} from '../shims/usb-detection';

export async function scanDevices(): Promise<Device[]> {
  return HID.devices();
}

export function initAndConnectDevice({path}: Pick<Device, 'path'>): Device {
  const device = new HID.HID(path);
  return device;
}

export function startMonitoring() {
  usbDetect.startMonitoring();
}
