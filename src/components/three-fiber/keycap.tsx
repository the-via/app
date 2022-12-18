import {animated, useSpring} from '@react-spring/three';
import {ThreeEvent} from '@react-three/fiber';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {shallowEqual} from 'react-redux';
import * as THREE from 'three';
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
      idx,
    } = props;
    const ref = useRef<any>();
    // Hold state for hovered and clicked events
    const [hovered, hover] = useState(false);
    const textureRef = useRef<THREE.CanvasTexture>();
    const canvasRef = useRef(document.createElement('canvas'));
    const paintKeycap = (
      canvas: HTMLCanvasElement,
      [widthMultiplier, heightMultiplier]: [number, number],
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
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      const [xOffset, yOffset] = [2.5 * dpi, 15 * dpi];

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
            0.3 * canvas.height +
              242 * dpi * heightMultiplier +
              yOffset +
              75 * dpi,
          );
        } else if (label.centerLabel) {
          context.font = `bold ${37.5 * dpi}px ${fontFamily}`;
          context.fillText(
            label.centerLabel,
            0.02 * canvasSize + xOffset,
            0.3 * canvas.height + 270 * dpi * heightMultiplier + yOffset,
          );
        } else if (typeof label.label === 'string') {
          context.font = `bold ${80 * dpi}px ${fontFamily}`;
          context.fillText(
            label.label,
            0.02 * canvasSize + xOffset,
            0.3 * canvasHeight + canvasHeight / 2 + yOffset,
          );
        }
      }
    };

    const redraw = React.useCallback(() => {
      if (canvasRef.current) {
        paintKeycap(canvasRef.current, scale, color.c, color.t, label);
        textureRef.current!.needsUpdate = true;
      }
    }, [
      canvasRef.current,
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

    const {z, b, rotateZ} = useSpring({
      config: {duration: 100},
      z: keycapZ,
      b: keycapColor,
      rotateZ: rotationZ,
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
              encoding={THREE.LinearEncoding}
              ref={textureRef as any}
              attach="map"
              image={canvasRef.current}
            />
          </AniMeshMaterial>
        </animated.mesh>
      </>
    );
  },
  shallowEqual,
);
