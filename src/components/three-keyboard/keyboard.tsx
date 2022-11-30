import React, {
  useCallback,
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
import {Canvas, ThreeEvent, useFrame, useThree} from '@react-three/fiber';
import {useGLTF, PresentationControls} from '@react-three/drei';

import type {VIADefinitionV2, VIADefinitionV3} from '@the-via/reader';
import * as THREE from 'three';
import {
  getSelectedKey,
  getSelectedKeymap,
  updateSelectedKey,
} from 'src/store/keymapSlice';
import {CSSVarObject, getLabel} from '../positioned-keyboard/base';
import {useAppDispatch} from 'src/store/hooks';
import {TestKeyState} from '../test-keyboard';
import {useGlobalKeys} from 'src/utils/use-global-keys';
import {useDispatch} from 'react-redux';
export const getColors = ({color}: {color: KeyColorType}): KeyColor => ({
  c: '#202020',
  t: 'papayawhip',
});

type KeyboardDefinitionEntry = [string, VIADefinitionV2 | VIADefinitionV3];
useGLTF.preload('/fonts/keycap.glb');
useGLTF.preload('/fonts/rotary_encoder.glb');

const paintKeycap = (
  canvas: HTMLCanvasElement,
  widthMultiplier: number,
  heightMultiplier: number,
  bgColor: string,
  legendColor: string,
  label: any,
) => {
  const [canvasWidth, canvasHeight] = [
    2048 * widthMultiplier,
    2048 * heightMultiplier,
  ];
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const [xOffset, yOffset] = [10, 60];

  const context = canvas.getContext('2d');
  if (context) {
    context.rect(0, 0, canvas.width, canvas.height);
    context.fillStyle = bgColor;
    context.fill();

    context.fillStyle = legendColor;
    if (label.topLabel && label.bottomLabel) {
      context.font = ' 220px Arial Rounded MT ';
      context.fillText(
        label.topLabel,
        0.02 * 2048 + xOffset,
        0.3 * canvas.height + 970 * heightMultiplier + yOffset,
      );
      context.fillText(
        label.bottomLabel,
        0.02 * 2048 + xOffset,
        0.3 * canvas.height + 970 * heightMultiplier + yOffset + 300,
      );
    } else if (label.centerLabel) {
      context.font = 'bold 150px Arial Rounded MT';
      context.fillText(
        label.centerLabel,
        0.02 * 2048 + xOffset,
        0.3 * canvas.height + 1080 * heightMultiplier + yOffset,
      );
    } else if (typeof label.label === 'string') {
      context.font = 'bold 320px Arial Rounded MT';
      context.fillText(
        label.label,
        0.02 * 2048 + xOffset,
        0.3 * canvasHeight + canvasHeight / 2 + yOffset,
      );
    }
  }
};

enum DisplayMode {
  Test = 1,
  Configure = 2,
}

enum KeycapState {
  Pressed = 1,
  Unpressed = 2,
}

const Keycap = React.memo(
  (props: any & {mode: DisplayMode; idx: number}) => {
    const {label, scale, color, selected, position, mode, keyState, idx} =
      props;
    const ref = useRef<any>();
    // Hold state for hovered and clicked events
    const [hovered, hover] = useState(false);
    const textureRef = useRef<THREE.CanvasTexture>();
    const canvasRef = useRef(document.createElement('canvas'));

    const redraw = React.useCallback(() => {
      if (canvasRef.current) {
        paintKeycap(
          canvasRef.current,
          scale[0],
          scale[1],
          color.c,
          color.t,
          label,
        );
        textureRef.current!.needsUpdate = true;
      }
    }, [canvasRef.current, label.key, scale[0], scale[1], color.t, color.c]);
    useLayoutEffect(redraw, [label.key]);

    const glow = useSpring({
      config: {duration: 800},
      from: {x: 0, y: '#f4c0c0'},
      loop: selected ? {reverse: true} : false,
      to: {x: 100, y: '#c4a9a9'},
    });
    const [zDown, zUp] = [0, 6];
    const pressedState =
      DisplayMode.Test === mode
        ? TestKeyState.KeyDown === props.keyState
          ? KeycapState.Pressed
          : KeycapState.Unpressed
        : hovered || selected
        ? KeycapState.Unpressed
        : KeycapState.Pressed;
    const keycapZ = pressedState === KeycapState.Pressed ? zDown : zUp;
    const wasPressed = props.keyState === TestKeyState.KeyUp;
    const keycapColor =
      DisplayMode.Test === mode
        ? pressedState === KeycapState.Unpressed
          ? wasPressed
            ? '#f4c0c0'
            : 'lightgrey'
          : '#c4a9a9'
        : pressedState === KeycapState.Unpressed
        ? 'lightgrey'
        : 'lightgrey';

    const {p, b} = useSpring({
      config: {duration: 100},
      p: [position[0], position[1], keycapZ],
      b: keycapColor,
    });

    const AniMeshMaterial = animated.meshPhongMaterial as any;
    console.log('rerendering keycap');

    return (
      <>
        <animated.mesh
          {...props}
          ref={ref}
          position={p}
          onClick={(evt) => !props.disabled && props.onClick(evt, idx)}
          onPointerOver={() => !props.disabled && hover(true)}
          onPointerOut={() => !props.disabled && hover(false)}
          geometry={props.keycapGeometry}
        >
          <AniMeshMaterial attach="material" color={selected ? glow.y : b}>
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
  },
  (prev, next) => {
    return Object.keys(prev).every((k) => {
      const equal = prev[k] === next[k];
      if (!equal) {
        console.log(k);
      }
      return equal;
    });
  },
);

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
const GROUND_HEIGHT = -150; // A Constant to store the ground height of the game.

const Terrain: React.VFC<{onClick?: () => void}> = (props) => {
  const [width, height] = [1000, 1000];
  const terrain1 = useRef<THREE.Mesh>(null);
  const terrain2 = useRef<THREE.Mesh>(null);
  const deltaYZ = height * Math.sin(Math.PI / 4);
  const terrainWidthVertices = (width * 64) / 2500;
  const terrainHeightVertices = (height * 16) / 625;
  const deltaD = 0.2;
  let terrains = [terrain1, terrain2];
  useFrame(() => {
    if (
      terrains[1].current &&
      terrains[1].current?.position.y <= GROUND_HEIGHT
    ) {
      terrains = [terrain2, terrain1];
      (terrains[0].current as any).position.y = GROUND_HEIGHT;
      (terrains[0].current as any).position.z = 0;
      (terrains[1].current as any).position.y =
        GROUND_HEIGHT + height * Math.sin(Math.PI / 4);
      (terrains[1].current as any).position.z = -height * Math.sin(Math.PI / 4);
    }
    for (let terrain of terrains) {
      if (terrain && terrain.current && terrain.current.position) {
        terrain.current.position.y -= deltaD;
        terrain.current.position.z += deltaD;
        (terrain.current.material as THREE.Material).opacity =
          1 + 0.5 * Math.sin((terrains[0].current as any).position.y / 12);
      }
    }
  });
  const phase = 0.5;
  return (
    <>
      <mesh
        visible
        position={[0, GROUND_HEIGHT + phase * deltaYZ, phase * -deltaYZ]}
        rotation={[-Math.PI / 4, 0, 0]}
        ref={terrain1}
        onClick={props.onClick}
      >
        <planeGeometry
          attach="geometry"
          args={[width, height, terrainWidthVertices, terrainHeightVertices]}
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
      <mesh
        visible
        onClick={props.onClick}
        position={[
          0,
          GROUND_HEIGHT + (phase + 1) * deltaYZ,
          -deltaYZ * (phase + 1),
        ]}
        rotation={[-Math.PI / 4, 0, 0]}
        ref={terrain2}
      >
        <planeGeometry
          attach="geometry"
          args={[width, height, terrainWidthVertices, terrainHeightVertices]}
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
};

export const Case = (props: {width: number; height: number}) => {
  const innerColor = '#303030';
  const widthOffset = 0.4;
  const heightOffset = 0.5;
  const depthOffset = 0.5;
  const outsideColor = useMemo(
    () =>
      getComputedStyle(document.documentElement)
        .getPropertyValue('--color_accent')
        .trim(),
    [],
  );
  const outsideShape = useMemo(() => {
    return makeShape({
      width: 0.4 + widthOffset,
      height: props.height + heightOffset,
    });
  }, [props.height]);
  const innerShape = useMemo(() => {
    return makeShape({
      width: 0.4,
      height: props.height + heightOffset / 2,
    });
  }, [props.height]);

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
        <meshPhongMaterial
          color={outsideColor}
          transparent={true}
          opacity={1}
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
        <meshPhongMaterial
          color={innerColor}
          shininess={100}
          reflectivity={1}
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
  mode: DisplayMode;
  pressedKeys?: TestKeyState[];
}) => {
  const dispatch = useAppDispatch();
  const {Keycap_1U_GMK_R1} = useGLTF('/fonts/keycap.glb').nodes;
  const {Cylinder} = useGLTF('/fonts/rotary_encoder.glb').nodes;
  const selectedKey = useAppSelector(getSelectedKey);
  const {basicKeyToByte, byteToKey} = useAppSelector(getBasicKeyToByte);
  const macros = useAppSelector((state) => state.macros);
  const {keys} = props;
  const keysKeys = useMemo(() => {
    return {
      indices: keys.map((k, i) => `${i}-${k.w}-${k.h}`),
      coords: keys.map((k, i) => {
        const [x, y] = calculatePointPosition(k);
        const r = (k.r * (2 * Math.PI)) / 360;
        return {
          position: [(x * 19.05) / 54, (-(y - 0.867) * 19.05) / 56, 0],
          rotation: [0, 0, -r],
          scale: [k.w, k.h, 1],
          color: getColors(k),
          idx: i,
          onClick: (evt: any, idx: number) => {
            evt.stopPropagation();
            dispatch(updateSelectedKey(idx));
          },
        };
      }),
    };
  }, [keys]);
  const labels = useMemo(() => {
    console.log('rerendering labels');
    return props.keys.map((k, i) =>
      getLabel(
        props.matrixKeycodes[i],
        k.w,
        macros,
        props.selectedDefinition,
        basicKeyToByte,
        byteToKey,
      ),
    );
  }, [keys, props.matrixKeycodes, macros, props.selectedDefinition]);
  const [globalPressedKeys] = useGlobalKeys();
  const {width, height} = calculateKeyboardFrameDimensions(props.keys);
  const p1 = performance.now();
  const elems = useMemo(
    () =>
      props.keys.map((k, i) => {
        const {position, rotation, scale, color, idx, onClick} =
          keysKeys.coords[i];
        const key = keysKeys.indices[i];
        return (
          <Keycap
            mode={props.mode}
            key={key}
            position={position}
            rotation={rotation}
            scale={scale}
            color={color}
            keycapGeometry={
              (k['ei'] !== undefined ? Cylinder : (Keycap_1U_GMK_R1 as any))
                .geometry
            }
            keyState={
              props.pressedKeys ? props.pressedKeys[i] : globalPressedKeys[i]
            }
            disabled={!props.selectable}
            selected={i === selectedKey}
            idx={idx}
            label={labels[i]}
            onClick={onClick}
          />
        );
      }),
    [props.keys, selectedKey, labels, globalPressedKeys, props.pressedKeys],
  );
  return (
    <group scale={1} position={[(-width * 19.05) / 2, (19.05 * height) / 2, 0]}>
      {elems}
    </group>
  );
};
export const KeyboardCanvas = (props: {
  selectable?: boolean;
  containerDimensions?: DOMRect;
}) => {
  const dispatch = useAppDispatch();
  const matrixKeycodes = useAppSelector(
    (state) => getSelectedKeymap(state) || [],
  );
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
        <ambientLight />
        <pointLight position={[10, 10, 5]} />
        <group position={[0, -0.05, 0]} scale={0.015}>
          <Terrain
            onClick={() => {
              dispatch(updateSelectedKey(null));
            }}
          />
          <PresentationControls
            enabled={true} // the controls can be disabled by setting this to false
            global={true} // Spin globally or by dragging the model
            snap={true} // Snap-back to center (can also be a spring config)
            speed={1} // Speed factor
            zoom={1} // Zoom factor when half the polar-max is reached
            rotation={[0, 0, 0]} // Default rotation
            polar={[-Math.PI / 6, Math.PI / 6]} // Vertical limits
            azimuth={[-Math.PI / 5, Math.PI / 5]} // Horizontal limits
            config={{mass: 1, tension: 170, friction: 26}} // Spring config
          >
            <Case width={width} height={height} />
            <KeyGroup
              {...props}
              keys={keys}
              mode={DisplayMode.Configure}
              matrixKeycodes={matrixKeycodes}
              selectedDefinition={selectedDefinition}
            />
          </PresentationControls>
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
  const camera = useThree((state) => state.camera);
  const startX = 10;
  const endX = 7;
  const glow = useSpring({
    config: {duration: 800},
    from: {x: startX},
    to: {x: endX},
  });
  useFrame(() => {
    if (glow.x.isAnimating) {
      camera.position.setZ(glow.x.get());
      camera.position.setY(0.4 * Math.pow(glow.x.get() - endX, 1));
    }
    if (camera.zoom !== 5.5 * 0.8 * ratio) {
      camera.zoom = 5.5 * 0.8 * ratio;
      camera.updateProjectionMatrix();
    }
  });
  return null;
};

//Something is weird when pressedKeys refreshes that affects the terrain and perhaps other parts
export const TestKeyboardCanvas = (props: any) => {
  const dispatch = useAppDispatch();
  const {keys, matrixKeycodes, pressedKeys} = props;
  const {width, height} = calculateKeyboardFrameDimensions(keys);
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
        <ambientLight />
        <pointLight position={[10, 10, 5]} />
        <group position={[0, -0.05, 0]} scale={0.015}>
          <Terrain />
          <PresentationControls
            enabled={true} // the controls can be disabled by setting this to false
            global={true} // Spin globally or by dragging the model
            snap={true} // Snap-back to center (can also be a spring config)
            speed={1} // Speed factor
            zoom={1} // Zoom factor when half the polar-max is reached
            rotation={[0, 0, 0]} // Default rotation
            polar={[-Math.PI / 6, Math.PI / 6]} // Vertical limits
            azimuth={[-Math.PI / 5, Math.PI / 5]} // Horizontal limits
            config={{mass: 1, tension: 170, friction: 26}} // Spring config
          >
            <Case width={width} height={height} />
            <KeyGroup
              {...props}
              keys={keys}
              mode={DisplayMode.Test}
              pressedKeys={pressedKeys}
              matrixKeycodes={matrixKeycodes}
              selectedDefinition={props.definition}
            />
          </PresentationControls>
        </group>
      </Canvas>
    </div>
  );
};
