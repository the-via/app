import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {useSpring, animated} from '@react-spring/three';
import type {KeyColor} from '../../utils/themes';
import type {VIAKey, KeyColorType} from '@the-via/reader';
import {
  calculateKeyboardFrameDimensions,
  calculatePointPosition,
} from '../positioned-keyboard';
import {useAppSelector} from 'src/store/hooks';
import {getSelectedConnectedDevice} from 'src/store/devicesSlice';
import {
  getDefinitions,
  getBasicKeyToByte,
  getSelectedKeyDefinitions,
  getSelectedDefinition,
} from 'src/store/definitionsSlice';
import {Canvas} from '@react-three/fiber';
import {useGLTF, OrbitControls} from '@react-three/drei';

import {getThemeFromStore} from 'src/utils/device-store';
import type {VIADefinitionV2, VIADefinitionV3} from '@the-via/reader';
import * as THREE from 'three';
import {
  getSelectedKey,
  getSelectedKeymap,
  updateSelectedKey,
} from 'src/store/keymapSlice';
import {useDispatch} from 'react-redux';
import {getLabel} from '../positioned-keyboard/base';
import {useAppDispatch} from 'src/store/hooks';
export const getColors = ({color}: {color: KeyColorType}): KeyColor =>
  getThemeFromStore()[color];

type KeyboardDefinitionEntry = [string, VIADefinitionV2 | VIADefinitionV3];
useGLTF.preload('/fonts/keycap.glb');

function Keycap(props: any) {
  // This reference gives us direct access to the THREE.Mesh object
  const {label, scale, color, selected, position} = props;
  const ref = useRef<any>();
  // Hold state for hovered and clicked events
  const [hovered, hover] = useState(false);
  // Subscribe this component to the render-loop, rotate the mesh every frame
  //  useFrame((state, delta) => (ref.current.rotation.x += 0.01));
  // Return the view, these are regular Threejs elements expressed in JSX
  // console.log(stl);
  //return (
  //)
  const textureRef = useRef<THREE.CanvasTexture>();
  const {nodes} = useGLTF('/fonts/keycap.glb');
  const canvasRef = useRef(document.createElement('canvas'));
  useEffect(() => {
    document.body.style.cursor = hovered ? 'pointer' : 'auto';
    return () => {
      document.body.style.cursor = 'auto';
    };
  }, [hovered]);
  function redraw() {
    const canvas = canvasRef.current;
    const widthMultiplier = scale[0];

    canvas.width = 2048 * widthMultiplier;
    canvas.height = 2048;
    const [xOffset, yOffset] = [20, 60];
    const {c, t} = false ? {c: color.t, t: color.c} : color;

    const context = canvas.getContext('2d');
    if (context) {
      context.rect(0, 0, canvas.width, canvas.height);
      context.fillStyle = c;
      context.fill();

      context.fillStyle = t;
      if (label.topLabel && label.bottomLabel) {
        context.font = ' 220px Arial Rounded MT ';
        context.fillText(
          label.topLabel,
          0.02 * 2048 + xOffset,
          0.3 * 2048 + 970 + yOffset,
        );
        context.fillText(
          label.bottomLabel,
          0.02 * 2048 + xOffset,
          0.3 * 2048 + 970 + yOffset + 300,
        );
      } else if (label.centerLabel) {
        context.font = 'bold 150px Arial Rounded MT';
        context.fillText(
          label.centerLabel,
          0.02 * 2048 + xOffset,
          0.3 * 2048 + 1080 + yOffset,
        );
      } else if (label.label) {
        context.font = 'bold 320px Arial Rounded MT';
        context.fillText(
          label.label,
          0.02 * 2048 + xOffset,
          0.3 * 2048 + 1024 + yOffset,
        );
      }
      textureRef.current!.needsUpdate = true;
    }
  }

  const glow = useSpring({
    config: {duration: 800},
    from: {x: 0},
    loop: selected ? {reverse: true} : false,
    to: {x: 100},
  });
  const {p} = useSpring({
    config: {duration: 100},
    p: [position[0], position[1], selected || hovered ? 3 : -2],
  });
  const cc = glow.x.to([0, 100], ['#ffffff', '#847777']);
  useLayoutEffect(() => {
    redraw();
  }, [label, props.selected]);

  const AniMeshMaterial = animated.meshPhysicalMaterial as any;
  return (
    <>
      <animated.mesh
        {...props}
        ref={ref}
        position={p}
        onPointerOver={() => !props.disabled && hover(true)}
        onPointerOut={() => !props.disabled && hover(false)}
        geometry={(nodes.Keycap_1U_GMK_R1 as any).geometry}
      >
        <AniMeshMaterial attach="material" color={selected ? cc : 'white'}>
          <canvasTexture
            minFilter={THREE.LinearMipMapNearestFilter}
            ref={textureRef as any}
            attach="map"
            image={canvasRef.current}
          />
        </AniMeshMaterial>
      </animated.mesh>
    </>
  );
}
function makeShape({width, height}: {width: number; height: number}) {
  const shape = new THREE.Shape();

  let sizeX = width;
  let sizeY = height;
  let radius = 0.2;

  let halfX = sizeX * 0.5 - radius;
  let halfY = sizeY * 0.5 - radius;
  let baseAngle = Math.PI * 0.5;
  shape.absarc(
    halfX,
    halfY,
    radius,
    baseAngle * 0,
    baseAngle * 0 + baseAngle,
    false,
  );
  shape.absarc(
    -halfX,
    halfY,
    radius,
    baseAngle * 1,
    baseAngle * 1 + baseAngle,
    false,
  );
  shape.absarc(
    -halfX,
    -halfY,
    radius,
    baseAngle * 2,
    baseAngle * 2 + baseAngle,
    false,
  );
  shape.absarc(
    halfX,
    -halfY,
    radius,
    baseAngle * 3,
    baseAngle * 3 + baseAngle,
    false,
  );
  return shape;
}

