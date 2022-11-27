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
import {
  getDefinitions,
  getBasicKeyToByte,
  getSelectedKeyDefinitions,
  getSelectedDefinition,
} from 'src/store/definitionsSlice';
import {Canvas, useFrame, useThree} from '@react-three/fiber';
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
import {Vector3} from 'three';
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
  const redraw = React.useCallback(
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
    },
    [canvasRef.current, label, scale, color],
  );

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
const GROUND_HEIGHT = -300; // A Constant to store the ground height of the game.

function Terrain() {
  const terrain = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (terrain && terrain.current && terrain.current.position) {
      terrain.current.position.y -= 0.1;
      terrain.current.position.z += 0.1;
      (terrain.current.material as THREE.Material).opacity =
        1 + 0.5 * Math.sin(terrain.current.position.y / 12);
      console.log(terrain.current);
    }
  });
  return (
    <>
      <mesh
        visible
        position={[0, GROUND_HEIGHT, 0]}
        rotation={[-Math.PI / 4, 0, 0]}
        ref={terrain}
      >
        <planeBufferGeometry
          attach="geometry"
          args={[10000, 10000, 256, 256]}
        />
        <meshStandardMaterial
          attach="material"
          color="#454040"
          roughness={1}
          metalness={0}
          transparent={true}
          wireframe
        />
      </mesh>
    </>
  );
}

export const Case = (props: {width: number; height: number}) => {
  const camera = useThree((state) => state.camera);
  const glow = useSpring({
    config: {duration: 800},
    from: {x: 10},
    to: {x: 7},
  });
  useFrame(() => {
    camera.position.setZ(glow.x.get());
    camera.position.setY(0.4 * Math.pow(glow.x.get() - 7, 1));
  });

  const innerColor = '#454545';
  const outsideColor = '#948e8e';
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
    <group position={[0, 0, (-9.4 * 19.5) / 7]} scale={19.5}>
      <mesh>
        <extrudeBufferGeometry
          attach="geometry"
          args={[outsideShape, {bevelEnabled: false, depth}]}
        />
        <meshPhysicalMaterial
          roughness={0.7}
          clearcoat={1}
          transmission={0.3}
          thickness={1}
          color={outsideColor}
          transparent={true}
          opacity={1}
          metalness={0}
        />
      </mesh>
      <mesh position={[0, 0, 0]}>
        <extrudeBufferGeometry
          attach="geometry"
          args={[innerShape, {bevelEnabled: false, depth: depth + 0.1}]}
        />
        <meshPhysicalMaterial
          roughness={0.7}
          clearcoat={1}
          transmission={1}
          thickness={1}
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
  const allowOrbiting = true;

  return (
    <div style={{height: 500, width: '100%'}}>
      <Canvas
        camera={{zoom: 5.5, fov: 80}}
        onPointerMissed={(evt: any) => {
          dispatch(updateSelectedKey(null));
        }}
      >
        <spotLight position={[-10, 0, -5]} intensity={1} />
        {allowOrbiting && <OrbitControls makeDefault onEnd={console.log} />}
        <ambientLight />
        <pointLight position={[10, 10, 5]} />
        <group position={[0, -0.05, 0]} scale={0.015}>
          <Terrain />
          <Case width={width} height={height} />
          <group
            scale={1}
            position={[(-width * 19.05) / 2, (19.05 * height) / 2, 0]}
          >
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
