import {Canvas, useFrame} from '@react-three/fiber';
import {Suspense, useCallback, useEffect, useMemo, useRef} from 'react';
import {
  getCustomDefinitions,
  getSelectedDefinition,
} from 'src/store/definitionsSlice';
import {useSize} from 'src/utils/use-size';
import {useLocation} from 'wouter';
import {Camera} from './camera';
import {ConfigureKeyboard, Design, Test} from './keyboard';
import {useAppDispatch, useAppSelector} from 'src/store/hooks';
import {
  Float,
  Html,
  OrbitControls,
  PresentationControls,
  SpotLight,
  useGLTF,
  useProgress,
} from '@react-three/drei';
import {
  getLoadProgress,
  updateSelectedKey,
  getConfigureKeyboardIsSelectable,
} from 'src/store/keymapSlice';
import {a, config, useSpring} from '@react-spring/three';
import React from 'react';
import {shallowEqual} from 'react-redux';
import {Color, Object3D} from 'three';
import {getSelectedVersion} from 'src/store/designSlice';
import {DefinitionVersionMap, KeyColorType} from '@the-via/reader';
import {UpdateUVMaps} from './update-uv-maps';
import {getSelectedTheme} from 'src/store/settingsSlice';
import glbSrc from 'assets/models/keyboard_components.glb';
import cubeySrc from 'assets/models/cubey.glb';
import {AccentButtonLarge} from '../inputs/accent-button';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {reloadConnectedDevices} from 'src/store/devicesThunks';
import {faSpinner, faUnlock} from '@fortawesome/free-solid-svg-icons';
useGLTF.preload(cubeySrc);
useGLTF.preload(glbSrc);

