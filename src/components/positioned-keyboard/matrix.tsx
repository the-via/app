import React from 'react';
import styled from 'styled-components';

type MatrixProps = {
  rowKeys: number[][][];
  colKeys: number[][][];
};

export const Matrix: React.VFC<MatrixProps> = ({rowKeys, colKeys}) => (
  <SVG>
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
