import {getBoundingBox, KeyColorType, Result, VIAKey} from '@the-via/reader';
import partition from 'lodash.partition';
import {Color} from 'three';
import {getThemeFromStore} from './device-store';

export type KeyColorPair = {
  c: string;
  t: string;
};

export const CSSVarObject = {
  keyWidth: 52,
  keyXSpacing: 2,
  keyHeight: 54,
  keyYSpacing: 2,
  keyXPos: 52 + 2,
  keyYPos: 54 + 2,
};

export const KeycapMetric = {
  keyWidth: 18.1,
  keyXSpacing: 1.05,
  keyHeight: 18.1,
  keyYSpacing: 1.05,
  keyXPos: 19.15,
  keyYPos: 19.15,
};

export function calculatePointPosition({
  x = 0,
  y = 0,
  r = 0,
  rx = 0,
  ry = 0,
  w = 0,
  h = 0,
}: VIAKey) {
  // We express the radians in counter-clockwise form, translate the point by the origin, rotate it, then reverse the translation
  const rRadian = (r * (2 * Math.PI)) / 360;
  const cosR = Math.cos(rRadian);
  const sinR = Math.sin(rRadian);
  const originX = CSSVarObject.keyXPos * rx;
  const originY = CSSVarObject.keyYPos * ry;
  const xPos =
    CSSVarObject.keyXPos * x +
    (w * CSSVarObject.keyWidth) / 2 +
    ((w - 1) * CSSVarObject.keyXSpacing) / 2;
  const yPos =
    CSSVarObject.keyYPos * y +
    (h * CSSVarObject.keyHeight) / 2 +
    ((h - 1) * CSSVarObject.keyYSpacing) / 2;
  const transformedXPos =
    xPos * cosR - yPos * sinR - originX * cosR + originY * sinR + originX;
  const transformedYPos =
    xPos * sinR + yPos * cosR - originX * sinR - originY * cosR + originY;

  return [transformedXPos, transformedYPos];
}

/*
 * This algorithm is meant to sort the keys in a visual left to right, top to down,
 * taking into consideration keys that could be above or below the key within a range of less than a key >.>
 * It's tricky though, one possible visual order is:
 *           _______
 *          |       |
 *  _______ |   2   | _______
 * |       ||_______||       |
 * |   1   | _______ |   4   | _______
 * |_______||       ||_______||       |
 *          |   3   | _______ |   6   |
 *          |_______||       ||_______|
 *                   |   5   |
 *                   |_______|
 * Another is:
 *           _______
 *          |       |
 *  _______ |   2   | _______
 * |       ||_______||       |
 * |   1   | _______ |   3   | _______
 * |_______||       ||_______||       |
 *          |   5   | _______ |   4   |
 *          |_______||       ||_______|
 *                   |   6   |
 *                   |_______|
 * and yet another:
 *           _______
 *          |       |
 *  _______ |   1   | _______
 * |       ||_______||       |
 * |   4   | _______ |   2   | _______
 * |_______||       ||_______||       |
 *          |   5   | _______ |   3   |
 *          |_______||       ||_______|
 *                   |   6   |
 *                   |_______|
 */
const sortByX = (a: VIAKey, b: VIAKey) => {
  const aPoint = calculatePointPosition(a);
  const bPoint = calculatePointPosition(b);
  return aPoint[0] - bPoint[0];
};

const sortByYX = (a: VIAKey, b: VIAKey) => {
  const aPoint = calculatePointPosition(a);
  const bPoint = calculatePointPosition(b);
  return aPoint[1] - bPoint[1] === 0
    ? aPoint[0] - bPoint[0]
    : aPoint[1] - bPoint[1];
};

const withinChain = (a: VIAKey, b: VIAKey) => {
  const aPoint = calculatePointPosition(a);
  const bPoint = calculatePointPosition(b);

  const yDiff = Math.abs(aPoint[1] - bPoint[1]);
  // Fudging factor
  return yDiff < CSSVarObject.keyYPos * 0.9;
};

