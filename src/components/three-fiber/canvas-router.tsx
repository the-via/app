import {Canvas} from '@react-three/fiber';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  getCustomDefinitions,
  getSelectedDefinition,
} from 'src/store/definitionsSlice';
import {useSize} from 'src/utils/use-size';
import {useLocation} from 'wouter';
import {Camera} from './camera';
import {ConfigureKeyboard, Design, Test} from '../n-links/keyboard';
import {useAppDispatch, useAppSelector} from 'src/store/hooks';
import {
  Html,
  OrbitControls,
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
import {Object3D} from 'three';
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
import {LoaderCubey} from './loader-cubey';
import {OVERRIDE_HID_CHECK} from 'src/utils/override';
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
export const CanvasRouter = () => {
  const [path] = useLocation();
  const body = useRef(document.body);
  const containerRef = useRef(null);
  const loadProgress = useAppSelector(getLoadProgress);
  const {progress} = useProgress();
  const dispatch = useAppDispatch();
  const dimensions = useSize(body);
  const localDefinitions = Object.values(useAppSelector(getCustomDefinitions));
  const selectedDefinition = useAppSelector(getSelectedDefinition);
  const definitionVersion = useAppSelector(getSelectedVersion);
  const theme = useAppSelector(getSelectedTheme);
  const accentColor = useMemo(() => theme[KeyColorType.Accent].c, [theme]);
  const [fontLoaded, setLoaded] = useState(false);
  const showLoader =
    path === '/' && (!selectedDefinition || loadProgress !== 1);
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
  const showAuthorizeButton = 'hid' in navigator || OVERRIDE_HID_CHECK;
  const hideCanvasScene =
    !showAuthorizeButton ||
    ['/settings'].includes(path) ||
    hideDesignScene ||
    hideConfigureScene;
  const configureKeyboardIsSelectable = useAppSelector(
    getConfigureKeyboardIsSelectable,
  );

  const hideTerrainBG = showLoader;
  useEffect(() => {
    // Block rendering due to font legend being required to render keyboardss
    document.fonts.load('bold 16px Fira Sans').then(() => {
      setLoaded(true);
    });
  }, []);
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
          zIndex: 0,
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
            theme={theme}
            visible={hideTerrainBG && !selectedDefinition}
          />
          <Html
            center
            position={[
              0,
              hideTerrainBG ? (!selectedDefinition ? -1 : 0) : 10,
              -19,
            ]}
          >
            {showAuthorizeButton ? (
              !selectedDefinition ? (
                <AccentButtonLarge
                  onClick={() => dispatch(reloadConnectedDevices())}
                  style={{width: 'max-content'}}
                >
                  Authorize device
                  <FontAwesomeIcon
                    style={{marginLeft: '10px'}}
                    icon={faUnlock}
                  />
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
              )
            ) : null}
          </Html>
          {fontLoaded ? (
            <KeyboardGroup
              containerRef={containerRef}
              configureKeyboardIsSelectable={configureKeyboardIsSelectable}
              loadProgress={loadProgress}
            />
          ) : null}
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
  // Setting for better perf on slower machines
  const renderAllLights = true;
  return renderAllLights ? (
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
  ) : (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[-0.5, y, z]} intensity={1.5} />
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

  return (
    <>
      <group visible={loadProgress === 1}>
        <ConfigureKeyboard
          dimensions={dimensions}
          selectable={configureKeyboardIsSelectable}
          nDimension={'3D'}
        />
      </group>
      <group position-x={testPosition}>
        <Test dimensions={dimensions} nDimension={'3D'} />
      </group>
      <group position-x={designPosition}>
        <Design dimensions={dimensions} nDimension={'3D'} />
      </group>
      <group position-x={debugPosition}></group>
    </>
  );
}, shallowEqual);
