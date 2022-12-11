import classNames from 'classnames';
import React, { HTMLProps } from 'react';
import styled from 'styled-components';

type KeyRotation = {
  r: number;
  rx: number;
  ry: number;
};

type KeyPosition = {
  x: number;
  y: number;
  w: number;
  h: number;
};
export const CSSVarObject = {
  keyWidth: 52,
  keyXSpacing: 2,
  keyHeight: 54,
  keyYSpacing: 2,
  keyXPos: 52 + 2,
  keyYPos: 54 + 2,
};

export const noop = (...args: any[]) => {};

export const getDarkenedColor = (color: string) => {
  const cleanedColor = color.replace('#', '');
  const r = parseInt(cleanedColor[0], 16) * 16 + parseInt(cleanedColor[1], 16);
  const g = parseInt(cleanedColor[2], 16) * 16 + parseInt(cleanedColor[3], 16);
  const b = parseInt(cleanedColor[4], 16) * 16 + parseInt(cleanedColor[5], 16);
  const hr = Math.round(r * 0.8).toString(16);
  const hg = Math.round(g * 0.8).toString(16);
  const hb = Math.round(b * 0.8).toString(16);
  const res = `#${hr.padStart(2, '0')}${hg.padStart(2, '0')}${hb.padStart(
    2,
    '0',
  )}`;
  return res;
};

export const getRotationContainerTransform = ({r, rx, ry}: KeyRotation) => ({
  transform: `rotate3d(0,0,1,${r}deg)`,
  transformOrigin: `${CSSVarObject.keyXPos * rx}px ${
    CSSVarObject.keyYPos * ry
  }px`,
});

export const getBGKeyContainerPosition = ({x, y, w, h}: KeyPosition) => ({
  left: CSSVarObject.keyXPos * x - 1,
  top: CSSVarObject.keyYPos * y - 1,
  width: CSSVarObject.keyXPos * w - CSSVarObject.keyXSpacing + 2,
  height: CSSVarObject.keyYPos * h - CSSVarObject.keyYSpacing + 2,
});

export const getKeyContainerPosition = ({x, y, w, h}: KeyPosition) => ({
  left: CSSVarObject.keyXPos * x,
  top: CSSVarObject.keyYPos * y,
  width: CSSVarObject.keyXPos * w - CSSVarObject.keyXSpacing,
  height: CSSVarObject.keyYPos * h - CSSVarObject.keyYSpacing,
});

export const getEncoderKeyContainerPosition = ({x, y, w, h}: KeyPosition) => ({
  left: CSSVarObject.keyXPos * x,
  top: CSSVarObject.keyYPos * y,
  width: CSSVarObject.keyXPos * w - CSSVarObject.keyXSpacing,
  height: CSSVarObject.keyXPos * h - CSSVarObject.keyXSpacing,
});

export const RotationContainer = styled.div<{
  selected?: boolean;
}>`
  position: absolute;
  ${(props) => (props.selected ? 'z-index:2;' : '')}
`;

export function KeyContainer({
  className,
  selected,
  ...divProps
}: { selected: boolean } & HTMLProps<HTMLDivElement>) {
  const divClassName = classNames('key-container', className, {
    'key-selected': selected
  });

  return (
    <div className={divClassName} {...divProps} />
  );
}

export const Legend = styled.div`
  font-family: Arial, Helvetica, sans-serif;
  color: ${(props) => props.color};
  font-weight: bold;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const getLegends = (
  labels: (string | void)[],
  t: string,
): JSX.Element[] => {
  return labels.map((label) => (
    <Legend key={label || ''} color={t}>
      {(label || '').length > 15 ? 'ADV' : label || ''}
    </Legend>
  ));
};
