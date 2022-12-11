import React, {useEffect, useMemo, useRef, useState} from 'react';
import {useSpring, animated, config} from '@react-spring/three';
import type {KeyColor} from '../../utils/themes';
import {VIAKey, KeyColorType, DefinitionVersionMap} from '@the-via/reader';
import {
  calculateKeyboardFrameDimensions,
  calculatePointPosition,
} from '../positioned-keyboard';
import {useAppSelector} from 'src/store/hooks';
import {
  getBasicKeyToByte,
  getSelectedKeyDefinitions,
  getSelectedDefinition,
  getDefinitions,
  getBaseDefinitions,
  getCustomDefinitions,
} from 'src/store/definitionsSlice';
import {Canvas, useFrame, useThree} from '@react-three/fiber';
import {
  useGLTF,
  PresentationControls,
  Segments,
  Segment,
  PerspectiveCamera,
  useProgress,
} from '@react-three/drei';
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
import {useLocation} from 'wouter';
import {getSelectedVersion} from 'src/store/designSlice';
const accentColor = getComputedStyle(document.documentElement)
  .getPropertyValue('--color_accent')
  .trim();
export const getColors = ({color}: {color: KeyColorType}): KeyColor => {
  switch (color) {
    case KeyColorType.Alpha: {
      return {
        c: '#202021',
        t: 'papayawhip',
      };
    }
    case KeyColorType.Mod: {
      return {
        c: '#161515',
        t: 'papayawhip',
      };
    }
    case KeyColorType.Accent: {
      return {
        c: '#242020',
        t: 'papayawhip',
      };
    }
  }
};

useGLTF.preload('/fonts/keycap.glb');
useGLTF.preload('/fonts/rotary_encoder.glb');

const shallowEq = (prev: any, next: any) => {
  return Object.keys(prev).every((k) => {
    const equal = prev[k] === next[k];
    if (!equal) {
      console.log(k);
    }
    return equal;
  });
};

const paintKeycap = (
  canvas: HTMLCanvasElement,
  widthMultiplier: number,
  heightMultiplier: number,
  bgColor: string,
  legendColor: string,
  label: any,
) => {
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
      context.font = `${54 * dpi}px Arial Rounded MT`;
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
      context.font = `bold ${37.5 * dpi}px Arial Rounded MT`;
      context.fillText(
        label.centerLabel,
        0.02 * canvasSize + xOffset,
        0.3 * canvas.height + 270 * dpi * heightMultiplier + yOffset,
      );
    } else if (typeof label.label === 'string') {
      context.font = `bold ${80 * dpi}px Arial Rounded MT`;
      context.fillText(
        label.label,
        0.02 * canvasSize + xOffset,
        0.3 * canvasHeight + canvasHeight / 2 + yOffset,
      );
    }
  }
};

enum DisplayMode {
  Test = 1,
  Configure = 2,
  Design = 3,
}

enum KeycapState {
  Pressed = 1,
  Unpressed = 2,
}
const generateRowColArray = (keys: VIAKey[], rows: number, cols: number) => {
  const matrixKeys = keys.filter((key) => key['ei'] === undefined);
  const rowKeys = matrixKeys
    .reduce(
      (sumKeys, key) => {
        sumKeys[key.row][key.col] = calculatePointPosition(key);
        return sumKeys;
      },
      Array(rows)
        .fill(0)
        .map(() => Array(cols).fill(0)),
    )
    .map((arr) => arr.sort((a, b) => a[0] - b[0]));
  const colKeys = matrixKeys
    .reduce(
      (sumKeys, key) => {
        sumKeys[key.col][key.row] = calculatePointPosition(key);
        return sumKeys;
      },
      Array(cols)
        .fill(0)
        .map(() => Array(rows).fill(0)),
    )
    .map((arr) => arr.sort((a, b) => a[1] - b[1]));
  return {rowKeys, colKeys};
};

