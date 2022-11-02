import React, {useMemo, useRef, useState} from 'react';
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

  return (
    <>
      <mesh
        {...props}
        ref={ref}
        geometry={(nodes.Keycap_1U_GMK_R1 as any).geometry}
        onClick={(event) => click(!clicked)}
        onPointerOver={(event) => hover(true)}
        onPointerOut={(event) => hover(false)}
      >
        <meshStandardMaterial color={props.color} />
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
    return makeShape({width: props.width, height: props.height + widthOffset});
  }, []);
  const innerShape = useMemo(() => {
    return makeShape({...props, width: props.width - widthOffset});
  }, []);
  return (
    <group position={[0, 0, -1.5]}>
      <mesh>
        <extrudeBufferGeometry
          attach="geometry"
          args={[outsideShape, {bevelEnabled: false, depth}]}
        />
        <meshStandardMaterial color={outsideColor} />
      </mesh>
      <mesh position={[0, 0, 0.05]}>
        <extrudeBufferGeometry
          attach="geometry"
          args={[innerShape, {bevelEnabled: false, depth: depth + 0.1}]}
        />
        <meshStandardMaterial color={innerColor} />
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

  const entry = allDefinitions[selectedDefinitionIndex];
  if (!entry) {
    return null;
  }
  const {width, height} = calculateKeyboardFrameDimensions(
    entry[1].layouts.keys,
  );

  return (
    <Canvas camera={{zoom: 2}}>
      <OrbitControls makeDefault onEnd={console.log} />
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
      <group position={[0, 0, 0]} scale={0.25}>
        <Case width={width} height={height} />
        <group
          scale={0.0175}
          position={[-width / 2 + 0.4, height / 2 - 0.1, 0]}
        >
          {entry[1].layouts.keys.map((k) => {
            const [x, y] = calculatePointPosition(k);
            const r = (k.r * (2 * Math.PI)) / 360;
            const theme = getThemeFromStore();
            const color = ['grey', 'cornsilk', '#BC8F8F'][
              Math.round(Math.random() * 2)
            ];
            return (
              <Keycap
                position={[x, -y, 0]}
                rotation={[0, 0, -r]}
                scale={[k.w * 2.75, 2.75, 2.75]}
                color={color}
              />
            );
          })}
        </group>
      </group>
    </Canvas>
  );
};
