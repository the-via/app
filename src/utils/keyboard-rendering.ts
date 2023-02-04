import {
  getBoundingBox,
  KeyColorType,
  Result,
  ThemeDefinition,
  VIADefinitionV2,
  VIADefinitionV3,
  VIAKey,
} from '@the-via/reader';
import partition from 'lodash.partition';
import {Color} from 'three';
import {getThemeFromStore} from './device-store';
import {
  getLabelForByte,
  getShortNameForKeycode,
  getCustomKeycodeIndex,
  IKeycode,
  isAlpha,
  isNumpadNumber,
  isNumpadSymbol,
  isMultiLegend,
  isMacro,
  isCustomKeycodeByte,
  isArrowKey,
} from './key';

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
  x2 = 0,
  y = 0,
  r = 0,
  rx = 0,
  ry = 0,
  w = 0,
  w2 = 0,
  h = 0,
}: VIAKey) {
  // We express the radians in counter-clockwise form, translate the point by the origin, rotate it, then reverse the translation
  const rRadian = (r * (2 * Math.PI)) / 360;
  const cosR = Math.cos(rRadian);
  const sinR = Math.sin(rRadian);
  const originX = CSSVarObject.keyXPos * rx;
  const originY = CSSVarObject.keyYPos * ry;
  const xPos =
    CSSVarObject.keyXPos * (x + x2) +
    (Math.max(w2, w) * CSSVarObject.keyWidth) / 2 +
    ((Math.max(w2, w) - 1) * CSSVarObject.keyXSpacing) / 2;
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
export const widthProfiles: {[a: number]: number[]} = {
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

// Return requested row if key exists, else assume spacebar
const getRowForKey = (k: VIAKey, suggestedRow: number) => {
  // vertical keys
  if (k.h !== 1) {
    return suggestedRow;
  }
  return widthProfiles[k.w]
    ? widthProfiles[k.w].includes(suggestedRow)
      ? suggestedRow
      : widthProfiles[k.w][0]
    : 4;
};

export const getRowProfiles = (partitionedKeys: VIAKey[][]) => {
  const allUniformR1 = !partitionedKeys.some((kArr) =>
    kArr.some((k) => k.w !== 1 || k.h !== 1),
  );
  switch (allUniformR1 || partitionedKeys.length) {
    case 8: {
      return [1, 1, 1, 1, 2, 3, 4, 4];
    }
    case 7: {
      return [1, 1, 1, 2, 3, 4, 4];
    }
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

export const getKeyId = (k: VIAKey) => {
  return `${k.w}-${k.h}-${k.col}-${k.row}-${k.w2}-${k.h2}`;
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
  const rowProfiles = getRowProfiles(partitionedKeys);
  return {
    rowMap: partitionedKeys.reduce((p, n, i) => {
      return n.reduce((pp, k) => {
        return {
          ...pp,
          [getKeyId(k)]: getRowForKey(k, rowProfiles[i]),
        };
      }, p);
    }, {}),
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

export const makeSRGBTheme = (theme: ThemeDefinition) =>
  Object.entries(theme).reduce((p, [key, colorPair]) => {
    const c = `#${new Color(colorPair.c).convertSRGBToLinear().getHexString()}`;
    const t = `#${new Color(colorPair.t).convertSRGBToLinear().getHexString()}`;
    return {...p, [key]: {c, t}};
  }, {}) as ReturnType<typeof getThemeFromStore>;

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

export const getMeshName = (k: VIAKey, profile: number, isLastRow: boolean) => {
  // Special keys
  if (k['ei'] !== undefined) {
    return 'E-100';
  } else if (k.h === 2 && k.w === 1) {
    return `K-R${profile}V-200`;
  } else if (k.w === 1.25 && k.w2 === 1.5) {
    return `K-R2-ISO`;
  } else if (k.w === 1.5 && k.w2 === 2.25) {
    return `K-R2-BAE`;
  } else if (k.h > 1) {
    return isLastRow ? 'K-R4C-100' : 'K-R4-100';
  }

  if (!isLastRow) {
    switch (k.w) {
      case 1.25:
      case 1.5:
      case 1.75:
      case 1:
      case 2:
      case 2.25:
      case 2.75: {
        return `K-R${profile}-${k.w * 100}`;
      }
      case 3:
      case 6:
      case 6.25:
      case 6.5:
      case 7: {
        return `K-R4C-${k.w * 100}`;
      }
      default: {
        // Spacebars
        return 'K-R4C-100';
      }
    }
  }
  switch (k.w) {
    case 1:
    case 1.25:
    case 1.5:
    case 1.75: {
      return `K-R${profile}-${k.w * 100}`;
    }
    case 2:
    case 2.25:
    case 2.75:
    case 3:
    case 6:
    case 6.25:
    case 6.5:
    case 7: {
      return `K-R4C-${k.w * 100}`;
    }
    default: {
      // Spacebars
      return 'K-R4C-100';
    }
  }
};
export const getGeometry = (k: VIAKey) => {
  switch (k.w) {
    case 1:
    case 1.25:
    case 1.5:
    case 1.75:
    case 2:
    case 2.25:
    case 2.75:
    case 6.25:
    case 7: {
      return `Vex${k.w * 100}U`;
    }
    default: {
      return 'Vex100U';
    }
  }
};

export const getScale = (k: VIAKey, scale: number[]) => {
  if (k['ei'] !== undefined) {
    return scale;
  } else if (k.h === 2 && k.w === 1) {
    return [1, 1, 1];
  } else if (k.w === 1.25 && k.w2 === 1.5) {
    return [1, 1, 1];
  } else if (k.w === 1.5 && k.w2 === 2.25) {
    return [1, 1, 1];
  } else if (k.h > 1) {
    return scale;
  }

  if (k.h == 1) {
    switch (k.w) {
      case 1.25:
      case 1.5:
      case 1.75:
      case 2:
      case 2.25:
      case 2.75:

      case 3:
      case 6:
      case 6.25:
      case 6.5:
      case 7: {
        return [1, 1, 1];
      }
      case 1: {
        return [1, 1, 1];
      }
      default: {
        return scale;
      }
    }
  }
  return scale;
};

const getLabelOffsets = (
  topLabel: string,
  bottomLabel: string,
): [number, number] => {
  let topLabelOffset = 0.0;
  let bottomLabelOffset = 0.1;

  if (topLabel.length == 1) {
    if ('^*"'.split('').includes(topLabel[0])) {
      topLabelOffset = 0.2;
    }
  }

  if (bottomLabel.length == 1) {
    if (',.'.split('').includes(bottomLabel[0])) {
      bottomLabelOffset = 0.4;
    } else if ("/\\;'[]".split('').includes(bottomLabel[0])) {
      bottomLabelOffset = 0.3;
    } else if ('-'.split('').includes(bottomLabel[0])) {
      bottomLabelOffset = 0.1;
    }
  }

  return [topLabelOffset, bottomLabelOffset];
};

export const getLabel = (
  keycodeByte: number,
  width: number,
  macroExpressions: string[],
  selectedDefinition: VIADefinitionV2 | VIADefinitionV3 | null,
  basicKeyToByte: Record<string, number>,
  byteToKey: Record<number, string>,
) => {
  let label: string = '';
  let size: number = 1.0;
  let offset: [number, number] = [0, 0];

  // Full name
  let tooltipLabel: string = '';
  if (
    isCustomKeycodeByte(keycodeByte, basicKeyToByte) &&
    selectedDefinition?.customKeycodes
  ) {
    const customKeycodeIdx = getCustomKeycodeIndex(keycodeByte, basicKeyToByte);
    label = getShortNameForKeycode(
      selectedDefinition.customKeycodes[customKeycodeIdx] as IKeycode,
    );
    tooltipLabel = getShortNameForKeycode(
      selectedDefinition.customKeycodes[customKeycodeIdx] as IKeycode,
      700,
    );
  } else if (keycodeByte) {
    label =
      getLabelForByte(keycodeByte, width * 100, basicKeyToByte, byteToKey) ??
      '';
    tooltipLabel =
      getLabelForByte(keycodeByte, 700, basicKeyToByte, byteToKey) ?? '';
  }
  let macroExpression: string | undefined;
  if (isMacro(label)) {
    macroExpression = macroExpressions[label.substring(1) as any];
    tooltipLabel = macroExpression || '';
  }

  if (isAlpha(label) || isNumpadNumber(label)) {
    return (
      label && {
        label: label.toUpperCase(),
        macroExpression,
        key: (label || '') + (macroExpression || ''),
        size: size,
        offset: offset,
      }
    );
  } else if (isMultiLegend(label)) {
    const topLabel = label[0];
    const bottomLabel = label[label.length - 1];
    return (
      bottomLabel && {
        topLabel,
        bottomLabel,
        macroExpression,
        key: (label || '') + (macroExpression || ''),
        size: size,
        offset: getLabelOffsets(topLabel, bottomLabel),
      }
    );
  } else {
    if (isNumpadSymbol(label)) {
      size = 2.0;
    }
    if (isArrowKey(label)) {
      size = 1.5;
    }
    return {
      label,
      centerLabel: label,
      tooltipLabel,
      macroExpression,
      key: (label || '') + (macroExpression || ''),
      size: size,
      offset: offset,
    };
  }
};