const MatrixLines: React.VFC<{
  keys: VIAKey[];
  rows: number;
  cols: number;
  width: number;
  height: number;
}> = ({keys, rows, cols, width, height}) => {
  const [rowColor, colColor] = ['lightpink', 'lightgrey'];
  const {rowKeys, colKeys} = generateRowColArray(keys, rows, cols);
  return (
    <group
      scale={0.35}
      rotation={[Math.PI, 0, 0]}
      position={[(-width * 19.05) / 2, ((height + 0.4) * 19.05) / 2, 11]}
      key={`${rows}-${cols}-${width}-${height}`}
    >
      <Segments lineWidth={1}>
        {rowKeys.flatMap((seg) => {
          const cleanedSegments = seg.filter((x) => x);
          if (cleanedSegments.length >= 2) {
            return cleanedSegments.reduce(
              (prev, next, idx) => {
                if (prev.prev === null) {
                  return {res: [], prev: next};
                }
                return {
                  res: [
                    ...prev.res,
                    <Segment
                      key={`row-${idx}`}
                      start={[prev.prev[0], prev.prev[1], 0]}
                      end={[next[0], next[1], 0]}
                      color={rowColor}
                    />,
                  ],
                  prev: next,
                };
              },
              {res: [], prev: null},
            ).res;
          }
          return [];
        })}
        {colKeys.flatMap((seg) => {
          console.log('holacol', seg);
          const cleanedSegments = seg.filter((x) => x);
          if (cleanedSegments.length >= 2) {
            return cleanedSegments.reduce(
              (prev, next, idx) => {
                if (prev.prev === null) {
                  return {res: [], prev: next};
                }
                return {
                  res: [
                    ...prev.res,
                    <Segment
                      key={`col-${idx}`}
                      start={[prev.prev[0], prev.prev[1], 0]}
                      end={[next[0], next[1], 0]}
                      color={colColor}
                    />,
                  ],
                  prev: next,
                };
              },
              {res: [], prev: null},
            ).res;
          }
          return [];
        })}
      </Segments>
    </group>
  );
};

const Heart = React.memo(
  (props: {caseWidth: number; caseHeight: number; caseThickness: number}) => {
    const heartShape = new THREE.Shape();

    heartShape.moveTo(25, 25);
    heartShape.bezierCurveTo(25, 25, 20, 0, 0, 0);
    heartShape.bezierCurveTo(-30, 0, -30, 35, -30, 35);
    heartShape.bezierCurveTo(-30, 55, -10, 77, 25, 95);
    heartShape.bezierCurveTo(60, 77, 80, 55, 80, 35);
    heartShape.bezierCurveTo(80, 35, 80, 0, 50, 0);
    heartShape.bezierCurveTo(35, 0, 25, 25, 25, 25);

    const extrudeSettings = {
      depth: 10,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 2,
      bevelSize: 1,
      bevelThickness: 15,
    };

    return (
      <mesh
        position={[
          props.caseThickness,
          props.caseHeight / 2,
          props.caseWidth / 2,
        ]}
        scale={0.01}
        rotation={[Math.PI / 2, 0, Math.PI / 2]}
      >
        <extrudeGeometry
          attach="geometry"
          args={[heartShape, extrudeSettings]}
        />
        <meshPhongMaterial color={'pink'} transparent={true} opacity={1} />
      </mesh>
    );
  },
  shallowEq,
);

const Keycap = React.memo((props: any & {mode: DisplayMode; idx: number}) => {
  const {label, scale, color, selected, position, mode, keyState, idx} = props;
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
    from: {x: 0, y: '#f4c0c0'},
    loop: selected ? {reverse: true} : false,
    to: {x: 100, y: '#c4a9a9'},
  });
  const [zDown, zUp] = [0, 6];
  const pressedState =
    DisplayMode.Test === mode
      ? TestKeyState.KeyDown === keyState
        ? KeycapState.Pressed
        : KeycapState.Unpressed
      : hovered || selected
      ? KeycapState.Unpressed
      : KeycapState.Pressed;
  const keycapZ = pressedState === KeycapState.Pressed ? zDown : zUp;
  const wasPressed = keyState === TestKeyState.KeyUp;
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
}, shallowEq);

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

export const Terrain: React.VFC<{onClick?: () => void}> = React.memo(
  (props) => {
    const [width, height] = [2100, 1000];
    const terrain1 = useRef<THREE.Mesh>(null);
    const terrain2 = useRef<THREE.Mesh>(null);
    const deltaYZ = height * Math.sin(Math.PI / 4);
    const terrainWidthVertices = (width * 64) / 2500;
    const terrainHeightVertices = (height * 16) / 625;
    const deltaD = 0.2;
    const meshColor = '#454040';
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
        (terrains[1].current as any).position.z =
          -height * Math.sin(Math.PI / 4);
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
          position={[750, GROUND_HEIGHT + phase * deltaYZ, phase * -deltaYZ]}
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
            color={meshColor}
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
            color={meshColor}
            roughness={1}
            metalness={0}
            transparent={true}
            wireframe
          />
        </mesh>
      </>
    );
  },
  () => true,
);

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
      <Heart
        caseWidth={props.width}
        caseHeight={props.height + heightOffset / 2}
        caseThickness={2 * widthOffset}
      />
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

