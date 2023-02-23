import React, {useEffect, useMemo, useRef, useState} from 'react';
import {shallowEqual} from 'react-redux';
import {TestKeyState} from 'src/types/types';
import {getDarkenedColor} from 'src/utils/color-math';
import {CSSVarObject} from 'src/utils/keyboard-rendering';
import styled from 'styled-components';
import {Keycap2DTooltip} from '../inputs/tooltip';
import {ComboKeycap} from './combo-keycap';
import {EncoderKey} from './encoder';
import {
  CanvasContainer,
  DisplayMode,
  KeycapContainer,
  TestOverlay,
  TooltipContainer,
} from './keycap-base';

export enum KeycapState {
  Pressed = 1,
  Unpressed = 2,
}

const getMacroData = ({
  macroExpression,
  label,
}: {
  macroExpression?: string;
  label: string;
}) =>
  label && label.length > 15
    ? label
    : macroExpression && macroExpression.length
    ? macroExpression
    : null;

const paintEncoder = (
  canvas: HTMLCanvasElement,
  [widthMultiplier, heightMultiplier]: [number, number],
  bgColor: string,
  fgColor: string,
) => {
  const dpi = 1;
  const canvasSize = 512 * dpi;
  const [canvasWidth, canvasHeight] = [
    canvasSize * widthMultiplier,
    canvasSize * heightMultiplier,
  ];
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const context = canvas.getContext('2d');
  const workingAreaDivider = 2.6;
  if (context) {
    context.fillStyle = bgColor;
    context.fillRect(0, 0, canvasWidth, canvasHeight);
    context.fill();

    context.fillStyle = fgColor;
    const rad = (0.4 * canvasWidth) / workingAreaDivider;
    context.ellipse(
      (0.5 * canvasWidth) / workingAreaDivider,
      (2.1 * canvasHeight) / workingAreaDivider,
      rad,
      rad,
      Math.PI / 4,
      0,
      2 * Math.PI,
    );
    context.fill();
  }
};

const paintDebugLines = (canvas: HTMLCanvasElement) => {
  const context = canvas.getContext('2d');
  if (context == null) {
    return;
  }
  context.strokeStyle = 'magenta';
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(0, 0);
  context.lineTo(canvas.width, 0);
  context.lineTo(canvas.width, canvas.height);
  context.lineTo(0, canvas.height);
  context.lineTo(0, 0);
  context.stroke();
};

const paintKeycapLabel = (
  canvas: HTMLCanvasElement,
  legendColor: string,
  label: any,
) => {
  const context = canvas.getContext('2d');
  if (context == null) {
    return;
  }
  const dpi = devicePixelRatio;
  const [canvasWidth, canvasHeight] = [canvas.width, canvas.height];
  canvas.width = canvasWidth * dpi;
  canvas.height = canvasHeight * dpi;
  canvas.style.width = `${canvasWidth}px`;
  canvas.style.height = `${canvasHeight}px`;

  context.scale(dpi, dpi);
  const fontFamily =
    'Fira Sans, Arial Rounded MT, Arial Rounded MT Bold, Arial';
  // Margins from face edge to where text is drawn
  const topLabelMargin = {x: 4, y: 4};
  const bottomLabelMargin = {x: 4, y: 4};
  const centerLabelMargin = {x: 3, y: 0};
  const singleLabelMargin = {x: 4, y: 4};

  // Define a clipping path for the top face, so text is not drawn on the side.
  context.beginPath();
  context.moveTo(0, 0);
  context.lineTo(canvas.width, 0);
  context.lineTo(canvas.width, canvas.height);
  context.lineTo(0, canvas.height);
  context.lineTo(0, 0);
  context.clip();

  context.fillStyle = legendColor;
  if (label === undefined) {
  } else if (label.topLabel && label.bottomLabel) {
    let fontSize = 16;
    let fontHeight = 0.75 * fontSize;
    let topLabelOffset = label.offset[0] * fontHeight;
    let bottomLabelOffset = label.offset[1] * fontHeight;
    context.font = `bold ${fontSize}px ${fontFamily}`;
    context.fillText(
      label.topLabel,
      topLabelMargin.x,
      topLabelMargin.y + topLabelOffset + fontHeight,
    );
    context.fillText(
      label.bottomLabel,
      bottomLabelMargin.x,
      canvasHeight - bottomLabelMargin.y - bottomLabelOffset,
    );
  } else if (label.centerLabel) {
    let fontSize = 13 * label.size;
    let fontHeight = 0.75 * fontSize;
    let faceMidLeftY = canvasHeight / 2;
    context.font = `bold ${fontSize}px ${fontFamily}`;
    context.fillText(
      label.label,
      centerLabelMargin.x,
      faceMidLeftY + 0.5 * fontHeight,
    );
    // return if label would have overflowed so that we know to show tooltip
    return (
      context.measureText(label.centerLabel).width >
      canvasWidth - centerLabelMargin.x
    );
  } else if (typeof label.label === 'string') {
    let fontSize = 22;
    let fontHeight = 0.75 * fontSize;
    context.font = `bold ${fontSize}px ${fontFamily}`;
    context.fillText(
      label.label,
      singleLabelMargin.x,
      singleLabelMargin.y + fontHeight,
    );
  }
};

