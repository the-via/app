import {Canvas, useFrame} from '@react-three/fiber';
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {matrixKeycodes} from 'src/utils/key-event';
import fullKeyboardDefinition from '../../utils/test-keyboard-definition.json';
import {
  getCustomDefinitions,
  getSelectedDefinition,
  getSelectedKeyDefinitions,
} from 'src/store/definitionsSlice';
import {getSelectedConnectedDevice} from 'src/store/devicesSlice';
import {
  getIsTestMatrixEnabled,
  setTestMatrixEnabled,
} from 'src/store/settingsSlice';
import {useGlobalKeys} from 'src/utils/use-global-keys';
import {useMatrixTest} from 'src/utils/use-matrix-test';
import {useSize} from 'src/utils/use-size';
import {useLocation} from 'wouter';
import {Camera} from './camera';
import {ConfigureKeyboard, DesignKeyboard, TestKeyboard} from './keyboard';
import {useAppDispatch, useAppSelector} from 'src/store/hooks';
import {DefinitionVersionMap, VIADefinitionV2, VIAKey} from '@the-via/reader';
import {TestKeyState} from '../test-keyboard';
import {
  Backdrop,
  Decal,
  Float,
  OrbitControls,
  SpotLight,
  useGLTF,
  useProgress,
  useTexture,
} from '@react-three/drei';
import {
  getLoadProgress,
  updateSelectedKey,
  getSelectedKeymap,
  setLayer,
  getConfigureKeyboardIsSelectable,
} from 'src/store/keymapSlice';
import {a, config, useSpring} from '@react-spring/three';
import {TestContext} from '../panes/test';
import {
  getSelectedDefinitionIndex,
  getSelectedVersion,
  getShowMatrix,
  getSelectedOptionKeys,
} from 'src/store/designSlice';
import React from 'react';
import {shallowEqual} from 'react-redux';
import {Object3D} from 'three';

useGLTF.preload('/fonts/keycap.glb');
useGLTF.preload('/fonts/rotary_encoder.glb');

const Design = (props: {dimensions?: DOMRect}) => {
  const localDefinitions = Object.values(useAppSelector(getCustomDefinitions));
  const definitionVersion = useAppSelector(getSelectedVersion);
  const selectedDefinitionIndex = useAppSelector(getSelectedDefinitionIndex);
  const selectedOptionKeys = useAppSelector(getSelectedOptionKeys);
  const showMatrix = useAppSelector(getShowMatrix);
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

  return (
    <group>
      {definition && (
        <DesignKeyboard
          containerDimensions={props.dimensions}
          definition={definition}
          selectedOptionKeys={selectedOptionKeys}
          showMatrix={showMatrix}
        />
      )}
    </group>
  );
};
const Test = (props: {dimensions?: DOMRect}) => {
  const dispatch = useAppDispatch();
  const [path] = useLocation();
  const isShowingTest = path === '/test';
  const selectedDevice = useAppSelector(getSelectedConnectedDevice);
  const selectedDefinition = useAppSelector(getSelectedDefinition);
  const keyDefinitions = useAppSelector(getSelectedKeyDefinitions);
  const isTestMatrixEnabled = useAppSelector(getIsTestMatrixEnabled);
  const selectedMatrixKeycodes = useAppSelector(
    (state) => getSelectedKeymap(state) || [],
  );

  const api = selectedDevice && selectedDevice.api;
  const [globalPressedKeys, setGlobalPressedKeys] = useGlobalKeys(
    !isTestMatrixEnabled && isShowingTest,
  );
  const [matrixPressedKeys, setMatrixPressedKeys] = useMatrixTest(
    isTestMatrixEnabled && isShowingTest,
    api as any,
    selectedDefinition as any,
  );

  const clearTestKeys = useCallback(() => {
    setGlobalPressedKeys([]);
    setMatrixPressedKeys([]);
  }, [setGlobalPressedKeys, setMatrixPressedKeys]);

  const testContext = useContext(TestContext);
  // Hack to share setting a local state to avoid causing cascade of rerender
  if (testContext[0].clearTestKeys !== clearTestKeys) {
    testContext[1]({clearTestKeys});
  }

  useEffect(() => {
    // Remove event listeners on cleanup
    if (path !== '/test') {
      dispatch(setTestMatrixEnabled(false));
      testContext[0].clearTestKeys();
    }
    if (path !== '/') {
      dispatch(setLayer(0));
    }
  }, [path]); // Empty array ensures that effect is only run on mount and unmount

  const pressedKeys =
    !isTestMatrixEnabled || !keyDefinitions
      ? matrixPressedKeys
      : keyDefinitions.map(
          ({row, col}: {row: number; col: number}) =>
            selectedDefinition &&
            matrixPressedKeys[
              (row * selectedDefinition.matrix.cols +
                col) as keyof typeof matrixPressedKeys
            ],
        );
  const testDefinition = isTestMatrixEnabled
    ? selectedDefinition
    : fullKeyboardDefinition;
  const testKeys = isTestMatrixEnabled
    ? keyDefinitions
    : fullKeyboardDefinition.layouts.keys;
  if (!testDefinition || typeof testDefinition === 'string') {
    return null;
  }

  return (
    <TestKeyboard
      definition={testDefinition as VIADefinitionV2}
      keys={testKeys as VIAKey[]}
      pressedKeys={
        isTestMatrixEnabled
          ? (pressedKeys as TestKeyState[])
          : (globalPressedKeys as TestKeyState[])
      }
      matrixKeycodes={
        isTestMatrixEnabled ? selectedMatrixKeycodes : matrixKeycodes
      }
      containerDimensions={props.dimensions}
    />
  );
};

