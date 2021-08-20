import type {KeyboardAPI} from 'src/utils/keyboard-api';
import type {
  KeyboardDefinitionIndex,
  VIADefinitionV2,
  VIADefinitionV3,
} from 'via-reader';

export type HIDColor = {
  hue: number;
  sat: number;
};

export type LightingData = {
  customColors?: HIDColor[];
};

export type Device = {
  productId: number;
  vendorId: number;
  interface: number;
  usage?: number;
  usagePage?: number;
  path: string;
};

export type WebVIADevice = Device & {
  _device: HIDDevice;
};

export type ConnectedDevice = {
  api: KeyboardAPI;
  device: Device;
  vendorProductId: number;
  protocol: number;
  requiredDefinitionVersion: DefinitionVersion;
};
export type ConnectedDevices = {
  [devicePath: string]: ConnectedDevice;
};

export type Settings = {
  allowKeyboardKeyRemapping: boolean;
  showDesignTab: boolean;
  disableFastRemap: boolean;
  disableHardwareAcceleration: boolean;
};

export type StoreData = {
  definitionIndex: DefinitionIndex;
  definitions: KeyboardDictionary;
  settings: Settings;
};

// TODO: should the following be moved to Reader along with KeyboardDictionary?
export type DefinitionVersionMap = {v2: VIADefinitionV2; v3: VIADefinitionV3};

// Is DefinitionMap a better name?
export type KeyboardDictionary = Record<string, DefinitionVersionMap>;

// Couldn't use an enum because babel uses isolated modules
export type DefinitionVersion =
  keyof KeyboardDictionary[keyof KeyboardDictionary];

export type VendorProductIdMap = Record<number, {v2: boolean; v3: boolean}>;

export type DefinitionIndex = Pick<
  KeyboardDefinitionIndex,
  'generatedAt' | 'version' | 'theme'
> & {
  supportedVendorProductIdMap: VendorProductIdMap;
};