const paintKeycap = (
  canvas: HTMLCanvasElement,
  [widthMultiplier, heightMultiplier]: [number, number],
  textureWidth: number,
  textureHeight: number,
  bgColor: string,
  legendColor: string,
  label: any,
  textureOffsetX: number,
) => {
  const [canvasWidth, canvasHeight] = [
    CSSVarObject.keyWidth,
    CSSVarObject.keyHeight,
  ];
  canvas.width =
    canvasWidth * textureWidth -
    CSSVarObject.faceXPadding.reduce((x, y) => x + y, 0);
  canvas.height =
    canvasHeight * textureHeight -
    CSSVarObject.faceYPadding.reduce((x, y) => x + y, 0);

  const context = canvas.getContext('2d');
  if (context == null) {
    return;
  }

  // Fill the canvas with the keycap background color
  //context.fillStyle = bgColor;
  //context.fillRect(0, 0, canvas.width, canvas.height);

  // Leaving this here for future maintenance.
  // This draws lines around the keycap edge and the top face edge,
  // *or* a clipped area within it when keycaps are large, vertical or odd shapes.
  const debug = false;
  if (debug) {
    paintDebugLines(canvas);
  }

  return paintKeycapLabel(canvas, legendColor, label);
};

export const Keycap = React.memo(
  (props: any & {mode: DisplayMode; idx: number}) => {
    const {
      label,
      scale,
      color,
      selected,
      disabled,
      mode,
      rotation,
      keyState,
      shouldRotate,
      textureOffsetX,
      textureWidth,
      textureHeight,
      idx,
    } = props;
    const macroData = label && getMacroData(label);
    const [overflowsTexture, setOverflowsTexture] = useState(false);
    // Hold state for hovered and clicked events
    const [hovered, hover] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const redraw = React.useCallback(() => {
      if (canvasRef.current && color) {
        if (shouldRotate) {
          paintEncoder(canvasRef.current, scale, color.c, color.t);
        } else {
          const doesOverflow = paintKeycap(
            canvasRef.current,
            scale,
            textureWidth,
            textureHeight,
            color.c,
            color.t,
            label,
            textureOffsetX,
          );
          setOverflowsTexture(!!doesOverflow);
        }
      }
    }, [
      canvasRef.current,
      textureWidth,
      label && label.key,
      scale[0],
      scale[1],
      color && color.t,
      color && color.c,
      shouldRotate,
    ]);
    useEffect(redraw, [label && label.key, color && color.c, color && color.t]);

    // Set Z to half the total height so that keycaps are at the same level since the center
    // is in the middle and each row has a different height
    const [zDown, zUp] = [-8, 0];
    const pressedState =
      DisplayMode.Test === mode
        ? TestKeyState.KeyDown === keyState
          ? KeycapState.Pressed
          : KeycapState.Unpressed
        : hovered || selected
        ? KeycapState.Pressed
        : KeycapState.Unpressed;
    const [keycapZ] =
      pressedState === KeycapState.Pressed
        ? [zDown, rotation[2]]
        : [zUp, rotation[2] + Math.PI * Number(shouldRotate)];
    const wasPressed = keyState === TestKeyState.KeyUp;
    const keycapColor =
      DisplayMode.Test === mode
        ? pressedState === KeycapState.Unpressed
          ? wasPressed
            ? 'mediumvioletred'
            : 'lightgrey'
          : 'mediumvioletred'
        : pressedState === KeycapState.Unpressed
        ? 'lightgrey'
        : 'lightgrey';
    const keycapOpacity =
      pressedState === KeycapState.Unpressed ? (wasPressed ? 0.4 : 0) : 0.6;

    const [onClick, onPointerOver, onPointerOut, onPointerDown] =
      useMemo(() => {
        const noop = () => {};
        return disabled
          ? [noop, noop, noop, noop]
          : props.mode === DisplayMode.ConfigureColors
          ? [
              noop,
              (evt: React.MouseEvent) => {
                if (props.onPointerOver) {
                  props.onPointerOver(evt, idx);
                }
              },
              noop,
              (evt: React.MouseEvent) => {
                if (props.onPointerDown) {
                  props.onPointerDown(evt, idx);
                }
              },
            ]
          : [
              (evt: React.MouseEvent) => props.onClick(evt, idx),
              (evt: React.MouseEvent) => {
                if (props.onPointerOver) {
                  props.onPointerOver(evt, idx);
                }
                hover(true);
              },
              () => hover(false),
              (evt: React.MouseEvent) => {
                if (props.onPointerDown) {
                  props.onPointerDown(evt, idx);
                }
              },
            ];
      }, [
        disabled,
        props.onClick,
        props.onPointerDown,
        props.onPointerOver,
        hover,
        idx,
        mode,
      ]);
    return shouldRotate ? (
      <EncoderKey
        {...props}
        style={{
          transform: `translate(${
            props.position[0] -
            (CSSVarObject.keyWidth * textureWidth - CSSVarObject.keyWidth) / 2
          }px,${
            (textureWidth * (CSSVarObject.keyHeight - CSSVarObject.keyWidth)) /
              2 +
            props.position[1] -
            (CSSVarObject.keyHeight * textureHeight - CSSVarObject.keyHeight) /
              2
          }px) rotate(${-props.rotation[2]}rad)`,
          borderRadius: 3,
          width: textureWidth * CSSVarObject.keyWidth,
          height: textureHeight * CSSVarObject.keyWidth,
          color: props.color.c,
        }}
      />
    ) : props.clipPath ? (
      <ComboKeycap
        {...props}
        onClick={onClick}
        onPointerDown={onPointerDown}
        onPointerOver={onPointerOver}
        onPointerOut={onPointerOut}
        keycapZ={keycapZ}
        keycapOpacity={keycapOpacity}
        keycapColor={keycapColor}
        canvasRef={canvasRef}
        macroData={macroData}
        overflowsTexture={overflowsTexture}
        style={{
          transform: `translate(${
            CSSVarObject.keyWidth / 2 +
            props.position[0] -
            (CSSVarObject.keyXPos * textureWidth - CSSVarObject.keyXSpacing) / 2
          }px,${
            CSSVarObject.keyHeight / 2 +
            props.position[1] -
            (CSSVarObject.keyYPos * textureHeight - CSSVarObject.keyYSpacing) /
              2
          }px) rotate(${-props.rotation[2]}rad)`,
          width: textureWidth * CSSVarObject.keyXPos - CSSVarObject.keyXSpacing,
          height:
            textureHeight * CSSVarObject.keyYPos - CSSVarObject.keyYSpacing,
        }}
      />
    ) : (
      <>
        <KeycapContainer
          onClick={onClick}
          onPointerDown={onPointerDown}
          onPointerOver={onPointerOver}
          onPointerOut={onPointerOut}
          style={{
            transform: `translate(${
              CSSVarObject.keyWidth / 2 +
              props.position[0] -
              (CSSVarObject.keyXPos * textureWidth - CSSVarObject.keyXSpacing) /
                2
            }px,${
              CSSVarObject.keyHeight / 2 +
              props.position[1] -
              (CSSVarObject.keyYPos * textureHeight -
                CSSVarObject.keyYSpacing) /
                2
            }px) rotate(${-props.rotation[2]}rad)`,
            width:
              textureWidth * CSSVarObject.keyXPos - CSSVarObject.keyXSpacing,
            height:
              textureHeight * CSSVarObject.keyYPos - CSSVarObject.keyYSpacing,
            cursor: !disabled ? 'pointer' : 'initial',
          }}
        >
          <GlowContainer
            $selected={selected}
            style={{
              animation: disabled
                ? 'initial' // This prevents the hover animation from firing when the keycap can't be interacted with
                : selected
                ? '.75s infinite alternate select-glow'
                : '',
              background: getDarkenedColor(props.color.c, 0.8),
              transform: `perspective(100px) translateZ(${keycapZ}px)`,
              borderRadius: 3,
              width:
                textureWidth * CSSVarObject.keyXPos - CSSVarObject.keyXSpacing,
              height:
                textureHeight * CSSVarObject.keyYPos - CSSVarObject.keyYSpacing,
            }}
          >
            {DisplayMode.Test === mode ? (
              <TestOverlay
                style={{
                  background: keycapColor,
                  opacity: keycapOpacity,
                }}
              ></TestOverlay>
            ) : null}
            <CanvasContainer
              style={{
                borderRadius: 4,
                background: props.color.c,
                height: '100%',
              }}
            >
              <canvas ref={canvasRef} style={{}} />
            </CanvasContainer>
          </GlowContainer>
          {(macroData || overflowsTexture) && (
            <TooltipContainer $rotate={rotation[2]}>
              <Keycap2DTooltip>
                {macroData || (label && label.tooltipLabel)}
              </Keycap2DTooltip>
            </TooltipContainer>
          )}
        </KeycapContainer>
      </>
    );
  },
  shallowEqual,
);

const GlowContainer = styled.div<{$selected: boolean}>`
  box-sizing: border-box;
  padding: 2px 6px 10px 6px;
  transition: transform 0.2s ease-out;
  box-shadow: inset -1px -1px 0 rgb(0 0 0 / 20%),
    inset 1px 1px 0 rgb(255 255 255 / 20%);
  animation: ${(p) =>
    p.$selected ? '.75s infinite alternate select-glow' : 'initial'};
  &:hover {
    transform: perspective(100px) translateZ(-5px);
    animation: 0.5s 1 forwards select-glow;
  }
`;
export {DisplayMode};
