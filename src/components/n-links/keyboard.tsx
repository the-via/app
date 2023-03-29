import {useCallback, useContext, useEffect, useMemo} from 'react';
import {matrixKeycodes} from 'src/utils/key-event';
import fullKeyboardDefinition from '../../utils/test-keyboard-definition.json';
import {VIAKey, DefinitionVersionMap} from '@the-via/reader';
import {useAppDispatch, useAppSelector} from 'src/store/hooks';
import {
  getSelectedKeyDefinitions,
  getSelectedDefinition,
  getCustomDefinitions,
} from 'src/store/definitionsSlice';
import type {VIADefinitionV2, VIADefinitionV3} from '@the-via/reader';
import {
  getSelectedKeymap,
  getSelectedPaletteColor,
  setLayer,
} from 'src/store/keymapSlice';
import {KeyboardCanvas as StringKeyboardCanvas} from '../two-string/keyboard-canvas';
import {KeyboardCanvas as FiberKeyboardCanvas} from '../three-fiber/keyboard-canvas';
import {useLocation} from 'wouter';
import {
  getSelectedConnectedDevice,
  getSelectedKeyboardAPI,
} from 'src/store/devicesSlice';
import {
  getDesignDefinitionVersion,
  getIsTestMatrixEnabled,
  getTestKeyboardSoundsSettings,
  setTestMatrixEnabled,
} from 'src/store/settingsSlice';
import {
  getDesignSelectedOptionKeys,
  getSelectedDefinitionIndex,
  getShowMatrix,
} from 'src/store/designSlice';
import {useGlobalKeys} from 'src/utils/use-global-keys';
import {useMatrixTest} from 'src/utils/use-matrix-test';
import {TestContext} from '../panes/test';
import {TestKeyState} from 'src/types/types';
import {useColorPainter} from 'src/utils/use-color-painter';
import {getShowKeyPainter} from 'src/store/menusSlice';
import {TestKeyboardSounds} from 'src/components/void/test-keyboard-sounds';
import {DisplayMode, NDimension} from 'src/types/keyboard-rendering';
import {getKeyboardRowPartitions} from 'src/utils/keyboard-rendering';

const getKeyboardCanvas = (dimension: '2D' | '3D') =>
  dimension === '2D' ? StringKeyboardCanvas : FiberKeyboardCanvas;

export const ConfigureKeyboard = (props: {
  selectable?: boolean;
  dimensions?: DOMRect;
  nDimension: NDimension;
}) => {
  const {selectable, dimensions} = props;
  const matrixKeycodes = useAppSelector(
    (state) => getSelectedKeymap(state) || [],
  );
  const keys: (VIAKey & {ei?: number})[] = useAppSelector(
    getSelectedKeyDefinitions,
  );
  const definition = useAppSelector(getSelectedDefinition);
  const showKeyPainter = useAppSelector(getShowKeyPainter);
  const selectedPaletteColor = useAppSelector(getSelectedPaletteColor);
  const {keyColors, onKeycapPointerDown, onKeycapPointerOver} = useColorPainter(
    keys,
    selectedPaletteColor,
  );
  const [normalizedKeys, normalizedColors] = useMemo(() => {
    // skip keys without colors on it
    return keyColors && keys
      ? [
          keys.filter((_, i) => keyColors[i] && keyColors[i].length),
          keyColors.filter((i) => i && i.length),
        ]
      : [null, null];
  }, [keys, keyColors]);

  if (!definition || !dimensions) {
    return null;
  }

  const KeyboardCanvas = getKeyboardCanvas(props.nDimension);
  return (
    <>
      <KeyboardCanvas
        matrixKeycodes={matrixKeycodes}
        keys={keys}
        selectable={!!selectable}
        definition={definition}
        containerDimensions={dimensions}
        mode={DisplayMode.Configure}
        shouldHide={showKeyPainter}
      />
      {normalizedKeys &&
      normalizedKeys.length &&
      normalizedColors &&
      normalizedColors.length ? (
        <KeyboardCanvas
          matrixKeycodes={matrixKeycodes}
          keys={normalizedKeys}
          selectable={showKeyPainter}
          definition={definition}
          containerDimensions={dimensions}
          mode={DisplayMode.ConfigureColors}
          keyColors={normalizedColors}
          onKeycapPointerDown={onKeycapPointerDown}
          onKeycapPointerOver={onKeycapPointerOver}
          shouldHide={!showKeyPainter}
        />
      ) : null}
    </>
  );
};

