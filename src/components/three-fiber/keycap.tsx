import {animated, useSpring} from '@react-spring/three';
import {Html} from '@react-three/drei';
import {ThreeEvent} from '@react-three/fiber';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {shallowEqual} from 'react-redux';
import {TestKeyState} from 'src/types/types';
import * as THREE from 'three';
import {KeycapTooltip} from '../inputs/tooltip';
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

type Coordinate = {
  x: number;
  y: number;
};

const drawDebugLines = (
  context: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  keycapBottomLeft: Coordinate,
  keycapTopRight: Coordinate,
  faceBottomLeft: Coordinate,
  faceTopRight: Coordinate,
) => {
  context.strokeStyle = 'magenta';
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(
    keycapBottomLeft.x * canvasWidth,
    (1 - keycapBottomLeft.y) * canvasHeight,
  );
  context.lineTo(
    keycapBottomLeft.x * canvasWidth,
    (1 - keycapTopRight.y) * canvasHeight,
  );
  context.lineTo(
    keycapTopRight.x * canvasWidth,
    (1 - keycapTopRight.y) * canvasHeight,
  );
  context.lineTo(
    keycapTopRight.x * canvasWidth,
    (1 - keycapBottomLeft.y) * canvasHeight,
  );
  context.lineTo(
    keycapBottomLeft.x * canvasWidth,
    (1 - keycapBottomLeft.y) * canvasHeight,
  );
  context.stroke();
  context.beginPath();
  context.moveTo(
    faceBottomLeft.x * canvasWidth,
    (1 - faceBottomLeft.y) * canvasHeight,
  );
  context.lineTo(
    faceBottomLeft.x * canvasWidth,
    (1 - faceTopRight.y) * canvasHeight,
  );
  context.lineTo(
    faceTopRight.x * canvasWidth,
    (1 - faceTopRight.y) * canvasHeight,
  );
  context.lineTo(
    faceTopRight.x * canvasWidth,
    (1 - faceBottomLeft.y) * canvasHeight,
  );
  context.lineTo(
    faceBottomLeft.x * canvasWidth,
    (1 - faceBottomLeft.y) * canvasHeight,
  );
  context.stroke();
};

const setClippingPath = (
  context: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  faceBottomLeft: Coordinate,
  faceTopRight: Coordinate,
) => {
  context.beginPath();
  context.moveTo(
    faceBottomLeft.x * canvasWidth,
    (1 - faceBottomLeft.y) * canvasHeight,
  );
  context.lineTo(
    faceBottomLeft.x * canvasWidth,
    (1 - faceTopRight.y) * canvasHeight,
  );
  context.lineTo(
    faceTopRight.x * canvasWidth,
    (1 - faceTopRight.y) * canvasHeight,
  );
  context.lineTo(
    faceTopRight.x * canvasWidth,
    (1 - faceBottomLeft.y) * canvasHeight,
  );
  context.lineTo(
    faceBottomLeft.x * canvasWidth,
    (1 - faceBottomLeft.y) * canvasHeight,
  );
  context.clip();
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
  const fontFamily = 'Arial Rounded MT, Arial Rounded MT Bold';
  const canvasSize = 512;
  const [canvasWidth, canvasHeight] = [
    canvasSize * widthMultiplier,
    canvasSize * heightMultiplier,
  ];
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  const context = canvas.getContext('2d');
  if (context) {
    context.fillStyle = bgColor;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = legendColor;

    // Constants used in texture coordinate (UV) mapping
    // See update-uv-maps.ts
    const size1u = 1 / 2.6;
    const unitScale = 19.05;
    const offsetToCorner = 0.445;
    const gap = (offsetToCorner / unitScale) * size1u;

    // Margins from face edge to where text is drawn
    const margin = {x: 0.02, y: 0.02};

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

    // coordinates of corners of keycap in texture coordinates (UVs)
    let keycapBottomLeft = {x: gap, y: gap};
    let keycapTopLeft = {x: gap, y: keycapHeight * size1u - gap};
    let keycapBottomRight = {
      x: keycapWidth * size1u - gap,
      y: keycapBottomLeft.y,
    };
    let keycapTopRight = {x: keycapWidth * size1u - gap, y: keycapTopLeft.y};

    // coordinates of corners of top face in texture coordinates (UVs)
    let faceBottomLeft = {
      x: keycapBottomLeft.x + 0.07,
      y: keycapBottomLeft.y + 0.08,
    };
    let faceTopLeft = {
      x: keycapBottomLeft.x + 0.07,
      y: keycapTopLeft.y - 0.0146,
    };
    let faceBottomRight = {x: keycapBottomRight.x - 0.07, y: faceBottomLeft.y};
    let faceTopRight = {x: keycapBottomRight.x - 0.07, y: faceTopLeft.y};

    // coordinates of vertical center of top face in texture coordinates (UVs)
    // (used for vertically centered legends)
    let faceMidLeft = {
      x: faceBottomLeft.x,
      y: (faceTopLeft.y + faceBottomLeft.y) / 2,
    };

    // textureOffsetX is the X offset in U from the left edge of the keycap shape
    // to the left edge of the narrower part of the keycap shape, when it's an ISO or BAE.
    // Multiplying by size1u converts it to an offset in TU
    // Add to the existing offset from keycap left edge to face left edge
    if (textureOffsetX > 0) {
      faceBottomLeft.x += textureOffsetX * size1u;
      faceTopLeft.x += textureOffsetX * size1u;
      faceMidLeft.x += textureOffsetX * size1u;
      faceBottomRight.x += textureOffsetX * size1u;
      faceTopRight.x += textureOffsetX * size1u;
      keycapBottomLeft.x += textureOffsetX * size1u;
      keycapTopLeft.x += textureOffsetX * size1u;
      keycapBottomRight.x += textureOffsetX * size1u;
      keycapTopRight.x += textureOffsetX * size1u;
    }

    // Leaving this here for future maintenance.
    // This draws lines around the keycap edge and the top face edge,
    // *or* a clipped area within it when keycaps are large, vertical or odd shapes.
    const debug = false;
    if (debug) {
      drawDebugLines(
        context,
        canvasWidth,
        canvasHeight,
        keycapBottomLeft,
        keycapTopRight,
        faceBottomLeft,
        faceTopRight,
      );
    }

    // Define a clipping path for the top face, so text is not drawn on the side.
    setClippingPath(
      context,
      canvasWidth,
      canvasHeight,
      faceBottomLeft,
      faceTopRight,
    );

    if (label === undefined) {
    } else if (label.topLabel && label.bottomLabel) {
      let fontSize = 54;
      let fontHeightTU = (0.75 * fontSize) / canvasHeight;
      context.font = `bold ${fontSize}px ${fontFamily}`;
      context.fillText(
        label.topLabel,
        (faceTopLeft.x + margin.x) * canvasWidth,
        (1 - (faceTopLeft.y - fontHeightTU - margin.y)) * canvasHeight,
      );
      context.fillText(
        label.bottomLabel,
        (faceBottomLeft.x + margin.x) * canvasWidth,
        (1 - (faceBottomLeft.y + margin.y)) * canvasHeight,
      );
    } else if (label.centerLabel) {
      let fontSize = 37.5 * label.size;
      let fontHeightTU = (0.75 * fontSize) / canvasHeight;
      context.font = `bold ${fontSize}px ${fontFamily}`;
      context.fillText(
        label.label,
        (faceMidLeft.x + margin.x) * canvasWidth,
        (1 - (faceMidLeft.y - 0.5 * fontHeightTU)) * canvasHeight,
      );
      // return if label would have overflowed so that we know to show tooltip
      return (
        context.measureText(label.centerLabel).width >
        (faceBottomRight.x - (faceBottomLeft.x + margin.x)) * canvasWidth
      );
    } else if (typeof label.label === 'string') {
      let fontSize = 75;
      let fontHeightTU = (0.75 * fontSize) / canvasHeight;
      context.font = `bold ${fontSize}px ${fontFamily}`;
      context.fillText(
        label.label,
        (faceTopLeft.x + margin.x) * canvasWidth,
        (1 - (faceTopLeft.y - fontHeightTU - margin.y)) * canvasHeight,
      );
    }
  }
};