const KeyGroup: React.VFC<{
  selectable?: boolean;
  containerDimensions?: DOMRect;
  keys: VIAKey[];
  matrixKeycodes: number[];
  definition: VIADefinitionV2 | VIADefinitionV3;
  mode: DisplayMode;
  pressedKeys?: TestKeyState[];
  selectedKey?: number;
}> = (props) => {
  const dispatch = useAppDispatch();
  const {Keycap_1U_GMK_R1} = useGLTF('/fonts/keycap.glb').nodes;
  const {Cylinder} = useGLTF('/fonts/rotary_encoder.glb').nodes;
  const selectedKey = useAppSelector(getSelectedKey);
  const {basicKeyToByte, byteToKey} = useAppSelector(getBasicKeyToByte);
  const macros = useAppSelector((state) => state.macros);
  const {keys, selectedKey: externalSelectedKey} = props;
  const selectedKeyIndex =
    externalSelectedKey === undefined ? selectedKey : externalSelectedKey;
  const keysKeys = useMemo(() => {
    return {
      indices: keys.map(
        (k, i) => `${props.definition.vendorProductId}-${i}-${k.w}-${k.h}`,
      ),
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
    return !props.matrixKeycodes.length
      ? []
      : props.keys.map((k, i) =>
          getLabel(
            props.matrixKeycodes[i],
            k.w,
            macros,
            props.definition,
            basicKeyToByte,
            byteToKey,
          ),
        );
  }, [keys, props.matrixKeycodes, macros, props.definition]);
  const {width, height} = calculateKeyboardFrameDimensions(props.keys);
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
            keyState={props.pressedKeys ? props.pressedKeys[i] : -1}
            disabled={!props.selectable}
            selected={i === selectedKeyIndex}
            idx={idx}
            label={labels[i]}
            onClick={onClick}
          />
        );
      }),
    [
      props.keys,
      selectedKeyIndex,
      labels,
      props.pressedKeys,
      props.selectable,
      props.definition.vendorProductId,
    ],
  );
  return (
    <group scale={1} position={[(-width * 19.05) / 2, (19.05 * height) / 2, 0]}>
      {elems}
    </group>
  );
};

export const Camera = (props: {
  keys: (VIAKey & {ei?: number})[];
  containerDimensions: DOMRect;
}) => {
  const {keys, containerDimensions} = props;
  const {progress, total} = useProgress();
  const [path] = useLocation();
  const camera = useThree((state) => state.camera);
  const startX = 10;
  const endX = 7;
  const glow = useSpring({
    config: {duration: 800},
    from: {x: startX},
  });

  const routeX = path === '/design' ? 20 : path === '/test' ? 10 : -0.48;
  const slide = useSpring({
    config: config.stiff,
    x: routeX,
  });

  React.useEffect(() => {
    if (progress === 100 && total === 5) {
      console.log('lets animate');
      glow.x.start(endX);
    }
  }, [progress]);

  React.useEffect(() => {
    console.log('mounting');
    return () => {
      console.log('unmounting');
    };
  }, []);
  useFrame(() => {
    if (glow.x.isAnimating) {
      camera.position.setZ(glow.x.get());
      camera.position.setY(0.4 * Math.pow(glow.x.get() - endX, 1));
      camera.updateProjectionMatrix();
    }
    if (camera.zoom !== 5.5 * 0.8) {
      camera.zoom = 5.5 * 0.8;
      camera.updateProjectionMatrix();
    }
    if (slide.x.isAnimating || camera.position.x !== routeX) {
      camera.position.setX(slide.x.get());
      camera.updateProjectionMatrix();
    }
  });
  return <PerspectiveCamera makeDefault fov={25}></PerspectiveCamera>;
};

export const ConfigureKeyboard = (props: {
  selectable?: boolean;
  containerDimensions?: DOMRect;
}) => {
  const {selectable, containerDimensions} = props;
  const matrixKeycodes = useAppSelector(
    (state) => getSelectedKeymap(state) || [],
  );
  const keys: (VIAKey & {ei?: number})[] = useAppSelector(
    getSelectedKeyDefinitions,
  );
  const definition = useAppSelector(getSelectedDefinition);
  if (!definition || !containerDimensions) {
    return null;
  }

  return (
    <KeyboardCanvas
      matrixKeycodes={matrixKeycodes}
      keys={keys}
      selectable={!!selectable}
      definition={definition}
      containerDimensions={containerDimensions}
      mode={DisplayMode.Configure}
    />
  );
};

