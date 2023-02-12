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
  keycapRect: Rect,
  faceRect: Rect,
) => {
  const context = canvas.getContext('2d');
  if (context == null) {
    return;
  }
  context.strokeStyle = 'magenta';
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(
    keycapRect.bl.x * canvas.width,
    (1 - keycapRect.bl.y) * canvas.height,
  );
  context.lineTo(
    keycapRect.bl.x * canvas.width,
    (1 - keycapRect.tr.y) * canvas.height,
  );
  context.lineTo(
    keycapRect.tr.x * canvas.width,
    (1 - keycapRect.tr.y) * canvas.height,
  );
  context.lineTo(
    keycapRect.tr.x * canvas.width,
    (1 - keycapRect.bl.y) * canvas.height,
  );
  context.lineTo(
    keycapRect.bl.x * canvas.width,
    (1 - keycapRect.bl.y) * canvas.height,
  );
  context.stroke();
  context.beginPath();
  context.moveTo(
    faceRect.bl.x * canvas.width,
    (1 - faceRect.bl.y) * canvas.height,
  );
  context.lineTo(
    faceRect.bl.x * canvas.width,
    (1 - faceRect.tr.y) * canvas.height,
  );
  context.lineTo(
    faceRect.tr.x * canvas.width,
    (1 - faceRect.tr.y) * canvas.height,
  );
  context.lineTo(
    faceRect.tr.x * canvas.width,
    (1 - faceRect.bl.y) * canvas.height,
  );
  context.lineTo(
    faceRect.bl.x * canvas.width,
    (1 - faceRect.bl.y) * canvas.height,
  );
  context.stroke();
};

const paintKeycapLabel = (
  canvas: HTMLCanvasElement,
  rect: Rect,
  legendColor: string,
  label: any,
) => {
  const context = canvas.getContext('2d');
  if (context == null) {
    return;
  }
  const fontFamily = 'Arial Rounded MT, Arial Rounded MT Bold, Arial';
  // Margins from face edge to where text is drawn
  const margin = {x: 0.015, y: 0.1};
  const centerLabelMargin = {x: 0.015, y: 0};
  const singleLabelMargin = {x: 0.015, y: 0.15};
  const [canvasWidth1U, canvasHeight1U] = [
    CSSVarObject.keyWidth -
      CSSVarObject.faceXPadding.reduce((x, y) => x + y, 0),
    CSSVarObject.keyHeight -
      -CSSVarObject.faceYPadding.reduce((x, y) => x + y, 0),
  ];
  // Define a clipping path for the top face, so text is not drawn on the side.
  context.beginPath();
  context.moveTo(rect.bl.x * canvas.width, (1 - rect.bl.y) * canvas.height);
  context.lineTo(rect.bl.x * canvas.width, (1 - rect.tr.y) * canvas.height);
  context.lineTo(rect.tr.x * canvas.width, (1 - rect.tr.y) * canvas.height);
  context.lineTo(rect.tr.x * canvas.width, (1 - rect.bl.y) * canvas.height);
  context.lineTo(rect.bl.x * canvas.width, (1 - rect.bl.y) * canvas.height);
  context.clip();

  context.fillStyle = legendColor;
  if (label === undefined) {
  } else if (label.topLabel && label.bottomLabel) {
    //    let fontSize = 52;
    let fontSize = 15;
    let fontHeightTU = (0.5 * fontSize) / canvas.height;
    let topLabelOffset = label.offset[0] * fontHeightTU;
    let bottomLabelOffset = label.offset[1] * fontHeightTU;
    context.font = `bold ${fontSize}px ${fontFamily}`;
    context.fillText(
      label.topLabel,
      (rect.bl.x + margin.x) * canvas.width,
      (1 - (rect.tr.y - fontHeightTU - margin.y - topLabelOffset)) *
        canvas.height,
    );
    context.fillText(
      label.bottomLabel,
      (rect.bl.x + margin.x) * canvas.width,
      (1 - (rect.bl.y + margin.y + bottomLabelOffset)) * canvas.height,
    );
  } else if (label.centerLabel) {
    //    let fontSize = 37.5 * label.size;
    let fontSize = 13;
    let fontHeightTU = (0.75 * fontSize) / canvas.height;
    let faceMidLeftY = (rect.tr.y + rect.bl.y) / 2;
    context.font = `bold ${fontSize}px ${fontFamily}`;
    context.fillText(
      label.label,
      (rect.bl.x + centerLabelMargin.x) * canvasWidth1U,
      (1 - (faceMidLeftY - 0.5 * fontHeightTU - centerLabelMargin.y)) *
        canvas.height,
    );
    // return if label would have overflowed so that we know to show tooltip
    return (
      context.measureText(label.centerLabel).width >
      (rect.tr.x - (rect.bl.x + centerLabelMargin.x)) * canvasWidth1U
    );
  } else if (typeof label.label === 'string') {
    //   let fontSize = 75;
    let fontSize = 22;
    let fontHeightTU = (0.6 * fontSize) / canvas.height;
    context.font = `bold ${fontSize}px ${fontFamily}`;
    context.fillText(
      label.label,
      (rect.bl.x + singleLabelMargin.x) * canvasWidth1U,
      (1 - (rect.tr.y - fontHeightTU - singleLabelMargin.y)) * canvas.height,
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
    paintDebugLines(canvas, keycapRect, faceRect);
  }

  return paintKeycapLabel(canvas, faceRect, legendColor, label);
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
                padding: 1,
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
