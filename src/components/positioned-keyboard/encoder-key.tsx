import React, {memo, MouseEventHandler} from 'react';
import type {Key} from 'src/types/types';
import {
  getDarkenedColor,
  getEncoderKeyContainerPosition,
  getKeyContainerPosition,
  getRotationContainerTransform,
  KeyContainer,
  Legend,
  RotationContainer,
} from './base';
import styled from 'styled-components';

const noop = (...args: any[]) => {};

export const OuterEncoderKey = styled.div<{
  selected?: boolean;
  backgroundColor: string;
}>`
  overflow: hidden;
  border: 2px solid var(--color_accent);
  border-style: dotted;
  border-color: ${(props) =>
    props.selected ? `var(--color_accent)` : props.backgroundColor};
  background-color: ${(props) =>
    props.selected
      ? `var(--color_dark-accent)`
      : getDarkenedColor(props.backgroundColor)};
  animation-duration: ${(props) => (props.selected ? 2 : 0)}s;
  animation-iteration-count: infinite;
  animation-direction: alternate;
  animation-timing-function: ease-in-out;
  height: 100%;
  border-radius: 50%;
  box-sizing: border-box;
  display: block;
  margin-right: 2px;
  width: 100%;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
`;
export const InnerEncoderKey = styled.div<{
  backgroundColor: string;
  selected: boolean;
}>`
  width: 90%;
  height: 90%;
  background-color: ${(props) =>
    props.selected ? `var(--color_accent)` : props.backgroundColor};
  background-color: #363434;
  color: #e8c4b8;
  box-sizing: border-box;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const getEncoderLegends = (
  labels: (string | void)[],
  t: string,
): JSX.Element[] => {
  return labels.map((label) => {
    const splitLabels = (label || '').split(' ');
    const minifiedLabel = splitLabels.map((l) => l[0]).join('');
    return (
      <Legend
        key={label || ''}
        color={'#E8C4B8'}
        style={{fontSize: '8px', textAlign: 'center'}}
      >
        {minifiedLabel}
      </Legend>
    );
  });
};
// Remove after refactoring with flexbox
export const InnerEncoderKeyContainer = styled.div``;
export const EncoderKeyComponent = memo(
  ({
    x,
    y,
    w,
    h,
    c,
    t,
    r = 0,
    rx = 0,
    ry = 0,
    label,
    selected,
    id,
    onClick = noop,
  }: Key) => {
    const containerOnClick: MouseEventHandler = (evt) => {
      evt.stopPropagation();
      onClick(id);
    };
    const keyContainerStyle = getEncoderKeyContainerPosition({
      w,
      h,
      x,
      y,
    });
    return (
      <RotationContainer
        selected={selected}
        style={{...getRotationContainerTransform({r, rx, ry})}}
      >
        <KeyContainer
          selected={selected}
          style={keyContainerStyle}
          onClick={containerOnClick}
        >
          <OuterEncoderKey
            backgroundColor={c}
            selected={selected}
            style={{borderWidth: `${~~(keyContainerStyle.height / 18)}px`}}
          >
            <InnerEncoderKey selected={selected} backgroundColor={c}>
              <InnerEncoderKeyContainer></InnerEncoderKeyContainer>
            </InnerEncoderKey>
          </OuterEncoderKey>
        </KeyContainer>
      </RotationContainer>
    );
  },
);
