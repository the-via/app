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

import type {VIADefinitionV2, VIADefinitionV3} from '@the-via/reader';
import * as THREE from 'three';
import {
  getSelectedKey,
  getSelectedKeymap,
  updateSelectedKey,
} from 'src/store/keymapSlice';
import {CSSVarObject, getLabel} from '../positioned-keyboard/base';
import {useAppDispatch} from 'src/store/hooks';
export const getColors = ({color}: {color: KeyColorType}): KeyColor => ({
  c: '#202020',
  t: 'papayawhip',
});

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
  const canvasRef = useRef(document.createElement('canvas'));
  useEffect(() => {
    document.body.style.cursor = hovered ? 'pointer' : 'auto';
    return () => {
      document.body.style.cursor = 'auto';
    };
  }, [hovered]);
  const redraw = React.useCallback(() => {
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
  }, [
    canvasRef.current,
    label.label,
    label.topLabel,
    label.macroExpression,
    scale,
    color.t,
    color.c,
  ]);

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
  }, [label.label, label.topLabel, label.centerLabel, props.selected]);

  const AniMeshMaterial = animated.meshPhysicalMaterial as any;
  return (
    <>
      <animated.mesh
        {...props}
        ref={ref}
        position={p}
        onPointerOver={() => !props.disabled && hover(true)}
        onPointerOut={() => !props.disabled && hover(false)}
        geometry={props.keycapGeometry}
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
  let radius = 0.1;

  let halfX = sizeX * 0.5 - radius;
  let halfY = sizeY * 0.5 - radius;
  let baseAngle = Math.PI * 0.5;
  let inclineAngle = (Math.PI * 7.5) / 180;
  shape.absarc(
    halfX + Math.atan(inclineAngle) * sizeY,
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
  const [width, height] = [2500, 1250];
  const terrain1 = useRef<THREE.Mesh>(null);
  const terrain2 = useRef<THREE.Mesh>(null);
  let terrains = [terrain1, terrain2];
  useFrame(() => {
    if (terrains[1].current && terrains[1].current?.position.y <= -300) {
      terrains = [terrain2, terrain1];
      (terrains[0].current as any).position.y = GROUND_HEIGHT;
      (terrains[0].current as any).position.z = 0;
      (terrains[1].current as any).position.y =
        GROUND_HEIGHT + height * Math.sin(Math.PI / 4);
      (terrains[1].current as any).position.z = -height * Math.sin(Math.PI / 4);
    }
    for (let terrain of terrains) {
      if (terrain && terrain.current && terrain.current.position) {
        terrain.current.position.y -= 0.1;
        terrain.current.position.z += 0.1;
        (terrain.current.material as THREE.Material).opacity =
          1 + 0.5 * Math.sin((terrains[0].current as any).position.y / 12);
      }
    }
  });
  return (
    <>
      <mesh
        visible
        position={[0, GROUND_HEIGHT, 0]}
        rotation={[-Math.PI / 4, 0, 0]}
        ref={terrain1}
      >
        <planeGeometry attach="geometry" args={[width, height, 64, 32]} />
        <meshStandardMaterial
          attach="material"
          color="#454040"
          roughness={1}
          metalness={0}
          transparent={true}
          wireframe
        />
      </mesh>
      <mesh
        visible
        position={[
          0,
          GROUND_HEIGHT + height * Math.sin(Math.PI / 4),
          -height * Math.sin(Math.PI / 4),
        ]}
        rotation={[-Math.PI / 4, 0, 0]}
        ref={terrain2}
      >
        <planeGeometry attach="geometry" args={[width, height, 64, 32]} />
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
  const innerColor = '#454545';
  const outsideColor = '#906060';
  const widthOffset = 0.4;
  const heightOffset = 0.5;
  const depthOffset = 0.5;
  const outsideShape = useMemo(() => {
    return makeShape({
      width: 0.4 + widthOffset,
      height: props.height + heightOffset,
    });
  }, []);
  const innerShape = useMemo(() => {
    return makeShape({
      width: 0.4,
      height: props.height + heightOffset / 2,
    });
  }, []);

  return (
    <group
      position={[
        (19.05 * (props.width + depthOffset)) / 2,
        heightOffset / 2,
        (-1 - 0.1) * 19.05,
      ]}
      scale={19.05}
      rotation={new THREE.Euler(-(Math.PI * 7.5) / 180, -Math.PI / 2, 0)}
    >
      <mesh position={[0, -0.1, 0]}>
        <extrudeGeometry
          attach="geometry"
          args={[
            outsideShape,
            {
              bevelEnabled: true,
              bevelSize: 0.1,
              bevelThickness: 0.1,
              bevelSegments: 10,
              depth: props.width + depthOffset,
            },
          ]}
        />
        <meshPhysicalMaterial
          roughness={0.7}
          clearcoat={1}
          thickness={1}
          color={outsideColor}
          transparent={true}
          opacity={1}
          metalness={0}
        />
      </mesh>
      <mesh position={[0.3, -0.1, depthOffset / 4]}>
        <extrudeGeometry
          attach="geometry"
          args={[
            innerShape,
            {
              bevelEnabled: true,
              bevelSize: 0.05,
              bevelThickness: 0.05,
              depth: props.width + depthOffset / 2,
            },
          ]}
        />
        <meshPhysicalMaterial
          roughness={0.7}
          clearcoat={1}
          transmission={0.3}
          thickness={1}
          color={innerColor}
          transparent={true}
          opacity={0.9}
        />
      </mesh>
    </group>
  );
};

const KeyGroup = (props: {
  selectable?: boolean;
  containerDimensions?: DOMRect;
  keys: VIAKey[];
  matrixKeycodes: number[];
  selectedDefinition: VIADefinitionV2 | VIADefinitionV3;
}) => {
  const dispatch = useAppDispatch();
  const {nodes} = useGLTF('/fonts/keycap.glb');
  const selectedKey = useAppSelector(getSelectedKey);
  const {basicKeyToByte, byteToKey} = useAppSelector(getBasicKeyToByte);
  const macros = useAppSelector((state) => state.macros);

  const {width, height} = calculateKeyboardFrameDimensions(props.keys);
  return (
    <group scale={1} position={[(-width * 19.05) / 2, (19.05 * height) / 2, 0]}>
      {props.keys.map((k, i) => {
        const [x, y] = calculatePointPosition(k);
        const r = (k.r * (2 * Math.PI)) / 360;
        return (
          <Keycap
            position={[(x * 19.05) / 54, (-(y - 0.867) * 19.05) / 56, 0]}
            rotation={[0, 0, -r]}
            scale={[k.w, k.h, 1]}
            color={getColors(k)}
            keycapGeometry={(nodes.Keycap_1U_GMK_R1 as any).geometry}
            onClick={(evt: any) => {
              if (props.selectable) {
                dispatch(updateSelectedKey(i));
              }
            }}
            disabled={!props.selectable}
            selected={i === selectedKey}
            label={getLabel(
              props.matrixKeycodes[i],
              k.w,
              macros,
              props.selectedDefinition,
              basicKeyToByte,
              byteToKey,
            )}
          />
        );
      })}
    </group>
  );
};
export const KeyboardCanvas = (props: {
  selectable?: boolean;
  containerDimensions?: DOMRect;
}) => {
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
  const {width, height} = calculateKeyboardFrameDimensions(keys);
  const allowOrbiting = true;

  return (
    <div style={{height: 500, width: '100%'}}>
      <Canvas
        camera={{fov: 80}}
        onPointerMissed={(evt: any) => {
          dispatch(updateSelectedKey(null));
        }}
      >
        <Camera {...props} keys={keys} />
        <spotLight position={[-10, 0, -5]} intensity={1} />
        {allowOrbiting && <OrbitControls makeDefault onEnd={console.log} />}
        <ambientLight />
        <pointLight position={[10, 10, 5]} />
        <group position={[0, -0.05, 0]} scale={0.015}>
          <Terrain />
          <Case width={width} height={height} />
          <KeyGroup
            {...props}
            keys={keys}
            matrixKeycodes={matrixKeycodes}
            selectedDefinition={selectedDefinition}
          />
        </group>
      </Canvas>
    </div>
  );
};

const Camera = (props: any) => {
  const {keys, containerDimensions} = props;
  const {width, height} = calculateKeyboardFrameDimensions(keys);
  const ratio = Math.min(
    1,
    (containerDimensions &&
      containerDimensions.width /
        ((CSSVarObject.keyWidth + CSSVarObject.keyXSpacing) * width -
          CSSVarObject.keyXSpacing +
          30)) ||
      1,
  );
  console.log(ratio);
  const camera = useThree((state) => state.camera);
  const glow = useSpring({
    config: {duration: 800},
    from: {x: 10},
    to: {x: 7},
  });
  useFrame(() => {
    if (glow.x.isAnimating) {
      camera.position.setZ(glow.x.get());
      camera.position.setY(0.4 * Math.pow(glow.x.get() - 7, 1));
    }
    if (camera.zoom !== 5.5 * 0.8 * ratio) {
      console.log(`Updating with ${ratio}`);
      camera.zoom = 5.5 * 0.8 * ratio;
      camera.updateProjectionMatrix();
    }
  });
  return null;
};
export const TestKeyboardCanvas = (props: any) => {
  const dispatch = useAppDispatch();
  const allowOrbiting = true;
  const macros = {expressions: [], isFeatureSupported: false};
  const {pressedKeys, keys, containerDimensions, matrixKeycodes} = props;
  const {width, height} = calculateKeyboardFrameDimensions(keys);
  const {basicKeyToByte, byteToKey} = useAppSelector(getBasicKeyToByte);
  const ratio = 0.8;
  return (
    <div style={{height: 500, width: '100%'}}>
      <Canvas
        camera={{fov: 80}}
        onPointerMissed={(evt: any) => {
          dispatch(updateSelectedKey(null));
        }}
      >
        <Camera {...props} />
        <spotLight position={[-10, 0, -5]} intensity={1} />
        {allowOrbiting && <OrbitControls makeDefault onEnd={console.log} />}
        <ambientLight />
        <pointLight position={[10, 10, 5]} />
        <group position={[0, -0.05, 0]} scale={0.015}>
          <Terrain />
          <Case width={width} height={height} />
          <KeyGroup
            {...props}
            keys={keys}
            matrixKeycodes={matrixKeycodes}
            selectedDefinition={props.definition}
          />
        </group>
      </Canvas>
    </div>
  );
};
