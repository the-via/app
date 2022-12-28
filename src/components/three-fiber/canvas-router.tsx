import {Canvas, useFrame} from '@react-three/fiber';
import {useCallback, useMemo, useRef} from 'react';
import {
  getCustomDefinitions,
  getSelectedDefinition,
} from 'src/store/definitionsSlice';
import {useSize} from 'src/utils/use-size';
import {useLocation} from 'wouter';
import {Camera} from './camera';
import {
  ConfigureKeyboard,
  ConfigureRGBKeyboard,
  Design,
  Test,
} from './keyboard';
import {useAppDispatch, useAppSelector} from 'src/store/hooks';
import {
  Decal,
  Float,
  SpotLight,
  useGLTF,
  useProgress,
  useTexture,
} from '@react-three/drei';
import {
  getLoadProgress,
  updateSelectedKey,
  getConfigureKeyboardIsSelectable,
} from 'src/store/keymapSlice';
import {a, config, useSpring} from '@react-spring/three';
import React from 'react';
import {shallowEqual} from 'react-redux';
import {Object3D} from 'three';
import {getSelectedVersion} from 'src/store/designSlice';
import {DefinitionVersionMap, KeyColorType} from '@the-via/reader';
import {UpdateUVMaps} from './update-uv-maps';
import {getSelectedTheme} from 'src/store/settingsSlice';
import glbSrc from 'assets/models/keyboard_components.glb';
console.log('hiii', glbSrc);
useGLTF.preload(glbSrc);
//useTexture.preload('/images/chippy.png');

const LoaderSpinner = () => {
  const [chippyMap] = useTexture(['/images/chippy_600.png']);
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
  const definitionVersion = useAppSelector(getSelectedVersion);
  const theme = useAppSelector(getSelectedTheme);
  const accentColor = useMemo(() => theme[KeyColorType.Accent].c, [theme]);
  const versionDefinitions: DefinitionVersionMap[] = useMemo(
    () =>
      localDefinitions.filter(
        (definitionMap) => definitionMap[definitionVersion],
      ),
    [localDefinitions, definitionVersion],
  );
  const hideDesignScene = '/design' === path && !versionDefinitions.length;
  const hideConfigureScene =
    '/' === path &&
    (!selectedDefinition || (loadProgress + progress / 100) / 2 !== 1);
  const terrainOnClick = useCallback(() => {
    if (true) {
      dispatch(updateSelectedKey(null));
    }
  }, [dispatch]);
  const hasHIDSupport = 'hid' in navigator;
  const hideCanvasScene =
    !hasHIDSupport ||
    ['/settings'].includes(path) ||
    hideDesignScene ||
    hideConfigureScene;
  const configureKeyboardIsSelectable = useAppSelector(
    getConfigureKeyboardIsSelectable,
  );
  const a = '#aa9a9a';
  return (
    <>
      <UpdateUVMaps />
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
            <meshStandardMaterial color={accentColor} />
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
    </>
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
  const configurePosition = 0;
  const spaceMultiplier = 20;
  const testPosition = -spaceMultiplier * 1;
  const designPosition = -spaceMultiplier * 2;
  const debugPosition = -spaceMultiplier * 3;
  const otherPosition = -spaceMultiplier * 3;
  switch (route) {
    case '/debug': {
      return debugPosition;
    }
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
  const testPosition = -getRouteX('/test');
  const designPosition = -getRouteX('/design');
  const debugPosition = -getRouteX('/debug');
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
      <group position-x={debugPosition}>
        <ConfigureRGBKeyboard dimensions={dimensions} />
      </group>
    </a.group>
  );
}, shallowEqual);
