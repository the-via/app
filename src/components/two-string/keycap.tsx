import {useSpring} from '@react-spring/web';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {shallowEqual} from 'react-redux';
import {TestKeyState} from 'src/types/types';
import {getDarkenedColor} from 'src/utils/color-math';
import {CSSVarObject} from 'src/utils/keyboard-rendering';
import styled from 'styled-components';
import * as THREE from 'three';
import {Keycap2DTooltip} from '../inputs/tooltip';
import {EncoderKey} from './encoder';
const DEBUG_ENABLE = false;

export enum DisplayMode {
  Test = 1,
  Configure = 2,
  Design = 3,
  ConfigureColors = 4,
}

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
    context.fillRect(0, 0, canvas.width, canvas.height);
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

type Point = {
  x: number;
  y: number;
};

type Rect = {
  bl: Point;
  tr: Point;
};

const paintDebugLines = (
  canvas: HTMLCanvasElement,
) => {
  const context = canvas.getContext('2d');
  if (context == null) {
    return;
  }
  context.strokeStyle = 'magenta';
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(0,0);
  context.lineTo(canvas.width,0);
  context.lineTo(canvas.width,canvas.height);
  context.lineTo(0,canvas.height);
  context.lineTo(0,0);
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
  const fontFamily = 'Arial Rounded MT, Arial Rounded MT Bold, Arial';
  // Margins from face edge to where text is drawn
  const margin = {x: 3, y: 1};
  const centerLabelMargin = {x: 2, y: 0};
  const singleLabelMargin = {x: 2, y: 2};

  // Define a clipping path for the top face, so text is not drawn on the side.
  context.beginPath();
  context.moveTo(0,0);
  context.lineTo(canvas.width,0);
  context.lineTo(canvas.width,canvas.height);
  context.lineTo(0,canvas.height);
  context.lineTo(0,0);
  context.clip();

  context.fillStyle = legendColor;
  if (label === undefined) {
  } else if (label.topLabel && label.bottomLabel) {
    let fontSize = 17;
    let fontHeight = 0.75 * fontSize;
    let topLabelOffset = 0;//label.offset[0] * fontHeight;
    let bottomLabelOffset = 0;//label.offset[1] * fontHeight;
    context.font = `bold ${fontSize}px ${fontFamily}`;
    context.fillText(
      label.topLabel,
      margin.x,
      margin.y + topLabelOffset + fontHeight,
    );
    context.fillText(
      label.bottomLabel,
      margin.x,
      canvas.height - 1 - margin.y - bottomLabelOffset,
    );
  } else if (label.centerLabel) {
    let fontSize = 13 * label.size;
    let fontHeight = 0.75 * fontSize;
    let faceMidLeftY = canvas.height / 2;
    context.font = `bold ${fontSize}px ${fontFamily}`;
    context.fillText(
      label.label,
      centerLabelMargin.x,
      faceMidLeftY + (0.5 * fontHeight),
    );
    // return if label would have overflowed so that we know to show tooltip
    return (
      context.measureText(label.centerLabel).width >
      canvas.width - centerLabelMargin.x
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

// coordinates of corners of keycap and top face in texture coordinates (UVs)
type TextureRects = {
  keycapRect: Rect;
  faceRect: Rect;
};

const calculateTextureRects = (
  widthMultiplier: number,
  heightMultiplier: number,
  textureWidth: number,
  textureHeight: number,
  textureOffsetX: number,
): TextureRects => {
  // Constants used in texture coordinate (UV) mapping
  // See update-uv-maps.ts
  const size1u = 1 / 2.6;
  const unitScale = 19.05;
  const offsetToCorner = 0.445;
  const gap = (offsetToCorner / unitScale) * size1u;

  // textureWidth,textureHeight is the size of the keycap in U
  // Clip this to 2.75U because the texture coordinates (UV)
  // only spans 2.6U, which is *just* enough to reach the right
  // edge of the top face of a 2.75U keycap.
  let keycapWidth = Math.min(2.75, textureWidth);
  let keycapHeight = Math.min(2.75, textureHeight);

  // If the model is a "stretched" 1U key,
  // pretend it's a 1U key, since the texture coordinates (UVs)
  // will be for a 1U key.
  if (widthMultiplier > 1 || heightMultiplier > 1) {
    keycapWidth = 1;
    keycapHeight = 1;
  }

  let keycapRect: Rect = {
    bl: {x: 0, y: 1},
    tr: {x: 1, y: 0},
  };

  let faceRect: Rect = {
    bl: {x: keycapRect.bl.x, y: keycapRect.bl.y},
    tr: {x: keycapRect.tr.x, y: keycapRect.tr.y},
  };

  // textureOffsetX is the X offset in U from the left edge of the keycap shape
  // to the left edge of the narrower part of the keycap shape, when it's an ISO or BAE.
  // Multiplying by size1u converts it to an offset in TU
  // Add to the existing offset from keycap left edge to face left edge
  if (textureOffsetX > 0) {
    faceRect.bl.x += textureOffsetX * size1u;
    faceRect.tr.x += textureOffsetX * size1u;
    keycapRect.bl.x += textureOffsetX * size1u;
    keycapRect.tr.x += textureOffsetX * size1u;
  }

  return {keycapRect, faceRect};
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
  const keycapRect = {bl: {x: 0, y: 0}, tr: {x: 1, y: 1}};
  const faceRect = keycapRect;

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

    const glow = useSpring({
      config: {duration: 800},
      from: {x: 0, y: '#f4a0a0'},
      loop: selected ? {reverse: true} : false,
      to: {x: 100, y: '#b49999'},
    });
    // Set Z to half the total height so that keycaps are at the same level since the center
    // is in the middle and each row has a different height
    const [zDown, zUp] = [0, 0 + 8];
    const pressedState =
      DisplayMode.Test === mode
        ? TestKeyState.KeyDown === keyState
          ? KeycapState.Pressed
          : KeycapState.Unpressed
        : hovered || selected
        ? KeycapState.Unpressed
        : KeycapState.Pressed;
    const [keycapZ, rotationZ] =
      pressedState === KeycapState.Pressed
        ? [zDown, rotation[2]]
        : [zUp, rotation[2] + Math.PI * Number(shouldRotate)];
    const wasPressed = keyState === TestKeyState.KeyUp;
    const keycapColor =
      DisplayMode.Test === mode
        ? pressedState === KeycapState.Unpressed
          ? wasPressed
            ? 'palevioletred'
            : 'lightgrey'
          : 'pink'
        : pressedState === KeycapState.Unpressed
        ? 'lightgrey'
        : 'lightgrey';

    const {z, b, rotateZ, tooltipScale} = useSpring({
      config: {duration: 100},
      z: keycapZ,
      b: keycapColor,
      rotateZ: rotationZ,
      tooltipScale: !hovered ? 0 : 1,
    });

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
    ) : (
      <>
        <KeycapContainer
          {...props}
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
              props.position[1] -
              (CSSVarObject.keyHeight * textureHeight -
                CSSVarObject.keyHeight) /
                2
            }px) rotate(${-props.rotation[2]}rad)`,
            width:
              textureWidth * CSSVarObject.keyXPos - CSSVarObject.keyXSpacing,
            height:
              textureHeight * CSSVarObject.keyYPos - CSSVarObject.keyYSpacing,
          }}
        >
          <GlowContainer
            selected={selected}
            style={{
              background: getDarkenedColor(props.color.c, 0.8),
              borderRadius: 3,
              width:
                textureWidth * CSSVarObject.keyXPos - CSSVarObject.keyXSpacing,
              height:
                textureHeight * CSSVarObject.keyYPos - CSSVarObject.keyYSpacing,
            }}
          >
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
            <TooltipContainer rotate={rotation[2]}>
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

const KeycapContainer = styled.div<{position: [number, number]}>`
  position: absolute;
  left: 0;
  top: 0;
  width: 52px;
  height: 54px;
  &:hover {
    z-index: 1;
    & .tooltip {
      transform: scale(1) translateY(0px);
      opacity: 1;
    }
  }
  .tooltip {
    transform: translateY(5px) scale(0.6);
    opacity: 0;
  }
`;
const CanvasContainer = styled.div<{}>`
  box-shadow: inset -1px -1px 0 rgb(0 0 0 / 20%),
    inset 1px 1px 0 rgb(255 255 255 / 10%);
`;
const GlowContainer = styled.div<{selected: boolean}>`
  box-sizing: border-box;
  padding: 2px 6px 10px 6px;
  transition: transform 0.2s ease-out;
  transform: ${(p) =>
    p.selected
      ? 'perspective(100px) translateZ(-5px)'
      : 'perspective(100px) translateZ(0px)'};
  box-shadow: inset -1px -1px 0 rgb(0 0 0 / 20%),
    inset 1px 1px 0 rgb(255 255 255 / 20%);
  animation: ${(p) =>
    p.selected ? '1.5s infinite alternate select-glow' : 'initial'};
  &:hover {
    transform: perspective(100px) translateZ(-5px);
    animation: 0.5s 1 alternate select-glow;
  }
`;

const TooltipContainer = styled.div<{rotate: number}>`
  position: absolute;
  transform: rotate(${(p) => p.rotate}rad);
  width: 100%;
  height: 100%;
  bottom: 0;
`;