export const TestKeyboard = (props: {
  selectable?: boolean;
  containerDimensions?: DOMRect;
  pressedKeys?: TestKeyState[];
  matrixKeycodes: number[];
  keys: (VIAKey & {ei?: number})[];
  definition: VIADefinitionV2 | VIADefinitionV3;
}) => {
  const {
    selectable,
    containerDimensions,
    matrixKeycodes,
    keys,
    pressedKeys,
    definition,
  } = props;
  if (!containerDimensions) {
    return null;
  }

  return (
    <KeyboardCanvas
      matrixKeycodes={matrixKeycodes}
      keys={keys}
      selectable={!!selectable}
      definition={definition}
      pressedKeys={pressedKeys}
      containerDimensions={containerDimensions}
      mode={DisplayMode.Test}
    />
  );
};

export const DesignKeyboard = (props: {
  containerDimensions?: DOMRect;
  definition: VIADefinitionV2 | VIADefinitionV3;
  showMatrix?: boolean;
  selectedOptionKeys: number[];
}) => {
  const {containerDimensions, showMatrix, definition, selectedOptionKeys} =
    props;
  const {keys, optionKeys} = definition.layouts;
  if (!containerDimensions) {
    return null;
  }

  const displayedOptionKeys = optionKeys
    ? Object.entries(optionKeys).flatMap(([key, options]) => {
        const optionKey = parseInt(key);

        // If a selection option has been set for this optionKey, use that
        return selectedOptionKeys[optionKey]
          ? options[selectedOptionKeys[optionKey]]
          : options[0];
      })
    : [];

  const displayedKeys = [...keys, ...displayedOptionKeys];
  useMemo(() => {
    return [...keys, ...displayedOptionKeys];
  }, [keys, displayedOptionKeys]);
  return (
    <KeyboardCanvas
      matrixKeycodes={[]}
      keys={displayedKeys}
      selectable={false}
      definition={definition}
      containerDimensions={containerDimensions}
      mode={DisplayMode.Design}
      showMatrix={showMatrix}
    />
  );
};
type KeyboardDefinitionEntry = [string, VIADefinitionV2 | VIADefinitionV3];

export const KeyboardCanvasContext = React.createContext<any | null>(null);
const getDisplayedOptionKeys =
  (selectedOptionKeys: number[]) =>
  ([key, options]: [any, any]) => {
    const optionKey = parseInt(key);

    // If a selection option has been set for this optionKey, use that
    return selectedOptionKeys[optionKey]
      ? options[selectedOptionKeys[optionKey]]
      : options[0];
  };
export const DebugProvider = (props: any) => {
  // Temporary patch that gets the page to load
  // TODO: We probably need to rethink this + design a bit. Loading defs in design causes this to crash
  const allDefinitions = Object.entries(useAppSelector(getDefinitions))
    .flatMap(([id, versionMap]): KeyboardDefinitionEntry[] => [
      [id, versionMap.v2] as KeyboardDefinitionEntry,
      [id, versionMap.v3] as KeyboardDefinitionEntry,
    ])
    .filter(([_, definition]) => definition !== undefined);

  const [selectedDefinitionIndex, setSelectedDefinition] = useState(0);
  const [selectedOptionKeys, setSelectedOptionKeys] = useState<number[]>([]);
  const [selectedKey, setSelectedKey] = useState<undefined | number>(0);
  const [showMatrix, setShowMatrix] = useState(false);
  const entry = allDefinitions[selectedDefinitionIndex];
  const {keys, optionKeys} = entry[1].layouts;
  const displayedOptionKeys = optionKeys
    ? Object.entries(optionKeys).flatMap(
        getDisplayedOptionKeys(selectedOptionKeys),
      )
    : [];

  const displayedKeys = [...keys, ...displayedOptionKeys];
  const canvasProps = {
    matrixKeycodes: [],
    keys: displayedKeys,
    selectable: false,
    definition: entry[1],
    mode: DisplayMode.Design,
    showMatrix: showMatrix,
    selectedKey: selectedKey,
  };
  return (
    <KeyboardCanvasContext.Provider value={canvasProps}>
      {props.children}
    </KeyboardCanvasContext.Provider>
  );
};

