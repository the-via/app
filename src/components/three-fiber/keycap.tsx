import {animated, useSpring} from '@react-spring/three';
import {Html} from '@react-three/drei';
import {ThreeEvent} from '@react-three/fiber';
import {KeyColorType, VIAKey} from '@the-via/reader';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {shallowEqual} from 'react-redux';
import * as THREE from 'three';
import {getColors} from '../positioned-keyboard';
import {TestKeyState} from '../test-keyboard';

export enum DisplayMode {
  Test = 1,
  Configure = 2,
  Design = 3,
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
export const getGeometry = (k: VIAKey) => {
  switch (k.w) {
    case 1:
    case 1.25:
    case 1.5:
    case 1.75:
    case 2:
    case 2.25:
    case 2.75:
    case 6.25:
    case 7: {
      return `Vex${k.w * 100}U`;
    }
    default: {
      return 'Vex100U';
    }
  }
};

export const getScale = (k: VIAKey, scale: number[]) => {
  switch (k.w) {
    case 1.25:
    case 1.5:
    case 1.75:
    case 2:
    case 2.25:
    case 2.75:
    case 6.25:
    case 7:
    case 2.75: {
      return [1, 1, 1];
    }
    case 1: {
      return k.h === 2 ? scale : [1, 1, 1];
    }
    default: {
      return scale;
    }
  }
};

const paintKeycap = (
  canvas: HTMLCanvasElement,
  [widthMultiplier, heightMultiplier]: [number, number],
  textureWidth: number,
  bgColor: string,
  legendColor: string,
  label: any,
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
  const [xOffset, yOffset] = [30 * dpi, -15 * dpi];

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
      textureWidth,
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
      if (canvasRef.current) {
        const doesOverflow = paintKeycap(
          canvasRef.current,
          scale,
          textureWidth,
          color.c,
          color.t,
          label,
        );
        setOverflowsTexture(!!doesOverflow);
        textureRef.current!.needsUpdate = true;
      }
    }, [
      canvasRef.current,
      textureWidth,
      label && label.key,
      scale[0],
      scale[1],
      color.t,
      color.c,
    ]);
    useEffect(redraw, [label && label.key]);

    const glow = useSpring({
      config: {duration: 800},
      from: {x: 0, y: '#f4a0a0'},
      loop: selected ? {reverse: true} : false,
      to: {x: 100, y: '#b49999'},
    });
    const [zDown, zUp] = [0, 8];
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

    const [meshOnClick, meshOnPointerOver, meshOnPointerOut] = useMemo(() => {
      const noop = () => {};
      return disabled
        ? [noop, noop, noop]
        : [
            (evt: ThreeEvent<MouseEvent>) => onClick(evt, idx),
            () => hover(true),
            () => hover(false),
          ];
    }, [disabled, onClick, hover, idx]);

    const AniMeshMaterial = animated.meshPhongMaterial as any;

    if (overflowsTexture) {
      console.log(label, label.tooltipLabel);
      console.log('overvoerijvoaei');
    }
    return (
      <>
        <animated.mesh
          {...props}
          ref={ref}
          position-z={z}
          rotation-z={rotateZ}
          onClick={meshOnClick}
          onPointerOver={meshOnPointerOver}
          onPointerOut={meshOnPointerOut}
          geometry={props.keycapGeometry}
        >
          <AniMeshMaterial attach="material" color={selected ? glow.y : b}>
            <canvasTexture
              flipY={false}
              encoding={THREE.LinearEncoding}
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
                <Tooltip>{macroData || label.tooltipLabel}</Tooltip>
              </Html>
            </animated.group>
          </React.Suspense>
        )}
      </>
    );
  },
  shallowEqual,
);

const Tooltip: React.FC<any> = (props) => {
  const accent = useMemo(() => getColors({color: KeyColorType.Accent}), []);
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        marginTop: -800,
      }}
    >
      <div
        style={{
          padding: '70px 70px',
          background: `${accent.c}`,
          color: `${accent.t}`,
          borderRadius: 100,
          fontSize: 200,
          fontFamily: 'Source Code Pro',
          whiteSpace: 'nowrap',
          letterSpacing: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontWeight: 'bold',
        }}
      >
        {props.children}
      </div>
      <div
        style={{
          height: 150,
          width: 150,
          marginTop: -100,
          transform: 'rotate(45deg)',
          background: accent.c,
        }}
      ></div>
    </div>
  );
};
