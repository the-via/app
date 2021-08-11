import type {VIADefinitionV2, VIADefinitionV3} from 'via-reader';

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

export type VendorProductId = number;

export enum KeyColorType {
  Alpha = 'alpha',
  Mod = 'mod',
  Accent = 'accent',
}

export enum LightingTypeDefinition {
  None = 'none',
  QMKLighting = 'qmk_backlight',
  WTRGBBacklight = 'wt_rgb_backlight',
  WTMonoBacklight = 'wt_mono_backlight',
}

export type KeyDefinition = {
  row: number;
  col: number;
  x: number;
  y: number;
  r: number;
  rx: number;
  ry: number;
  h: number;
  w: number;
  color: KeyColorType;
};

export type KeyboardLayout = {
  width: number;
  height: number;
  keys: KeyDefinition[];
};

export type MatrixInfo = {
  rows: number;
  cols: number;
};

export type KeyboardDefinition = {
  name: string;
  lighting: LightingTypeDefinition;
  matrix: MatrixInfo;
  layouts: {
    [key: string]: KeyboardLayout;
  };
  vendorProductId: VendorProductId;
};

export type KeyboardDictionary = {
  [key: string]: VIADefinitionV2 | VIADefinitionV3;
};

export type KeyboardLibrary = {
  version: string;
  generatedAt: number;
  definitions: KeyboardDictionary;
};