export const DesignProvider = (props: any) => {
  const localDefinitions = Object.values(useAppSelector(getCustomDefinitions));
  const definitionVersion = useAppSelector(getSelectedVersion);

  const [selectedDefinitionIndex, setSelectedDefinitionIndex] = useState(0);
  const [selectedOptionKeys, setSelectedOptionKeys] = useState<number[]>([]);
  const [showMatrix, setShowMatrix] = useState(false);
  const versionDefinitions: DefinitionVersionMap[] = useMemo(
    () =>
      localDefinitions.filter(
        (definitionMap) => definitionMap[definitionVersion],
      ),
    [localDefinitions, definitionVersion],
  );

  const definition =
    versionDefinitions[selectedDefinitionIndex] &&
    versionDefinitions[selectedDefinitionIndex][definitionVersion];
  const displayedOptionKeys =
    definition && definition.layouts.optionKeys
      ? Object.entries(definition.layouts.optionKeys).flatMap(
          getDisplayedOptionKeys(selectedOptionKeys),
        )
      : [];

  const displayedKeys = [
    ...(definition ? definition.layouts.keys : []),
    ...displayedOptionKeys,
  ];
  const canvasProps = {
    matrixKeycodes: [],
    keys: displayedKeys,
    selectable: false,
    definition,
    mode: DisplayMode.Design,
    showMatrix,
    setShowMatrix,
    setSelectedOptionKeys,
    setSelectedDefinitionIndex,
  };
  return (
    <KeyboardCanvasContext.Provider value={canvasProps}>
      {props.children}
    </KeyboardCanvasContext.Provider>
  );
};

export const DebugKeyboard = (props: {
  containerDimensions?: DOMRect;
  definition: VIADefinitionV2 | VIADefinitionV3;
  showMatrix?: boolean;
  selectedOptionKeys: number[];
  selectedKey?: number;
}) => {
  const {
    containerDimensions,
    showMatrix,
    definition,
    selectedOptionKeys,
    selectedKey,
  } = props;
  if (!containerDimensions) {
    return null;
  }
  const {keys, optionKeys} = definition.layouts;
  const displayedOptionKeys = optionKeys
    ? Object.entries(optionKeys).flatMap(([key, options]) => {
        const optionKey = parseInt(key);

        // If a selection option has been set for this optionKey, use that
        return selectedOptionKeys[optionKey]
          ? options[selectedOptionKeys[optionKey]]
          : options[0];
      })
    : [];

  const displayedKeys = [...keys, ...displayedOptionKeys];
  return (
    <KeyboardCanvas
      matrixKeycodes={[]}
      keys={displayedKeys}
      selectable={false}
      definition={definition}
      containerDimensions={containerDimensions}
      mode={DisplayMode.Design}
      showMatrix={showMatrix}
      selectedKey={selectedKey}
    />
  );
};

export const KeyboardCanvas: React.VFC<{
  selectable: boolean;
  containerDimensions: DOMRect;
  matrixKeycodes: number[];
  keys: (VIAKey & {ei?: number})[];
  definition: VIADefinitionV2 | VIADefinitionV3;
  pressedKeys?: TestKeyState[];
  mode: DisplayMode;
  showMatrix?: boolean;
  selectedKey?: number;
}> = (props) => {
  const {
    selectable,
    containerDimensions,
    matrixKeycodes,
    keys,
    definition,
    pressedKeys,
    mode,
    showMatrix,
  } = props;
  const dispatch = useAppDispatch();

  const containerWidthOffset = DisplayMode.Configure === mode ? -182.5 : 0;

  const {width, height} = calculateKeyboardFrameDimensions(keys);
  const ratio =
    Math.min(
      Math.min(
        1,
        containerDimensions &&
          (containerDimensions.width + containerWidthOffset) /
            ((CSSVarObject.keyWidth + CSSVarObject.keyXSpacing) * width -
              CSSVarObject.keyXSpacing +
              70),
      ),
      500 /
        ((CSSVarObject.keyHeight + CSSVarObject.keyYSpacing) * height -
          CSSVarObject.keyYSpacing +
          70),
    ) || 1;

  return (
    <>
      <group position={[0, -0.0, -19]} scale={0.015 * ratio}>
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
            containerDimensions={containerDimensions}
            keys={keys}
            mode={mode}
            matrixKeycodes={matrixKeycodes}
            definition={definition}
            pressedKeys={pressedKeys}
          />
          {showMatrix && (
            <MatrixLines
              keys={keys}
              rows={definition.matrix.rows}
              cols={definition.matrix.cols}
              width={width}
              height={height}
            />
          )}
        </PresentationControls>
      </group>
    </>
  );
};

//Something is weird when pressedKeys refreshes that affects the terrain and perhaps other parts
