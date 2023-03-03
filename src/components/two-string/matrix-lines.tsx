import {VIAKey} from '@the-via/reader';
import styled from 'styled-components';
import {generateRowColArray} from '../n-links/matrix-lines';

type MatrixProps = {
  rowKeys: number[][][];
  colKeys: number[][][];
};

const Matrix: React.FC<MatrixProps> = ({rowKeys, colKeys}) => (
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

export const MatrixLines: React.FC<{
  keys: VIAKey[];
  rows: number;
  cols: number;
  width: number;
  height: number;
}> = ({keys, rows, cols, width, height}) => {
  const {rowKeys, colKeys} = generateRowColArray(keys, rows, cols);
  return <Matrix rowKeys={rowKeys} colKeys={colKeys} />;
};
