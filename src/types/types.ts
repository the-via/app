import type {
  DefinitionVersion,
  KeyboardDefinitionIndex,
  KeyboardDictionary,
  LightingValue,
  VIAKey,
  VIAMenu,
} from '@the-via/reader';
import {TestKeyboardSoundsMode} from 'src/components/void/test-keyboard-sounds';

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
  usage: number;
  usagePage: number;
  path: string;
  productName: string;
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
  productName: string;
};
export type ConnectedDevices = {
  [devicePath: string]: ConnectedDevice;
};

export type MacroEditorSettings = {
  recordDelaysEnabled: boolean;
  smartOptimizeEnabled: boolean;
  tapEnterAtEOMEnabled: boolean;
};

export type TestKeyboardSoundsSettings = {
  isEnabled: boolean;
  volume: number;
  waveform: OscillatorType;
  mode: TestKeyboardSoundsMode;
  transpose: number;
};

export type Settings = {
  showDesignTab: boolean;
  disableFastRemap: boolean;
  renderMode: '3D' | '2D';
  themeMode: 'light' | 'dark';
  themeName: string;
  macroEditor: MacroEditorSettings;
  testKeyboardSoundsSettings: TestKeyboardSoundsSettings;
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
