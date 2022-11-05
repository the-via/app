import React, {useLayoutEffect, useMemo, useRef, useState} from 'react';
import {
  calculateKeyboardFrameDimensions,
  calculatePointPosition,
} from '../positioned-keyboard';
import {useAppSelector} from 'src/store/hooks';
import {
  getConnectedDevices,
  getSelectedConnectedDevice,
} from 'src/store/devicesSlice';
import {
  getBaseDefinitions,
  getDefinitions,
  getCustomDefinitions,
} from 'src/store/definitionsSlice';
import {
  Canvas,
  PerspectiveCameraProps,
  useFrame,
  useLoader,
  useThree,
  extend,
} from '@react-three/fiber';
import {PerspectiveCamera, useGLTF, OrbitControls} from '@react-three/drei';

import {getThemeFromStore} from 'src/utils/device-store';
import type {VIADefinitionV2, VIADefinitionV3} from 'via-reader';
import * as THREE from 'three';

type KeyboardDefinitionEntry = [string, VIADefinitionV2 | VIADefinitionV3];
useGLTF.preload('/fonts/keycap.glb');

function Box(props: any) {
  // This reference gives us direct access to the THREE.Mesh object
  const ref = useRef<any>();
  // Hold state for hovered and clicked events
  const [hovered, hover] = useState(false);
  const [clicked, click] = useState(false);
  // Subscribe this component to the render-loop, rotate the mesh every frame
  //  useFrame((state, delta) => (ref.current.rotation.x += 0.01));
  // Return the view, these are regular Threejs elements expressed in JSX
  // console.log(stl);
  //return (
  //)

  return (
    <>
      <mesh
        {...props}
        ref={ref}
        scale={0.06}
        onClick={(event) => click(!clicked)}
      >
        <boxGeometry args={[props.width, props.height, 20]} />

        <meshStandardMaterial color={props.color} />
      </mesh>
    </>
  );
}

function Keycap(props: any) {
  // This reference gives us direct access to the THREE.Mesh object
  const ref = useRef<any>();
  // Hold state for hovered and clicked events
  const [hovered, hover] = useState(false);
  const [clicked, click] = useState(false);
  // Subscribe this component to the render-loop, rotate the mesh every frame
  //  useFrame((state, delta) => (ref.current.rotation.x += 0.01));
  // Return the view, these are regular Threejs elements expressed in JSX
  // console.log(stl);
  //return (
  //)
  const {nodes, materials} = useGLTF('/fonts/keycap.glb');
  const canvasRef = useRef(document.createElement('canvas'));
  const textureRef = useRef<THREE.CanvasTexture>();

  useLayoutEffect(() => {
    const canvas = canvasRef.current;

    canvas.width = 2048;
    canvas.height = 2048;

    const context = canvas.getContext('2d');
    if (context) {
      context.rect(0, 0, canvas.width, canvas.height);
      context.fillStyle = 'beige';
      context.fill();

      context.fillStyle = 'black';
      const number = Math.round(36 * Math.random());
      if (number < 10) {
        const symbol = ')!@#$%^&*('[number];
        context.font = ' 250px Arial Rounded MT ';
        context.fillText(symbol, 2.1 * 385, 2 * 518);
        context.fillText(number.toString(), 2.1 * 385, 2.6 * 518);
      } else {
        context.font = 'bold 300px Arial';
        context.fillText(
          number.toString(36).toUpperCase(),
          2.1 * 385,
          2.1 * 518,
        );
      }
    }
  }, []);

  return (
    <>
      <mesh
        {...props}
        ref={ref}
        geometry={(nodes.Keycap_1U_GMK_R1 as any).geometry}
        onClick={(event) => {
          click(!clicked);
        }}
        onPointerOut={(event) => hover(false)}
      >
        <meshPhysicalMaterial attach="material">
          <canvasTexture
            minFilter={THREE.LinearMipMapNearestFilter}
            ref={textureRef}
            attach="map"
            image={canvasRef.current}
          />
        </meshPhysicalMaterial>
      </mesh>
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
  const outsideColor = '#FEFEFE';
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

const metaObj = JSON.parse(
  '{"uuid":"9941482f-23b4-4396-9b4c-aaf749777bc4","type":"PerspectiveCamera","layers":1,"matrix":[1,0,0,0,0,1,-5.739211039300938e-17,0,0,5.739211039300938e-17,1,0,10.607924676300991,-4.487255313393182,15.475618749999992,1],"fov":10,"zoom":0.25,"near":0.1,"far":100,"focus":10,"aspect":2.3813198884601303,"filmGauge":35,"filmOffset":0}',
);
export const KeyboardCanvas = () => {
  const selectedDevice = useAppSelector(getSelectedConnectedDevice);
  const allDefinitions = Object.entries(useAppSelector(getDefinitions))
    .flatMap(([id, versionMap]): KeyboardDefinitionEntry[] => [
      [id, versionMap.v2] as KeyboardDefinitionEntry,
      [id, versionMap.v3] as KeyboardDefinitionEntry,
    ])
    .filter(([_, definition]) => definition !== undefined);

  const [selectedDefinitionIndex, setSelectedDefinition] = useState(0);
  const [selectedOptionKeys, setSelectedOptionKeys] = useState<number[]>([]);

  const entry = allDefinitions[selectedDefinitionIndex];
  if (!entry) {
    return null;
  }
  const {keys, optionKeys} = entry[1].layouts;

  // This was previously memoised, but removed because it produced an inconsistent number of hooks error
  // because the memo was not called when selectedDefinition was null
  const displayedOptionKeys = optionKeys
    ? Object.entries(optionKeys).flatMap(([key, options]) => {
        const optionKey = parseInt(key);

        // If a selection option has been set for this optionKey, use that
        return selectedOptionKeys[optionKey]
          ? options[selectedOptionKeys[optionKey]]
          : options[0];
      })
    : [];
  const displayedKeys = [...entry[1].layouts.keys, ...displayedOptionKeys];
  const {width, height} = calculateKeyboardFrameDimensions(displayedKeys);

  return (
    <Canvas pixelRatio={2} camera={{zoom: 2}}>
      <OrbitControls makeDefault onEnd={console.log} />
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
      <group position={[-2, 1, 0]} scale={0.015}>
        <Case width={width} height={height} />
        <group scale={1} position={[-width / 2 + 0.4, height / 2 - 0.1, 0]}>
          {displayedKeys.map((k) => {
            const [x, y] = calculatePointPosition(k);
            const r = (k.r * (2 * Math.PI)) / 360;
            const theme = getThemeFromStore();
            const color = ['grey', 'cornsilk', '#BC8F8F'][
              Math.round(Math.random() * 2)
            ];
            return (
              <Keycap
                position={[(x * 19.05) / 54, (-(y - 0.867) * 19.05) / 56, 0]}
                rotation={[0, 0, -r]}
                scale={[k.w, k.h, 1]}
                color={color}
              />
            );
          })}
        </group>
      </group>
    </Canvas>
  );
};
