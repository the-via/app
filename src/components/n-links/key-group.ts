import {VIADefinitionV2, VIADefinitionV3, VIAKey} from '@the-via/reader';
import {useAppDispatch} from 'src/store/hooks';
import {updateSelectedKey} from 'src/store/keymapSlice';
import {TestKeyState} from 'src/types/types';
import {getByteToKey} from 'src/utils/key';
import {getBasicKeyDict} from 'src/utils/key-to-byte/dictionary-store';
import {
  calculatePointPosition,
  getKeyboardRowPartitions,
  getKeyId,
  getLabel,
  getMeshName,
  getScale,
  KeycapMetric,
} from 'src/utils/keyboard-rendering';
import {DisplayMode} from './types';

export type KeyGroupProps<T> = {
  selectable?: boolean;
  keys: VIAKey[];
  matrixKeycodes: number[];
  definition: VIADefinitionV2 | VIADefinitionV3;
  mode: DisplayMode;
  pressedKeys?: TestKeyState[];
  keyColors?: number[][];
  selectedKey?: number;
  onKeycapPointerDown?: (e: T, idx: number) => void;
  onKeycapPointerOver?: (e: T, idx: number) => void;
};

export type KeysKeys<T> = {
  indices: string[];
  coords: {
    position: [number, number, number];
    rotation: [number, number, number];
    scale: [number, number, number];
    color: {c: string; t: string};
    meshKey: string;
    idx: number;
    onClick: (e: T, idx: number) => void;
    onPointerDown?: (e: T, idx: number) => void;
    onPointerOver?: (e: T, idx: number) => void;
  }[];
};

export function getKeycapSharedProps<T>(
  k: VIAKey,
  i: number,
  props: KeyGroupProps<T>,
  keysKeys: KeysKeys<T>,
  selectedKeyIndex: number | null,
  labels: any[],
) {
  const {
    position,
    rotation,
    scale,
    color,
    idx,
    onClick,
    onPointerDown,
    onPointerOver,
  } = keysKeys.coords[i];
  const key = keysKeys.indices[i];
  const isEncoder = k['ei'] !== undefined;
  return {
    mode: props.mode,
    key: key,
    position: position,
    rotation: rotation,
    scale: getScale(k, scale),
    textureWidth: k.w,
    textureHeight: k.h,
    textureOffsetX: !!k.w2 ? Math.abs(k.w2 - k.w) : 0,
    color: color,
    shouldRotate: isEncoder,
    onPointerDown: onPointerDown,
    onPointerOver: onPointerOver,
    keyState: props.pressedKeys ? props.pressedKeys[i] : -1,
    disabled: !props.selectable,
    selected: i === selectedKeyIndex,
    idx: idx,
    label: labels[i],
    onClick: onClick,
  };
}

export const getKeysKeysIndices =
  (vendorProductId: number) => (k: VIAKey, i: number) => {
    const isEncoder = k['ei'] !== undefined;
    return `${vendorProductId}-${i}-${k.w}-${k.h}-${isEncoder}`;
  };

export function getLabels<T>(
  props: KeyGroupProps<T>,
  macroExpressions: string[],
  basicKeyToByte: ReturnType<typeof getBasicKeyDict>,
  byteToKey: ReturnType<typeof getByteToKey>,
) {
  return !props.matrixKeycodes.length
    ? []
    : props.keys.map((k, i) =>
        getLabel(
          props.matrixKeycodes[i],
          k.w,
          macroExpressions,
          props.definition,
          basicKeyToByte,
          byteToKey,
        ),
      );
}

export function getKeysKeys<T>(
  props: KeyGroupProps<T>,
  keyColorPalette: any,
  dispatch: ReturnType<typeof useAppDispatch>,
  getPosition: (x: number, y: number) => [number, number, number],
): KeysKeys<T> {
  const {keys} = props;
  const {rowMap} = getKeyboardRowPartitions(keys);
  return {
    indices: keys.map(getKeysKeysIndices(props.definition.vendorProductId)),
    coords: keys.map((k, i) => {
      // x & y are pixel positioned
      const [x, y] = calculatePointPosition(k);
      const r = (k.r * (2 * Math.PI)) / 360;
      // The 1.05mm in-between keycaps but normalized by a keycap width/height
      const normalizedKeyXSpacing =
        KeycapMetric.keyXSpacing / KeycapMetric.keyWidth;
      const normalizedKeyYSpacing =
        KeycapMetric.keyYSpacing / KeycapMetric.keyHeight;
      const normalizedWidth =
        (1 + normalizedKeyXSpacing) * (k.w2 || k.w) - normalizedKeyXSpacing;
      const normalizedHeight =
        k.h * (1 + normalizedKeyYSpacing) - normalizedKeyYSpacing;
      const meshKey = getMeshName(k, rowMap[getKeyId(k)], false);
      const paletteKey = props.keyColors ? i : k.color;
      const color = (keyColorPalette as any)[paletteKey];

      return {
        position: getPosition(x, y),
        rotation: [0, 0, -r],
        scale: [normalizedWidth, normalizedHeight, 1],
        color,
        meshKey,
        idx: i,
        onClick: (evt: any, idx: number) => {
          evt.stopPropagation();
          dispatch(updateSelectedKey(idx));
        },
        onPointerDown: props.onKeycapPointerDown,
        onPointerOver: props.onKeycapPointerOver,
      };
    }),
  };
}