useTexture.preload('/images/chippy.png');

const LoaderSpinner = () => {
  const [chippyMap] = useTexture(['/images/chippy.png']);
  const spinnerRef = useRef<any>();

  const [{background}] = useSpring(() => ({
    from: {background: 'white'},
    to: {background: 'var(--color_accent)'},
  }));
  const bg = background.to([0, 100], ['white', 'var(--color_accent)']);

  useFrame(({clock}) => {
    spinnerRef.current.rotateZ(Math.PI / 360);
    spinnerRef.current.position.y = 0.25 * Math.sin(clock.elapsedTime);
  });

  return (
    chippyMap && (
      <group
        ref={spinnerRef}
        scale={0.5}
        position={[0, -0.05, -19]}
        rotation={[Math.PI / 2, Math.PI, 0]}
      >
        <mesh>
          <cylinderGeometry args={[1.5, 1.5, 0.5, 50]} />
          <Decal
            position={[0, -0.1, 0]} // Position of the decal
            rotation={[Math.PI / 2, Math.PI, 0]} // Rotation of the decal (can be a vector or a degree in radians)
            scale={2} // Scale of the decal
            transparent={true}
          >
            <meshPhongMaterial
              transparent
              depthTest={false}
              alphaTest={0}
              map={chippyMap}
              polygonOffset={true}
              polygonOffsetFactor={-10}
            />
          </Decal>
        </mesh>
      </group>
    )
  );
};

