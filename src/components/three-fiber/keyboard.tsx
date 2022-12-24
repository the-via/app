import {useCallback, useContext, useEffect, useMemo} from 'react';
import {matrixKeycodes} from 'src/utils/key-event';
import fullKeyboardDefinition from '../../utils/test-keyboard-definition.json';
import {VIAKey, KeyColorType, DefinitionVersionMap} from '@the-via/reader';
import {useAppDispatch, useAppSelector} from 'src/store/hooks';
import {
  getSelectedKeyDefinitions,
  getSelectedDefinition,
  getCustomDefinitions,
} from 'src/store/definitionsSlice';
import type {VIADefinitionV2, VIADefinitionV3} from '@the-via/reader';
import {getSelectedKeymap, setLayer} from 'src/store/keymapSlice';
import {TestKeyState} from '../test-keyboard';
import {KeyboardCanvas} from './keyboard-canvas';
import {useLocation} from 'wouter';
import {getSelectedConnectedDevice} from 'src/store/devicesSlice';
import {
  getIsTestMatrixEnabled,
  setTestMatrixEnabled,
} from 'src/store/settingsSlice';
import {
  getDesignSelectedOptionKeys,
  getSelectedDefinitionIndex,
  getSelectedVersion,
  getShowMatrix,
} from 'src/store/designSlice';
import {useGlobalKeys} from 'src/utils/use-global-keys';
import {useMatrixTest} from 'src/utils/use-matrix-test';
import {TestContext} from '../panes/test';

enum DisplayMode {
  Test = 1,
  Configure = 2,
  Design = 3,
}

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

export const Design = (props: {dimensions?: DOMRect}) => {
  const localDefinitions = Object.values(useAppSelector(getCustomDefinitions));
  const definitionVersion = useAppSelector(getSelectedVersion);
  const selectedDefinitionIndex = useAppSelector(getSelectedDefinitionIndex);
  const selectedOptionKeys = useAppSelector(getDesignSelectedOptionKeys);
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
export const Test = (props: {dimensions?: DOMRect}) => {
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
