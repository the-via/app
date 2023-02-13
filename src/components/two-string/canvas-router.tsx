import {Canvas} from '@react-three/fiber';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  getCustomDefinitions,
  getSelectedDefinition,
} from 'src/store/definitionsSlice';
import {useSize} from 'src/utils/use-size';
import {useLocation} from 'wouter';
import {ConfigureKeyboard, Design, Test} from './keyboard';
import {useAppDispatch, useAppSelector} from 'src/store/hooks';
import {Html, SpotLight, useGLTF, useProgress} from '@react-three/drei';
import {
  getLoadProgress,
  updateSelectedKey,
  getConfigureKeyboardIsSelectable,
  clearSelectedKey,
} from 'src/store/keymapSlice';
import {Globals} from '@react-spring/shared';
import React from 'react';
import {shallowEqual} from 'react-redux';
import {getSelectedVersion} from 'src/store/designSlice';
import {DefinitionVersionMap, KeyColorType} from '@the-via/reader';
import {getSelectedTheme} from 'src/store/settingsSlice';
import cubeySrc from 'assets/models/cubey.glb';
import {AccentButtonLarge} from '../inputs/accent-button';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {reloadConnectedDevices} from 'src/store/devicesThunks';
import {faSpinner, faUnlock} from '@fortawesome/free-solid-svg-icons';
import {LoaderCubey} from './loader-cubey';
import {OVERRIDE_HID_CHECK} from 'src/utils/override';
import {KeyboardRouteGroup} from './keyboard-route-group';
import styled from 'styled-components';
import {Object3D} from 'three';
import {Camera} from './camera';
import {getDarkenedColor} from 'src/utils/color-math';
import {webGLIsAvailable} from 'src/utils/test-webgl';
Globals.assign({
  frameLoop: 'always',
});

const KeyboardBG = styled.div<{
  onClick: () => void;
  color: string;
  visible: boolean;
}>`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: ${(props) =>
    `linear-gradient(30deg, rgba(150,150,150,1) 10%,${getDarkenedColor(
      props.color,
    )} 50%, rgba(150,150,150,1) 90%)`};
  opacity: ${(props) => (props.visible ? 1 : 0)};
`;
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

export const CanvasRouter = () => {
  const [path] = useLocation();
  const body = useRef(document.body);
  const containerRef = useRef(null);
  const loadProgress = useAppSelector(getLoadProgress);
  const {progress} = useProgress();
  const dispatch = useAppDispatch();
  const containerDimensions = useSize(containerRef);
  const dimensions = useSize(body);
  const [fontLoaded, setLoaded] = useState(false);
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
          zIndex: 2,
          visibility: hideCanvasScene && !hideTerrainBG ? 'hidden' : 'visible',
        }}
        onClick={(evt) => {
          if ((evt.target as any).nodeName !== 'CANVAS')
            dispatch(clearSelectedKey());
        }}
        ref={containerRef}
      >
        {hideCanvasScene ? null : (
          <>
            <KeyboardBG
              onClick={terrainOnClick}
              color={accentColor}
              visible={!hideTerrainBG}
            />
            {fontLoaded ? (
              <KeyboardGroup
                containerDimensions={containerDimensions}
                configureKeyboardIsSelectable={configureKeyboardIsSelectable}
                loadProgress={loadProgress}
              />
            ) : null}
          </>
        )}
      </div>
    </>
  );
};

const getRouteX = (route: string) => {
  const configurePosition = 0;
  const spaceMultiplier = 100;
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

const KeyboardGroupContainer = styled.div`
  z-index: 2;
  display: block;
  white-space: nowrap;
  height: 500px;
  background: linear-gradient(90deg, red, blue);
  width: max-content;
  position: absolute;
  top: 0;
  left: 0;
`;
const KeyboardGroup = React.memo((props: any) => {
  const {loadProgress, configureKeyboardIsSelectable, containerDimensions} =
    props;
  const [path] = useLocation();
  const routeX = getRouteX(path);
  console.log('bla');
  const style = {
    transition: 'transform 0.25s ease-in-out',
    transform: `translate(${routeX}vw,0px)`,
  };
  return (
    <KeyboardGroupContainer style={style}>
      <Keyboards
        configureKeyboardIsSelectable={configureKeyboardIsSelectable}
        loadProgress={loadProgress}
        dimensions={containerDimensions}
      />
    </KeyboardGroupContainer>
  );
}, shallowEqual);
const Keyboards = React.memo((props: any) => {
  const {loadProgress, dimensions, configureKeyboardIsSelectable} = props;
  return (
    <>
      <KeyboardRouteGroup position={0} visible={loadProgress === 1}>
        <ConfigureKeyboard
          dimensions={dimensions}
          selectable={configureKeyboardIsSelectable}
        />
      </KeyboardRouteGroup>
      <KeyboardRouteGroup position={1}>
        <Test dimensions={dimensions} />
      </KeyboardRouteGroup>
      <KeyboardRouteGroup position={2}>
        <Design dimensions={dimensions} />
      </KeyboardRouteGroup>
      <KeyboardRouteGroup position={3}></KeyboardRouteGroup>
    </>
  );
}, shallowEqual);
