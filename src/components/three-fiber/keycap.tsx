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
  const dpi = 1;
  const canvasSize = 512 * dpi;
  const [canvasWidth, canvasHeight] = [
    canvasSize * widthMultiplier,
    canvasSize * heightMultiplier,
  ];
  canvas.width = canvasWidth * 1;
  canvas.height = canvasHeight;
  //  const [xOffset, yOffset] = [2.5 * dpi, 15 * dpi];
  const [xOffset, yOffset] = [
    32.5 * dpi + (canvasWidth * textureOffsetX * dpi) / 2,
    -20 * heightMultiplier * dpi,
  ];

  const context = canvas.getContext('2d');
  if (context) {
    context.fillStyle = bgColor;
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.fillStyle = legendColor;
    if (label === undefined) {
    } else if (label.topLabel && label.bottomLabel) {
      context.font = `${54 * dpi}px ${fontFamily}`;
      context.fillText(
        label.topLabel,
        0.02 * canvasSize + xOffset,
        0.3 * canvas.height + 242 * dpi * heightMultiplier + yOffset,
      );
      context.fillText(
        label.bottomLabel,
        0.02 * canvasSize + xOffset,
        0.3 * canvas.height + 242 * dpi * heightMultiplier + yOffset + 75 * dpi,
      );
    } else if (label.centerLabel) {
      context.font = `bold ${37.5 * dpi}px ${fontFamily}`;
      context.fillText(
        label.centerLabel,
        0.02 * canvasSize + xOffset,
        0.3 * canvas.height + 270 * dpi * heightMultiplier + yOffset,
      );
      // return if label would have overflowed so that we know to show tooltip
      return (
        context.measureText(label.centerLabel).width >
        (textureWidth * canvasSize) / 4.5
      );
    } else if (typeof label.label === 'string') {
      context.font = `bold ${75 * dpi}px ${fontFamily}`;
      context.fillText(
        label.label,
        0.03 * canvasSize + xOffset,
        0.3 * canvasHeight + canvasHeight / 2 + yOffset,
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