export const Keycap = React.memo(
  (props: any & {mode: DisplayMode; idx: number}) => {
    const {
      label,
      scale,
      color,
      onClick,
      selected,
      disabled,
      mode,
      rotation,
      keyState,
      shouldRotate,
      keycapGeometry,
      textureOffsetX,
      textureWidth,
      textureHeight,
      onPointerOver,
      onPointerDown,
      idx,
    } = props;
    const ref = useRef<any>();
    const macroData = label && getMacroData(label);
    const [overflowsTexture, setOverflowsTexture] = useState(false);
    // Hold state for hovered and clicked events
    const [hovered, hover] = useState(false);
    const textureRef = useRef<THREE.CanvasTexture>();
    const canvasRef = useRef(document.createElement('canvas'));
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
          textureRef.current!.needsUpdate = true;
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
    let maxZ = keycapGeometry.boundingBox.max.z;
    const [zDown, zUp] = [maxZ, maxZ + 8];
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

    const [
      meshOnClick,
      meshOnPointerOver,
      meshOnPointerOut,
      meshOnPointerDown,
    ] = useMemo(() => {
      const noop = () => {};
      return disabled
        ? [noop, noop, noop, noop]
        : props.mode === DisplayMode.ConfigureColors
        ? [
            noop,
            (evt: ThreeEvent<MouseEvent>) => {
              if (onPointerOver) {
                onPointerOver(evt, idx);
              }
            },
            noop,
            (evt: ThreeEvent<MouseEvent>) => {
              if (onPointerDown) {
                onPointerDown(evt, idx);
              }
            },
          ]
        : [
            (evt: ThreeEvent<MouseEvent>) => onClick(evt, idx),
            (evt: ThreeEvent<MouseEvent>) => {
              if (onPointerOver) {
                onPointerOver(evt, idx);
              }
              hover(true);
            },
            () => hover(false),
            (evt: ThreeEvent<MouseEvent>) => {
              if (onPointerDown) {
                onPointerDown(evt, idx);
              }
            },
          ];
    }, [disabled, onClick, onPointerDown, onPointerOver, hover, idx, mode]);

    const AniMeshMaterial = animated.meshPhongMaterial as any;

    return (
      <>
        <animated.mesh
          {...props}
          ref={ref}
          position-z={z}
          rotation-z={rotateZ}
          onClick={meshOnClick}
          onPointerDown={meshOnPointerDown}
          onPointerOver={meshOnPointerOver}
          onPointerOut={meshOnPointerOut}
          geometry={keycapGeometry}
        >
          <AniMeshMaterial attach="material" color={selected ? glow.y : b}>
            <canvasTexture
              ref={textureRef as any}
              attach="map"
              image={canvasRef.current}
            />
          </AniMeshMaterial>
        </animated.mesh>
        {(macroData || overflowsTexture) && (
          <React.Suspense fallback={null}>
            <animated.group
              position={props.position}
              position-z={20}
              scale={tooltipScale}
            >
              <Html
                transform
                style={{
                  pointerEvents: 'none',
                }}
              >
                <KeycapTooltip>
                  {macroData || (label && label.tooltipLabel)}
                </KeycapTooltip>
              </Html>
            </animated.group>
          </React.Suspense>
        )}
      </>
    );
  },
  shallowEqual,
);
