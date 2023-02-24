import {VIADefinitionV2, VIADefinitionV3, VIAKey} from '@the-via/reader';
import {TestKeyState} from 'src/types/types';

export enum DisplayMode {
  Test = 1,
  Configure = 2,
  Design = 3,
  ConfigureColors = 4,
}

export type NDimension = '2D' | '3D';

export type KeyboardCanvasContentProps<T> = {
  selectable: boolean;
  matrixKeycodes: number[];
  keys: (VIAKey & {ei?: number})[];
  definition: VIADefinitionV2 | VIADefinitionV3;
  pressedKeys?: TestKeyState[];
  mode: DisplayMode;
  showMatrix?: boolean;
  selectedKey?: number;
  keyColors?: number[][];
  onKeycapPointerDown?: (e: T, idx: number) => void;
  onKeycapPointerOver?: (e: T, idx: number) => void;
  width: number;
  height: number;
};

export type KeyboardCanvasProps<T> = Omit<
  KeyboardCanvasContentProps<T>,
  'width' | 'height'
> & {
  shouldHide?: boolean;
  containerDimensions: DOMRect;
};
