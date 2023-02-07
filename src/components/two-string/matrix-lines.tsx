import {VIAKey} from '@the-via/reader';
import {calculatePointPosition} from 'src/utils/keyboard-rendering';
import styled from 'styled-components';

const generateRowColArray = (keys: VIAKey[], rows: number, cols: number) => {
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

type MatrixProps = {
  rowKeys: number[][][];
  colKeys: number[][][];
};

export const Matrix: React.VFC<MatrixProps> = ({rowKeys, colKeys}) => (
  <SVG style={{position: 'absolute', top: 0}}>
    {rowKeys.map((arr, index) => (
      <RowLine
        points={arr.map((point) => (point || []).join(',')).join(' ')}
        key={index}
      />
    ))}
    {colKeys.map((arr, index) => (
      <ColLine
        points={arr.map((point) => (point || []).join(',')).join(' ')}
        key={index}
      />
    ))}
  </SVG>
);

const SVG = styled.svg`
  transform: rotateZ(0);
  width: 100%;
  height: 100%;
`;
const RowLine = styled.polyline`
  stroke: var(--color_accent);
  stroke-width: 3;
  fill-opacity: 0;
  stroke-opacity: 0.4;
  stroke-linecap: round;
`;
const ColLine = styled.polyline`
  stroke: var(--color_light-grey);
  stroke-width: 3;
  fill-opacity: 0;
  stroke-opacity: 0.4;
  stroke-linecap: round;
`;

export const MatrixLines: React.VFC<{
  keys: VIAKey[];
  rows: number;
  cols: number;
  width: number;
  height: number;
}> = ({keys, rows, cols, width, height}) => {
  const {rowKeys, colKeys} = generateRowColArray(keys, rows, cols);
  return <Matrix rowKeys={rowKeys} colKeys={colKeys} />;
};