export const CanvasRouter = () => {
  const [path] = useLocation();
  const containerRef = useRef(null);
  const dimensions = useSize(containerRef);
  const loadProgress = useAppSelector(getLoadProgress);
  const {progress} = useProgress();
  const dispatch = useAppDispatch();
  const localDefinitions = Object.values(useAppSelector(getCustomDefinitions));
  const selectedDefinition = useAppSelector(getSelectedDefinition);
  const hideDesignScene = '/design' === path && !localDefinitions.length;
  const hideConfigureScene =
    '/' === path &&
    (!selectedDefinition || (loadProgress + progress / 100) / 2 !== 1);
  const terrainOnClick = useCallback(() => {
    if (true) {
      dispatch(updateSelectedKey(null));
    }
  }, [dispatch]);
  const hideCanvasScene =
    ['/settings'].includes(path) || hideDesignScene || hideConfigureScene;
  const configureKeyboardIsSelectable = useAppSelector(
    getConfigureKeyboardIsSelectable,
  );

  return (
    <div
      style={{
        height: 500,
        width: '100%',
        position: hideCanvasScene ? 'absolute' : 'relative',
        visibility: hideCanvasScene ? 'hidden' : 'visible',
      }}
      ref={containerRef}
    >
      <Canvas flat={true} shadows>
        <Lights />
        <mesh
          receiveShadow
          position={[0, -5.75, 0]}
          rotation={[-Math.PI / 2 + Math.PI / 14, 0, 0]}
          onClick={terrainOnClick}
        >
          <planeGeometry args={[100, 100]} />
          <meshStandardMaterial color="#aa9a9a" />
        </mesh>
        <Camera />
        <Float
          speed={1} // Animation speed, defaults to 1
          rotationIntensity={0.0} // XYZ rotation intensity, defaults to 1
          floatIntensity={1} // Up/down float intensity, works like a multiplier with floatingRange,defaults to 1
          floatingRange={[0, 0.1]} // Range of y-axis values the object will float within, defaults to [-0.1,0.1]
        >
          <Keyboards
            configureKeyboardIsSelectable={configureKeyboardIsSelectable}
            dimensions={dimensions}
            loadProgress={loadProgress}
          />
        </Float>
      </Canvas>
    </div>
  );
};

const Lights = React.memo(() => {
  const x = 3;
  const y = 0.5;
  const z = -15;
  const spotlightY = 12;
  const spotlightZ = -19;
  const debug = true;
  const targetObj = React.useMemo(() => {
    const obj = new Object3D();
    obj.position.set(0, 3, spotlightZ);
    obj.updateMatrixWorld();
    return obj;
  }, []);
  return (
    <>
      <ambientLight intensity={0.0} />
      <SpotLight
        distance={spotlightY + 2}
        position={[0, spotlightY, spotlightZ + 2.5]}
        angle={Math.PI / 5}
        attenuation={5}
        target={targetObj}
        intensity={10}
        castShadow={true}
        anglePower={5} // Diffuse-cone anglePower (default: 5)
      ></SpotLight>
      <pointLight position={[x, y, z]} intensity={0.8} />
      <pointLight position={[-x, y, z]} intensity={0.8} />
    </>
  );
}, shallowEqual);

const getRouteX = (route: string) => {
  const configurePosition = 0.48;
  const spaceMultiplier = 20;
  const testPosition = -spaceMultiplier * 1;
  const designPosition = -spaceMultiplier * 2;
  const otherPosition = -spaceMultiplier * 3;
  switch (route) {
    case '/design': {
      return designPosition;
    }
    case '/test': {
      return testPosition;
    }
    case '/': {
      return configurePosition;
    }
    default: {
      return otherPosition;
    }
  }
};

const Keyboards = React.memo((props: any) => {
  const [path] = useLocation();
  const {loadProgress, dimensions, configureKeyboardIsSelectable} = props;
  const configurePosition = 0.48;
  const testPosition = 20;
  const designPosition = 40;
  const routeX = getRouteX(path);
  const slide = useSpring({
    config: config.stiff,
    x: routeX,
  });

  return (
    <a.group position-x={slide.x}>
      <group visible={loadProgress === 1}>
        <ConfigureKeyboard
          containerDimensions={dimensions}
          selectable={configureKeyboardIsSelectable}
        />
      </group>
      <group position-x={testPosition}>
        <Test dimensions={dimensions} />
      </group>
      <group position-x={designPosition}>
        <Design dimensions={dimensions} />
      </group>
    </a.group>
  );
}, shallowEqual);
