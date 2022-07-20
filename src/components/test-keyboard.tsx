import React, {MouseEventHandler, memo} from 'react';
import styled from 'styled-components';
import {
  chooseInnerKey,
  chooseInnerKeyContainer,
  CSSVarObject,
  getDarkenedColor,
  OuterKey,
  getLabel,
  OuterSecondaryKey,
  BlankKeyboardFrame,
  calculateKeyboardFrameDimensions,
} from './positioned-keyboard';
import type {VIAKey} from 'via-reader';
import type {Key} from 'src/types/types';
import {
  getKeyContainerPosition,
  getLegends,
  getRotationContainerTransform,
  noop,
  RotationContainer,
} from './positioned-keyboard/base';
import {
  getEncoderLegends,
  InnerEncoderKey,
  InnerEncoderKeyContainer,
  OuterEncoderKey,
} from './positioned-keyboard/encoder-key';

export enum TestKeyState {
  Initial,
  KeyDown,
  KeyUp,
}

type t = Omit<Key, 'selected' | 'onClick'>;

type TestKey = Omit<Key, 'selected'> & {
  keyState: TestKeyState;
};

export const TestEncoderKeyComponent = memo(
  ({
    x,
    y,
    w,
    h,
    c,
    t,
    id,
    keyState = TestKeyState.Initial,
    label,
    onClick = noop,
    r = 0,
    rx = 0,
    ry = 0,
  }: TestKey) => {
    const selected = false;
    const containerOnClick: MouseEventHandler = (evt) => {
      evt.stopPropagation();
      onClick(id);
    };
    const keyContainerStyle = getKeyContainerPosition({
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
        <TestKeyContainer
          id={id.toString()}
          style={{
            ...getKeyContainerTransform({keyState, x, y, w, h}),
            ...{opacity: 0.1},
          }}
        >
          <OuterEncoderKey
            backgroundColor={c}
            selected={selected}
            style={{borderWidth: `${~~(keyContainerStyle.height / 18)}px`}}
          >
            <InnerEncoderKey selected={false} backgroundColor={c}>
              <InnerEncoderKeyContainer>
                {getEncoderLegends([label], t)}
              </InnerEncoderKeyContainer>
            </InnerEncoderKey>
          </OuterEncoderKey>
        </TestKeyContainer>
      </RotationContainer>
    );
  },
);
const TestKeyComponent = React.memo(
  ({
    x,
    y,
    w,
    h,
    c,
    t,
    id,
    h2,
    w2,
    x2,
    y2,
    keyState = TestKeyState.Initial,
    centerLabel = undefined,
    topLabel = undefined,
    bottomLabel = undefined,
    label = undefined,
    r = 0,
    rx = 0,
    ry = 0,
  }: TestKey) => {
    const isSmall = topLabel !== undefined || centerLabel !== undefined;
    const ChosenInnerKeyContainer = chooseInnerKeyContainer({
      topLabel,
      centerLabel,
    });
    const ChosenInnerKey = chooseInnerKey({topLabel, centerLabel});
    const legends = isSmall && !centerLabel ? [topLabel, bottomLabel] : [label];
    const hasSecondKey = [h2, w2].every((i) => i !== undefined);

    return (
      <RotationContainer
        selected={false}
        style={{...getRotationContainerTransform({r, rx, ry})}}
      >
        <TestKeyContainer
          id={id.toString()}
          style={getKeyContainerTransform({keyState, x, y, w, h})}
        >
          {hasSecondKey ? (
            <>
              <OuterSecondaryKey
                backgroundColor={getDarkenedColor(c)}
                style={getKeyContainerPosition({
                  w: w2 || 0,
                  x: x2 || 0,
                  y: y2 || 0,
                  h: h2 || 0,
                })}
              >
                <ChosenInnerKey backgroundColor={c}>
                  <ChosenInnerKeyContainer></ChosenInnerKeyContainer>
                </ChosenInnerKey>
              </OuterSecondaryKey>
            </>
          ) : null}
          <OuterKey backgroundColor={getDarkenedColor(c)}>
            <ChosenInnerKey
              backgroundColor={c}
              style={hasSecondKey ? {transform: 'rotateZ(0)'} : {}}
            >
              <ChosenInnerKeyContainer>
                {getLegends(legends, t)}
              </ChosenInnerKeyContainer>
            </ChosenInnerKey>
          </OuterKey>
        </TestKeyContainer>
      </RotationContainer>
    );
  },
);

const testKeyColor = {
  c: '#ad7070',
  t: '#d9d9d9',
};

export const TestKeyboard = (props: any) => {
  const macros = {expressions: [], isFeatureSupported: false};
  const {pressedKeys, keys, containerDimensions, matrixKeycodes} = props;
  const {width, height} = calculateKeyboardFrameDimensions(keys);
  return (
    <div>
      <BlankKeyboardFrame
        containerDimensions={containerDimensions}
        width={width}
        height={height}
        selectable={false}
      >
        {(keys as VIAKey[]).map((k, index) => {
          const KeyboardKeyComponent =
            k['ei'] !== undefined ? TestEncoderKeyComponent : TestKeyComponent;
          return (
            <KeyboardKeyComponent
              {...{
                ...k,
                ...getLabel(matrixKeycodes[index], k.w, macros, null),
                ...testKeyColor,
                keyState: pressedKeys[index],
                id: index,
                key: index,
              }}
            />
          );
        })}
      </BlankKeyboardFrame>
    </div>
  );
};

const getKeyContainerTransform = ({
  keyState,
  x,
  y,
  w,
  h,
}: {
  keyState: TestKeyState;
  x: number;
  y: number;
  w: number;
  h: number;
}) => ({
  transform: `translate(${CSSVarObject.keyXPos * x}px, ${
    CSSVarObject.keyYPos * y + (keyState !== TestKeyState.KeyDown ? 0 : 1) * 2
  }px)`,
  width: `${CSSVarObject.keyXPos * w - CSSVarObject.keyXSpacing}px`,
  height: `${CSSVarObject.keyYPos * h - CSSVarObject.keyYSpacing}px`,
  filter: keyState !== TestKeyState.Initial ? 'saturate(1)' : 'saturate(0)',
  opacity: keyState === TestKeyState.KeyUp ? 1 : 0.4,
});

const TestKeyContainer = styled.div`
  position: absolute;
  box-sizing: border-box;
  transition: transform 0.2s ease-out;
  user-select: none;
  transition: all 0.2s ease-out;
`;
