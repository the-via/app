import type {
  DefinitionVersion,
  KeyboardDefinitionIndex,
  KeyboardDictionary,
  LightingValue,
  VIAKey,
  VIAMenu,
} from '@the-via/reader';

export enum TestKeyState {
  Initial,
  KeyDown,
  KeyUp,
}

export type HIDColor = {
  hue: number;
  sat: number;
};

export type LightingData = Partial<{[key in LightingValue]: number[]}> & {
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

export type Keymap = number[];
export type Layer = {
  keymap: Keymap;
  isLoaded: boolean;
};

export type DeviceLayerMap = {[devicePath: string]: Layer[]};

export type WebVIADevice = Device & {
  _device: HIDDevice;
};

export type ConnectedDevice = {
  path: string;
  productId: number;
  vendorId: number;
  vendorProductId: number;
  protocol: number;
  requiredDefinitionVersion: DefinitionVersion;
};
export type ConnectedDevices = {
  [devicePath: string]: ConnectedDevice;
};

export type Key = Pick<
  VIAKey,
  'x' | 'x2' | 'y' | 'y2' | 'w' | 'w2' | 'h' | 'h2' | 'r' | 'rx' | 'ry'
> & {
  c: string;
  t: string;
  selected: boolean;
  macroExpression?: string;
  centerLabel?: string;
  topLabel?: string;
  bottomLabel?: string;
  label?: string;
  id: number;
  ei?: number;
  onClick?: (id: number) => void;
};

export type Settings = {
  allowKeyboardKeyRemapping: boolean;
  showDesignTab: boolean;
  disableFastRemap: boolean;
  renderMode: '3D' | '2D';
  themeMode: 'light' | 'dark';
  themeName: string;
  testKeyboardSoundsEnabled: boolean;
};

export type CommonMenusMap = {
  [menu: string]: VIAMenu[];
};

export type StoreData = {
  definitionIndex: DefinitionIndex;
  definitions: KeyboardDictionary;
  settings: Settings;
};

export type VendorProductIdMap = Record<number, {v2: boolean; v3: boolean}>;

export type DefinitionIndex = Pick<
  KeyboardDefinitionIndex,
  'generatedAt' | 'version' | 'theme'
> & {
  supportedVendorProductIdMap: VendorProductIdMap;
  hash: string;
};

export type EncoderBehavior = [number, number, number];