const getTraversalOrder = (arr: VIAKey[]): VIAKey[] => {
  const [car, ...cdr] = [...arr].sort(sortByYX);
  if (car === undefined) {
    return cdr;
  } else {
    const [chain, rest] = partition([...arr], (a) => withinChain(car, a));
    return [...chain.sort(sortByX), ...getTraversalOrder(rest)];
  }
};
export const widthProfiles = {
  1: [1, 2, 3, 4],
  1.25: [4],
  1.5: [2, 4],
  1.75: [3, 4],
  2: [1, 4],
  2.25: [3, 4],
  2.75: [4],
  3: [4],
  6.25: [4],
  7: [4],
};
export const getRowProfiles = (partitionedKeys: VIAKey[][]) => {
  const allUniformR1 = !partitionedKeys.some((kArr) =>
    kArr.some((k) => k.w !== 1 || k.h !== 1),
  );
  console.log(partitionedKeys, allUniformR1);
  switch (allUniformR1 || partitionedKeys.length) {
    case 6: {
      return [1, 1, 2, 3, 4, 4];
    }
    case 5: {
      return [1, 2, 3, 4, 4];
    }
    case 4: {
      return [2, 3, 4, 4];
    }
    case 3: {
      return [2, 3, 4];
    }
    default: {
      return Array(partitionedKeys.length).fill(1);
    }
  }
};

export const getKeyboardRowPartitions = (
  keys: VIAKey[],
): {
  rowMap: {[id: string]: number};
  partitionedKeys: VIAKey[][];
} => {
  const {partitionedKeys} = getTraversalOrder(keys).reduce(
    ({prevX, partitionedKeys}, k) => {
      const [x] = calculatePointPosition(k);
      if (prevX >= x) {
        partitionedKeys.push([]);
      }
      partitionedKeys[partitionedKeys.length - 1].push(k);
      return {partitionedKeys, prevX: x};
    },
    {partitionedKeys: [] as VIAKey[][], prevX: Infinity},
  );
  return {
    rowMap: {},
    partitionedKeys,
  };
};

// TODO: This code is shared across components, move to shared module?
export const getNextKey = (
  currIndex: number,
  keys: VIAKey[],
): number | null => {
  const currKey = keys[currIndex];
  const sortedKeys = getTraversalOrder([...keys]);
  const sortedIndex = sortedKeys.indexOf(currKey);
  return sortedIndex === sortedKeys.length - 1
    ? null
    : keys.indexOf(sortedKeys[(sortedIndex + 1) % sortedKeys.length]);
};

const theme = getThemeFromStore();

const srgbTheme = Object.entries(theme).reduce((p, [key, colorPair]) => {
  const c = `#${new Color(colorPair.c).convertSRGBToLinear().getHexString()}`;
  const t = `#${new Color(colorPair.t).convertSRGBToLinear().getHexString()}`;
  return {...p, [key]: {c, t}};
}, {}) as ReturnType<typeof getThemeFromStore>;

export const getColors = ({color}: {color: KeyColorType}): KeyColorPair => {
  return theme[color];
};

export const getTextureColors = ({
  color,
}: {
  color: KeyColorType;
}): KeyColorPair => {
  return srgbTheme[color];
};

export const calculateKeyboardFrameDimensions = (keys: Partial<Result>[]) => {
  const boundingBoxes = keys.map(getBoundingBox as any) as any[];
  const minX = Math.min(...boundingBoxes.map((b) => b.xStart));
  const minY = Math.min(...boundingBoxes.map((b) => b.yStart));
  const width = Math.max(...boundingBoxes.map((b) => b.xEnd)) - minX;
  const height = Math.max(...boundingBoxes.map((b) => b.yEnd)) - minY;
  return {
    width,
    height,
  };
};
