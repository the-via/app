import {useProgress} from '@react-three/drei';
import {DefinitionVersionMap, KeyColorType} from '@the-via/reader';
import React, {useCallback, useEffect, useMemo, useRef} from 'react';
import {shallowEqual} from 'react-redux';
import {
  getCustomDefinitions,
  getSelectedDefinition,
} from 'src/store/definitionsSlice';
import {useAppDispatch, useAppSelector} from 'src/store/hooks';
import {
  clearSelectedKey,
  getConfigureKeyboardIsSelectable,
  getLoadProgress,
  updateSelectedKey,
} from 'src/store/keymapSlice';
import {
  getDesignDefinitionVersion,
  getSelectedTheme,
} from 'src/store/settingsSlice';
import {getDarkenedColor} from 'src/utils/color-math';
import {OVERRIDE_HID_CHECK} from 'src/utils/override';
import {useSize} from 'src/utils/use-size';
import styled from 'styled-components';
import {useLocation} from 'wouter';
import {ConfigureKeyboard} from '../n-links/keyboard/configure';
import {Design} from '../n-links/keyboard/design';
import {Test} from '../n-links/keyboard/test';

const KeyboardBG = styled.div<{
  onClick: () => void;
  $color: string;
  $visible: boolean;
}>`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: ${(props) =>
    `linear-gradient(30deg, rgba(150,150,150,1) 10%,${getDarkenedColor(
      props.$color,
    )} 50%, rgba(150,150,150,1) 90%)`};
  opacity: ${(props) => (props.$visible ? 1 : 0)};
`;

const KeyboardRouteGroup = styled.div<{
  $position: number;
}>`
  position: absolute;
  left: 0;
  transform: translateX(${(p) => p.$position * 100}vw);
  height: 100%;
  width: 100vw;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

export const CanvasRouter = () => {
  const [path] = useLocation();
  const body = useRef(document.body);
  const containerRef = useRef(null);
  const loadProgress = useAppSelector(getLoadProgress);
  const {progress} = useProgress();
  const dispatch = useAppDispatch();
  const containerDimensions = useSize(containerRef);
  const dimensions = useSize(body);
  const localDefinitions = Object.values(useAppSelector(getCustomDefinitions));
  const selectedDefinition = useAppSelector(getSelectedDefinition);
  const definitionVersion = useAppSelector(getDesignDefinitionVersion);
  const theme = useAppSelector(getSelectedTheme);
  const accentColor = useMemo(() => theme[KeyColorType.Accent].c, [theme]);
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
    ['/settings', '/errors'].includes(path) ||
    hideDesignScene ||
    hideConfigureScene;
  const configureKeyboardIsSelectable = useAppSelector(
    getConfigureKeyboardIsSelectable,
  );
  const hideTerrainBG = showLoader;

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
              $color={accentColor}
              $visible={!hideTerrainBG}
            />
            <KeyboardGroup
              containerDimensions={containerDimensions}
              configureKeyboardIsSelectable={configureKeyboardIsSelectable}
              loadProgress={loadProgress}
            />
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
  height: 100%;
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
  const ref = useRef<HTMLDivElement>(null);
  const routeX = getRouteX(path);
  const animation = {
    transition: 'transform 0.25s ease-in-out',
    transform: `translate(${routeX}vw, 0px)`,
  };

  const addTransition = useCallback(() => {
    if (ref.current) {
      ref.current.style.transition = animation.transition;
    }
  }, [ref.current]);

  const removeTransition = useCallback(() => {
    if (ref.current) {
      ref.current.style.transition = '';
    }
  }, [ref.current]);

  useEffect(() => {
    if (ref.current) {
      ref.current.addEventListener('transitionend', removeTransition);
      ref.current.style.transform = animation.transform;
    }
    return () => {
      if (ref.current) {
        ref.current?.removeEventListener('transitionend', removeTransition);
      }
    };
  }, []);

  useEffect(() => {
    if (ref.current && ref.current.style.transform !== animation.transform) {
      addTransition();
      ref.current.style.transform = animation.transform;
    }
  }, [routeX]);
  return (
    <KeyboardGroupContainer ref={ref}>
      <Keyboards
        configureKeyboardIsSelectable={configureKeyboardIsSelectable}
        loadProgress={loadProgress}
        dimensions={containerDimensions}
      />
    </KeyboardGroupContainer>
  );
}, shallowEqual);
const Keyboards = React.memo((props: any) => {
  const {dimensions, configureKeyboardIsSelectable} = props;
  return (
    <>
      <KeyboardRouteGroup $position={0}>
        <ConfigureKeyboard
          dimensions={dimensions}
          selectable={configureKeyboardIsSelectable}
          nDimension={'2D'}
        />
      </KeyboardRouteGroup>
      <KeyboardRouteGroup $position={1}>
        <Test dimensions={dimensions} nDimension={'2D'} />
      </KeyboardRouteGroup>
      <KeyboardRouteGroup $position={2}>
        <Design dimensions={dimensions} nDimension={'2D'} />
      </KeyboardRouteGroup>
      <KeyboardRouteGroup $position={3}></KeyboardRouteGroup>
    </>
  );
}, shallowEqual);