export const Case = (props: {width: number; height: number}) => {
  const innerColor = '#454545';
  const outsideColor = '#af8e8e';
  const widthOffset = 0.4;
  const depth = 1.0;
  const outsideShape = useMemo(() => {
    return makeShape({
      width: props.width + widthOffset,
      height: props.height + widthOffset,
    });
  }, []);
  const innerShape = useMemo(() => {
    return makeShape({
      ...props,
    });
  }, []);
  return (
    <group
      position={[
        (props.width * 19.5) / 2 - 1.5 * widthOffset * 19.5,
        (props.height * -19.5) / 2 + (widthOffset * 19.5) / 2,
        (-9.4 * 19.5) / 7,
      ]}
      scale={19.5}
    >
      <mesh>
        <extrudeBufferGeometry
          attach="geometry"
          args={[outsideShape, {bevelEnabled: false, depth}]}
        />
        <meshPhongMaterial color={outsideColor} />
      </mesh>
      <mesh position={[0, 0, 0.05]}>
        <extrudeBufferGeometry
          attach="geometry"
          args={[innerShape, {bevelEnabled: false, depth: depth + 0.1}]}
        />
        <meshStandardMaterial
          color={innerColor}
          transparent={true}
          opacity={0.9}
        />
      </mesh>
    </group>
  );
};

export const KeyboardCanvas = (props: {selectable?: boolean}) => {
  const dispatch = useAppDispatch();

  const selectedKey = useAppSelector(getSelectedKey);
  const {basicKeyToByte, byteToKey} = useAppSelector(getBasicKeyToByte);
  const matrixKeycodes = useAppSelector(
    (state) => getSelectedKeymap(state) || [],
  );
  const macros = useAppSelector((state) => state.macros);
  const keys: (VIAKey & {ei?: number})[] = useAppSelector(
    getSelectedKeyDefinitions,
  );
  const selectedDefinition = useAppSelector(getSelectedDefinition);
  if (!selectedDefinition || !keys) {
    return null;
  }
  const selectedDevice = useAppSelector(getSelectedConnectedDevice);
  const allDefinitions = Object.entries(useAppSelector(getDefinitions))
    .flatMap(([id, versionMap]): KeyboardDefinitionEntry[] => [
      [id, versionMap.v2] as KeyboardDefinitionEntry,
      [id, versionMap.v3] as KeyboardDefinitionEntry,
    ])
    .filter(([_, definition]) => definition !== undefined);

  const [selectedDefinitionIndex, setSelectedDefinition] = useState(0);

  const entry = allDefinitions[selectedDefinitionIndex];
  if (!entry) {
    return null;
  }
  const displayedKeys = [...keys];
  const {width, height} = calculateKeyboardFrameDimensions(displayedKeys);

  return (
    <div style={{height: 400, width: '100%'}}>
      <Canvas
        camera={{zoom: 4.2, fov: 80}}
        onPointerMissed={(evt: any) => {
          dispatch(updateSelectedKey(null));
        }}
      >
        <spotLight position={[-10, 0, -5]} intensity={1} />

        {false && <OrbitControls makeDefault onEnd={console.log} />}
        <ambientLight />
        <pointLight position={[10, 10, 5]} />
        <group position={[-2, 0.75, 0]} scale={0.015}>
          <Case width={width} height={height} />
          <group scale={1} position={[-width / 2 + 0.4, height / 2 - 0.1, 0]}>
            {displayedKeys.map((k, i) => {
              const [x, y] = calculatePointPosition(k);
              const r = (k.r * (2 * Math.PI)) / 360;
              return (
                <Keycap
                  position={[(x * 19.05) / 54, (-(y - 0.867) * 19.05) / 56, 0]}
                  rotation={[0, 0, -r]}
                  scale={[k.w, k.h, 1]}
                  color={getColors(k)}
                  onClick={(evt: any) => {
                    if (props.selectable) {
                      dispatch(updateSelectedKey(i));
                    }
                  }}
                  disabled={!props.selectable}
                  selected={i === selectedKey}
                  label={getLabel(
                    matrixKeycodes[i],
                    k.w,
                    macros,
                    selectedDefinition,
                    basicKeyToByte,
                    byteToKey,
                  )}
                />
              );
            })}
          </group>
        </group>
      </Canvas>
    </div>
  );
};
