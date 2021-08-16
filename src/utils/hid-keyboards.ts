import type {Device, KeyboardDictionary} from '../types/types';
import {canConnect} from './keyboard-api';
import {scanDevices} from './usb-hid';

//const IS_OSX = require('os').platform() === 'darwin';
const IS_OSX = false;

function isValidInterface(device: Device) {
  return IS_OSX ? isValidUsage(device) : isValidInterfaceNonOSX(device);
}

function isValidInterfaceNonOSX(device: Device) {
  const VALID_INTERFACE_IDS = [0x0001];
  return VALID_INTERFACE_IDS.includes(device.interface);
}

function isValidUsage({usage = -1, usagePage = -1}: Device) {
  const VALID_USAGE_IDS = [0x0061];
  const VALID_USAGE_PAGE_IDS = [0xff60];
  return (
    VALID_USAGE_IDS.includes(usage) && VALID_USAGE_PAGE_IDS.includes(usagePage)
  );
}

export function getVendorProductId(vendorId: number, productId: number) {
  // JS bitwise operations is only 32-bit so we lose numbers if we shift too high
  return vendorId * 65536 + productId;
}

function definitionExists(
  {productId, vendorId}: Device,
  definitions: KeyboardDictionary,
) {
  return definitions[getVendorProductId(vendorId, productId)] !== undefined;
}

function idExists({productId, vendorId}: Device, ids: number[]) {
  return ids.includes(getVendorProductId(vendorId, productId));
}

export async function getMissingDevicesUsingDefinitions(
  definitions: KeyboardDictionary,
  ids: number[],
): Promise<Device[]> {
  const usbDevices = await scanDevices();
  return usbDevices.filter((device: Device) => {
    const validVendorProduct = idExists(device, ids);
    const definitionLoaded = definitionExists(device, definitions);
    const validInterface = isValidInterface(device);
    // attempt connection
    return (
      validVendorProduct &&
      validInterface &&
      !definitionLoaded &&
      canConnect(device)
    );
  });
}
export async function getDevicesUsingDefinitions(
  definitions: KeyboardDictionary,
): Promise<Device[]> {
  const usbDevices = await scanDevices();
  return usbDevices.filter((device: Device) => {
    const validVendorProduct = definitionExists(device, definitions);
    const validInterface = isValidInterface(device);
    // attempt connection
    return validVendorProduct && validInterface && canConnect(device);
  });
}
