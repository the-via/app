import {VIAKey} from '@the-via/reader';
import {calculatePointPosition} from 'src/utils/keyboard-rendering';

export const generateRowColArray = (
  keys: VIAKey[],
  rows: number,
  cols: number,
) => {
  const matrixKeys = keys.filter((key) => key['ei'] === undefined);
  const rowKeys = matrixKeys
    .reduce(
      (sumKeys, key) => {
        sumKeys[key.row][key.col] = calculatePointPosition(key);
        return sumKeys;
      },
      Array(rows)
        .fill(0)
        .map(() => Array(cols).fill(0)),
    )
    .map((arr) => arr.sort((a, b) => a[0] - b[0]));
  const colKeys = matrixKeys
    .reduce(
      (sumKeys, key) => {
        sumKeys[key.col][key.row] = calculatePointPosition(key);
        return sumKeys;
      },
      Array(cols)
        .fill(0)
        .map(() => Array(rows).fill(0)),
    )
    .map((arr) => arr.sort((a, b) => a[1] - b[1]));
  return {rowKeys, colKeys};
};
