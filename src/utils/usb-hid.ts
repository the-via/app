import {HID} from '../shims/node-hid';
import {usbDetect} from '../shims/usb-detection';
import type {Device, WebVIADevice} from '../types/types';

export {HID} from '../shims/node-hid';
export {usbDetect} from '../shims/usb-detection';

export async function scanDevices(): Promise<WebVIADevice[]> {
  return HID.devices();
}

// TODO: fix typing. This actually returns a HID object, but it complains if you type it as such.
export function initAndConnectDevice({path}: Pick<Device, 'path'>): Device {
  const device = new HID.HID(path);
  return device;
}

export function startMonitoring() {
  usbDetect.startMonitoring();
}
