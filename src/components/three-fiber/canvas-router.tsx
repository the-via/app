import {Canvas, useFrame} from '@react-three/fiber';
import {useCallback, useContext, useEffect, useRef} from 'react';
import {matrixKeycodes} from 'src/utils/key-event';
import fullKeyboardDefinition from '../../utils/test-keyboard-definition.json';
import {
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
import {
  Camera,
  ConfigureKeyboard,
  DesignProvider,
  Terrain,
  TestKeyboard,
} from './keyboard';
import {useAppDispatch, useAppSelector} from 'src/store/hooks';
import {VIADefinitionV2, VIAKey} from '@the-via/reader';
import {TestKeyState} from '../test-keyboard';
import {Decal, useProgress, useTexture} from '@react-three/drei';
import {getLoadProgress, updateSelectedKey} from 'src/store/keymapSlice';
import {useSpring} from '@react-spring/three';
import {TestContext} from '../panes/test';

const EMPTY_ARR: number[] = [];
const Test = (props: {dimensions?: DOMRect}) => {
  const dispatch = useAppDispatch();
  const [path] = useLocation();
  const isShowingTest = path === '/test';
  const selectedDevice = useAppSelector(getSelectedConnectedDevice);
  const selectedDefinition = useAppSelector(getSelectedDefinition);
  const keyDefinitions = useAppSelector(getSelectedKeyDefinitions);
  const isTestMatrixEnabled = useAppSelector(getIsTestMatrixEnabled);

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
  testContext[1]({clearTestKeys});

  useEffect(() => {
    // Remove event listeners on cleanup
    if (!isShowingTest) {
      dispatch(setTestMatrixEnabled(false));
      testContext[0].clearTestKeys();
    }
  }, [isShowingTest]); // Empty array ensures that effect is only run on mount and unmount

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
      matrixKeycodes={isTestMatrixEnabled ? EMPTY_ARR : matrixKeycodes}
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
  const dispatch = useAppDispatch();
  const terrainOnClick = useCallback(() => {
    if (true) {
      dispatch(updateSelectedKey(null));
    }
  }, [dispatch]);
  const hideCanvasScene = ['/design', '/settings'].includes(path);

  return (
    <DesignProvider>
      <div
        style={{
          height: 500,
          width: '100%',
          position: hideCanvasScene ? 'absolute' : 'relative',
          visibility: hideCanvasScene ? 'hidden' : 'visible',
        }}
        ref={containerRef}
      >
        <Canvas>
          <ambientLight intensity={0.8} />
          <pointLight position={[10, 10, -15]} />
          {dimensions && (
            <>
              <group position={[0, -0.05, -19]} scale={0.015}>
                <Terrain onClick={terrainOnClick} />
              </group>
              <Camera containerDimensions={dimensions} keys={[]} />
            </>
          )}
          <group visible={loadProgress === 1}>
            <ConfigureKeyboard
              containerDimensions={dimensions}
              selectable={true}
            />

            <group position={[20, 0, 0]}></group>
          </group>
          <group position={[10, 0, 0]}>
            <Test dimensions={dimensions} />
          </group>
        </Canvas>
      </div>
    </DesignProvider>
  );
};