const KeyboardBG: React.FC<{
  color: string;
  onClick: () => void;
  visible: boolean;
}> = React.memo((props) => {
  const {onClick, visible, color} = props;
  return (
    <mesh
      receiveShadow
      position={[0, -5.75, 0]}
      rotation={[-Math.PI / 2 + Math.PI / 14, 0, 0]}
      onClick={onClick}
      visible={visible}
    >
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}, shallowEqual);

const LoaderCubey: React.FC<{color: string; visible: boolean}> = React.memo(
  ({visible, color}) => {
    const cubeyGLTF = useGLTF(cubeySrc);
    const spinnerRef = useRef<any>();
    const yInit = !visible ? 10 : -1.05;

    cubeyGLTF.scene.children.forEach((child) => {
      if (child.name === 'body') {
        //        child.material.color = new Color(color);
        console.log(child);
      }
    });

    useFrame(({clock}) => {
      if (visible) {
        spinnerRef.current.rotation.z =
          Math.sin(clock.elapsedTime) * (Math.PI / 40);
        spinnerRef.current.rotation.y =
          Math.PI + Math.sin(0.6 * clock.elapsedTime) * (Math.PI / 16);
        console.log(spinnerRef.current);
        spinnerRef.current.position.y =
          yInit + 0.2 * Math.sin(clock.elapsedTime);
      }
    });

    return (
      <>
        <group ref={spinnerRef} scale={0.8} position={[0, yInit, -19]}>
          <PresentationControls
            enabled={true} // the controls can be disabled by setting this to false
            global={true} // Spin globally or by dragging the model
            snap={true} // Snap-back to center (can also be a spring config)
            speed={1} // Speed factor
            zoom={1} // Zoom factor when half the polar-max is reached
            rotation={[0, 0, 0]} // Default rotation
            polar={[-Math.PI / 4, Math.PI / 4]} // Vertical limits
            azimuth={[-Math.PI / 4, Math.PI / 4]} // Horizontal limits
            config={{mass: 1, tension: 170, friction: 26}} // Spring config
          >
            <primitive object={cubeyGLTF.scene} />
          </PresentationControls>
        </group>
      </>
    );
  },
  shallowEqual,
);

export const CanvasRouter = () => {
  const [path] = useLocation();
  const body = useRef(document.body);
  const containerRef = useRef(null);
  const container2Ref = useRef(null);
  const loadProgress = useAppSelector(getLoadProgress);
  const rootContainer3Ref = useRef(null);
  const {progress} = useProgress();
  const dispatch = useAppDispatch();
  const dimensions = useSize(body);
  const localDefinitions = Object.values(useAppSelector(getCustomDefinitions));
  const selectedDefinition = useAppSelector(getSelectedDefinition);
  const definitionVersion = useAppSelector(getSelectedVersion);
  const theme = useAppSelector(getSelectedTheme);
  const cubey = useGLTF(cubeySrc);
  const accentColor = useMemo(() => theme[KeyColorType.Accent].c, [theme]);
  const showLoader =
    path === '/' && (!selectedDefinition || loadProgress !== 1);
  console.log(cubey, 'cubey');
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

  const hideTerrainBG = showLoader;
  return (
    <>
      <UpdateUVMaps />
      <div
        style={{
          height: 500,
          width: '100%',
          top: 0,
          transform: hideCanvasScene
            ? !hideTerrainBG
              ? 'translateY(-500px)'
              : !dimensions
              ? ''
              : `translateY(${-300 + dimensions!.height / 2}px)`
            : '',
          position: hideCanvasScene && !hideTerrainBG ? 'absolute' : 'relative',
          overflow: 'visible',
          visibility: hideCanvasScene && !hideTerrainBG ? 'hidden' : 'visible',
        }}
        ref={containerRef}
      >
        <Canvas flat={true} shadows style={{overflow: 'visible'}}>
          <Lights />
          <KeyboardBG
            onClick={terrainOnClick}
            color={accentColor}
            visible={!hideTerrainBG}
          />
          <OrbitControls enabled={false} />
          <Camera />
          <LoaderCubey
            color={accentColor}
            visible={hideTerrainBG && !selectedDefinition}
          />
          <Html
            center
            position={[
              0,
              hideTerrainBG ? (!selectedDefinition ? -1.75 : 0) : 10,
              -19,
            ]}
          >
            {!selectedDefinition ? (
              <AccentButtonLarge
                onClick={() => dispatch(reloadConnectedDevices())}
                style={{width: 'max-content'}}
              >
                Authorize device
                <FontAwesomeIcon style={{marginLeft: '10px'}} icon={faUnlock} />
              </AccentButtonLarge>
            ) : (
              <>
                <div
                  style={{
                    textAlign: 'center',
                    color: 'var(--color_accent)',
                    fontSize: 60,
                  }}
                >
                  <FontAwesomeIcon spinPulse icon={faSpinner} />
                </div>
              </>
            )}
          </Html>
          <Float
            speed={1} // Animation speed, defaults to 1
            rotationIntensity={0.0} // XYZ rotation intensity, defaults to 1
            floatIntensity={1} // Up/down float intensity, works like a multiplier with floatingRange,defaults to 1
            floatingRange={[0, 0.1]} // Range of y-axis values the object will float within, defaults to [-0.1,0.1]
          >
            <KeyboardGroup
              containerRef={containerRef}
              configureKeyboardIsSelectable={configureKeyboardIsSelectable}
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
  const ref = useRef<THREE.SpotLight>(null);
  useEffect(() => {
    if (ref.current) {
      ref.current.shadow.mapSize.width = 2048;
      ref.current.shadow.mapSize.height = 2048;
    }
  }, [ref.current]);
  const targetObj = React.useMemo(() => {
    const obj = new Object3D();
    obj.position.set(0, 0, spotlightZ);
    obj.updateMatrixWorld();
    return obj;
  }, []);
  return (
    <>
      <ambientLight intensity={0.0} />
      <SpotLight
        ref={ref}
        distance={spotlightY + 3}
        position={[0, spotlightY, spotlightZ + 2]}
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

const KeyboardGroup = React.memo((props: any) => {
  const {loadProgress, configureKeyboardIsSelectable} = props;
  const [path] = useLocation();
  const routeX = getRouteX(path);
  const slide = useSpring({
    config: config.stiff,
    x: routeX,
  });
  const dimensions = useSize(props.containerRef);
  return (
    <a.group position-x={slide.x}>
      <Keyboards
        configureKeyboardIsSelectable={configureKeyboardIsSelectable}
        loadProgress={loadProgress}
        dimensions={dimensions}
      />
    </a.group>
  );
}, shallowEqual);
const Keyboards = React.memo((props: any) => {
  const {loadProgress, dimensions, configureKeyboardIsSelectable} = props;
  const testPosition = -getRouteX('/test');
  const designPosition = -getRouteX('/design');
  const debugPosition = -getRouteX('/debug');

  console.log('rerender');
  return (
    <>
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
      <group position-x={debugPosition}></group>
    </>
  );
}, shallowEqual);