const TestKeyboard = (props: {
  selectable?: boolean;
  containerDimensions?: DOMRect;
  pressedKeys?: TestKeyState[];
  matrixKeycodes: number[];
  keys: (VIAKey & {ei?: number})[];
  definition: VIADefinitionV2 | VIADefinitionV3;
  nDimension: NDimension;
}) => {
  const {
    selectable,
    containerDimensions,
    matrixKeycodes,
    keys,
    pressedKeys,
    definition,
    nDimension,
  } = props;
  if (!containerDimensions) {
    return null;
  }

  const KeyboardCanvas = getKeyboardCanvas(nDimension);
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
const DesignKeyboard = (props: {
  containerDimensions?: DOMRect;
  definition: VIADefinitionV2 | VIADefinitionV3;
  showMatrix?: boolean;
  selectedOptionKeys: number[];
  nDimension: NDimension;
}) => {
  const {containerDimensions, showMatrix, definition, selectedOptionKeys} =
    props;
  const {keys, optionKeys} = definition.layouts;
  if (!containerDimensions) {
    return null;
  }

  const displayedOptionKeys = useMemo(
    () =>
      optionKeys
        ? Object.entries(optionKeys).flatMap(([key, options]) => {
            const optionKey = parseInt(key);

            // If a selection option has been set for this optionKey, use that
            return selectedOptionKeys[optionKey]
              ? options[selectedOptionKeys[optionKey]]
              : options[0];
          })
        : [],
    [optionKeys, selectedOptionKeys],
  );

  const displayedKeys = useMemo(() => {
    return [...keys, ...displayedOptionKeys];
  }, [keys, displayedOptionKeys]);
  const KeyboardCanvas = getKeyboardCanvas(props.nDimension);
  return (
    <KeyboardCanvas
      matrixKeycodes={EMPTY_ARR}
      keys={displayedKeys}
      selectable={false}
      definition={definition}
      containerDimensions={containerDimensions}
      mode={DisplayMode.Design}
      showMatrix={showMatrix}
    />
  );
};

export const Design = (props: {
  dimensions?: DOMRect;
  nDimension: NDimension;
}) => {
  const localDefinitions = Object.values(useAppSelector(getCustomDefinitions));
  const definitionVersion = useAppSelector(getDesignDefinitionVersion);
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
    definition && (
      <DesignKeyboard
        containerDimensions={props.dimensions}
        definition={definition}
        selectedOptionKeys={selectedOptionKeys}
        showMatrix={showMatrix}
        nDimension={props.nDimension}
      />
    )
  );
};

const EMPTY_ARR = [] as any[];
export const Test = (props: {dimensions?: DOMRect; nDimension: NDimension}) => {
  const dispatch = useAppDispatch();
  const [path] = useLocation();
  const isShowingTest = path === '/test';
  const api = useAppSelector(getSelectedKeyboardAPI);
  const device = useAppSelector(getSelectedConnectedDevice);
  const selectedDefinition = useAppSelector(getSelectedDefinition);
  const keyDefinitions = useAppSelector(getSelectedKeyDefinitions);
  const isTestMatrixEnabled = useAppSelector(getIsTestMatrixEnabled);
  const testKeyboardSoundsSettings = useAppSelector(
    getTestKeyboardSoundsSettings,
  );
  const selectedMatrixKeycodes = useAppSelector(
    (state) => getSelectedKeymap(state) || [],
  );

  const [globalPressedKeys, setGlobalPressedKeys] =
    useGlobalKeys(isShowingTest);
  const [matrixPressedKeys, setMatrixPressedKeys] = useMatrixTest(
    isTestMatrixEnabled && isShowingTest,
    api as any,
    device as any,
    selectedDefinition as any,
  );

  const clearTestKeys = useCallback(() => {
    setGlobalPressedKeys(EMPTY_ARR);
    setMatrixPressedKeys(EMPTY_ARR);
  }, [setGlobalPressedKeys, setMatrixPressedKeys]);

  const testContext = useContext(TestContext);
  //// Hack to share setting a local state to avoid causing cascade of rerender
  useEffect(() => {
    if (testContext[0].clearTestKeys !== clearTestKeys) {
      testContext[1]({clearTestKeys});
    }
  }, [testContext, clearTestKeys]);

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

  const matrixPressedKeysMapped =
    isTestMatrixEnabled && keyDefinitions
      ? keyDefinitions.map(
          ({row, col}: {row: number; col: number}) =>
            selectedDefinition &&
            matrixPressedKeys[
              (row * selectedDefinition.matrix.cols +
                col) as keyof typeof matrixPressedKeys
            ],
        )
      : [];

  const testDefinition = isTestMatrixEnabled
    ? selectedDefinition
    : fullKeyboardDefinition;
  const testKeys = isTestMatrixEnabled
    ? keyDefinitions
    : fullKeyboardDefinition.layouts.keys;

  if (!testDefinition || typeof testDefinition === 'string') {
    return null;
  }

  const testPressedKeys = isTestMatrixEnabled
    ? (matrixPressedKeysMapped as TestKeyState[])
    : (globalPressedKeys as TestKeyState[]);

  const {partitionedKeys} = useMemo(
    () => getKeyboardRowPartitions(testKeys as VIAKey[]),
    [testKeys],
  );
  const testPressedKeys2 = isTestMatrixEnabled
    ? (matrixPressedKeys as TestKeyState[])
    : (globalPressedKeys as TestKeyState[]);
  const partitionedPressedKeys: TestKeyState[][] = partitionedKeys.map(
    (rowArray) => {
      return rowArray.map(
        ({row, col}: {row: number; col: number}) =>
          testPressedKeys2[
            (row * testDefinition.matrix.cols +
              col) as keyof typeof testPressedKeys2
          ],
      ) as TestKeyState[];
    },
  );

  return (
    <>
      <TestKeyboard
        definition={testDefinition as VIADefinitionV2}
        keys={testKeys as VIAKey[]}
        pressedKeys={testPressedKeys}
        matrixKeycodes={
          isTestMatrixEnabled ? selectedMatrixKeycodes : matrixKeycodes
        }
        containerDimensions={props.dimensions}
        nDimension={props.nDimension}
      />
      {partitionedPressedKeys && testKeyboardSoundsSettings.isEnabled && (
        <TestKeyboardSounds pressedKeys={partitionedPressedKeys} />
      )}
    </>
  );
};
