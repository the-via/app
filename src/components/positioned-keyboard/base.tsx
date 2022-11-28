import React from 'react';
import type {RootState} from 'src/store';
import {
  getLabelForByte,
  getShortNameForKeycode,
  getUserKeycodeIndex,
  IKeycode,
  isAlpha,
  isMacro,
  isNumericOrShiftedSymbol,
  isNumericSymbol,
  isUserKeycodeByte,
} from 'src/utils/key';
import styled from 'styled-components';
import type {VIADefinitionV2, VIADefinitionV3} from 'via-reader';

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

export const getLabel = (
  keycodeByte: number,
  width: number,
  macros: RootState['macros'],
  selectedDefinition: VIADefinitionV2 | VIADefinitionV3 | null,
  basicKeyToByte: Record<string, number>,
  byteToKey: Record<number, string>,
) => {
  let label: string = '';
  if (
    isUserKeycodeByte(keycodeByte, basicKeyToByte) &&
    selectedDefinition?.customKeycodes
  ) {
    const userKeycodeIdx = getUserKeycodeIndex(keycodeByte, basicKeyToByte);
    label = getShortNameForKeycode(
      selectedDefinition.customKeycodes[userKeycodeIdx] as IKeycode,
    );
  } else if (keycodeByte) {
    label =
      getLabelForByte(keycodeByte, width * 100, basicKeyToByte, byteToKey) ??
      '';
  }
  let macroExpression: string | undefined;
  if (isMacro(label)) {
    macroExpression = macros.expressions[label.substring(1) as any];
  }

  if (isAlpha(label) || isNumericOrShiftedSymbol(label)) {
    return (
      label && {
        label: label.toUpperCase(),
        macroExpression,
        key: (label || '') + (macroExpression || ''),
      }
    );
  } else if (isNumericSymbol(label)) {
    const topLabel = label[0];
    const bottomLabel = label[label.length - 1];
    return (
      bottomLabel && {
        topLabel,
        bottomLabel,
        macroExpression,
        key: (label || '') + (macroExpression || ''),
      }
    );
  } else {
    return {
      label,
      centerLabel: label,
      macroExpression,
      key: (label || '') + (macroExpression || ''),
    };
  }
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

export const KeyContainer = styled.div<{selected: boolean}>`
  position: absolute;
  box-sizing: border-box;
  transition: transform 0.2s ease-out;
  user-select: none;
  transform: ${(props) =>
    props.selected
      ? 'translate3d(0, -4px, 0) scale(0.99)'
      : 'translate3d(0,0,0)'};
  &:hover {
    transform: ${(props) =>
      props.selected
        ? 'translate3d(0, -4px, 0) scale(0.99)'
        : 'translate3d(0,-4px,0)'};
  }
  animation-name: select-glow;
  animation-duration: ${(props) => (props.selected ? 1.5 : 0)}s;
  animation-iteration-count: infinite;
  animation-direction: alternate;
  animation-timing-function: ease-in-out;
`;

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
