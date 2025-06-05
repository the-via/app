import type {VIADefinitionV2, VIADefinitionV3} from '@the-via/reader';
import {VIAKey} from '@the-via/reader';
import {useCallback, useContext, useEffect, useMemo} from 'react';
import {TestKeyboardSounds} from 'src/components/void/test-keyboard-sounds';
import {
  getSelectedDefinition,
  getSelectedKeyDefinitions,
} from 'src/store/definitionsSlice';
import {
  getSelectedConnectedDevice,
  getSelectedKeyboardAPI,
} from 'src/store/devicesSlice';
import {useAppDispatch, useAppSelector} from 'src/store/hooks';
import {getSelectedKeymap, setLayer} from 'src/store/keymapSlice';
import {
  getIsTestMatrixEnabled,
  getTestKeyboardSoundsSettings,
  setTestMatrixEnabled,
} from 'src/store/settingsSlice';
import {DisplayMode, NDimension} from 'src/types/keyboard-rendering';
import {TestKeyState} from 'src/types/types';
import {matrixKeycodes} from 'src/utils/key-event';
import {getKeyboardRowPartitions} from 'src/utils/keyboard-rendering';
import {useGlobalKeys} from 'src/utils/use-global-keys';
import {useMatrixTest} from 'src/utils/use-matrix-test';
import {useLocation} from 'wouter';
import fullKeyboardDefinition from '../../../utils/test-keyboard-definition.json';
import {TestContext} from '../../panes/test';
import {getKeyboardCanvas} from './configure';
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

  const [globalPressedKeys, setGlobalPressedKeys] = useGlobalKeys(
    !isTestMatrixEnabled && isShowingTest,
  );
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
