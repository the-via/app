import React, {useState, useEffect, useRef, FC} from 'react';
import fullKeyboardDefinition from '../../utils/test-keyboard-definition.json';
import useResizeObserver from '@react-hook/resize-observer';
import {Pane} from './pane';
import styled from 'styled-components';
import {PROTOCOL_GAMMA, KeyboardValue} from '../../utils/keyboard-api';
import {TestKeyboard, TestKeyState} from '../test-keyboard';
import {matrixKeycodes, getIndexByEvent} from '../inputs/musical-key-slider';
import {
  ControlRow,
  Label,
  Detail,
  OverflowCell,
  FlexCell,
  Grid1Col,
} from './grid';
import {AccentSlider} from '../inputs/accent-slider';
import {AccentButton} from '../inputs/accent-button';
import {useDispatch} from 'react-redux';
import {useAppSelector} from 'src/store/hooks';
import {getSelectedConnectedDevice} from 'src/store/devicesSlice';
import {
  getSelectedDefinition,
  getSelectedKeyDefinitions,
} from 'src/store/definitionsSlice';
import {
  getIsTestMatrixEnabled,
  setTestMatrixEnabled,
} from 'src/store/settingsSlice';

const Container = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  padding: 0 12px;
`;

const TestPane = styled(Pane)`
  display: flex;
  height: 100%;
  max-width: 100vw;
  flex-direction: column;
`;

let startTest = false;

const invertTestKeyState = (s: TestKeyState) =>
  s === TestKeyState.KeyDown ? TestKeyState.KeyUp : TestKeyState.KeyDown;

export const Test: FC = () => {
  const dispatch = useDispatch();
  const selectedDevice = useAppSelector(getSelectedConnectedDevice);
  const selectedDefinition = useAppSelector(getSelectedDefinition);
  const keyDefinitions = useAppSelector(getSelectedKeyDefinitions);
  const isTestMatrixEnabled = useAppSelector(getIsTestMatrixEnabled);

  const [dimensions, setDimensions] = useState({
    width: 1280,
    height: 900,
  });
  const [selectedKeys, setSelectedKeys] = useState(
    {} as {[key: string]: TestKeyState},
  );

  let flat = [] as number[];

  // If pressed key is our target key then set to true
  function downHandler(evt: KeyboardEvent) {
    evt.preventDefault();
    if (
      !startTest &&
      selectedKeys[getIndexByEvent(evt) ?? -1] !== TestKeyState.KeyDown
    ) {
      setSelectedKeys((selectedKeys) => ({
        ...selectedKeys,
        [getIndexByEvent(evt)]: TestKeyState.KeyDown,
      }));
    }
  }

  // If released key is our target key then set to false
  const upHandler = (evt: KeyboardEvent) => {
    evt.preventDefault();
    if (
      !startTest &&
      selectedKeys[getIndexByEvent(evt)] !== TestKeyState.KeyUp
    ) {
      setSelectedKeys((selectedKeys) => ({
        ...selectedKeys,
        [getIndexByEvent(evt)]: TestKeyState.KeyUp,
      }));
    }
  };

  const useMatrixTest = async () => {
    if (startTest && api && selectedDefinition) {
      const {cols, rows} = selectedDefinition.matrix;
      const bytesPerRow = Math.ceil(cols / 8);
      try {
        const newFlat = (await api.getKeyboardValue(
          KeyboardValue.SWITCH_MATRIX_STATE,
          bytesPerRow * rows,
        )) as number[];

        const keysChanges =
          0 !==
          newFlat.reduce<number>((prev, val, byteIdx) => {
            return (prev + val) ^ (flat[byteIdx] || 0);
          }, 0);
        if (!keysChanges) {
          await api.timeout(20);
          useMatrixTest();
          return;
        }
        setSelectedKeys((selectedKeys) => {
          const newPressedKeys = newFlat.reduce(
            (res, val, byteIdx) => {
              const xor = val ^ (flat[byteIdx] || 0);
              if (xor === 0) {
                return res;
              }
              const row = ~~(byteIdx / bytesPerRow);

              const colOffset = 8 * (bytesPerRow - 1 - (byteIdx % bytesPerRow));
              return Array(Math.max(0, Math.min(8, cols - colOffset)))
                .fill(0)
                .reduce((resres, _, idx) => {
                  const matrixIdx = cols * row + idx + colOffset;
                  resres[matrixIdx] =
                    ((xor >> idx) & 1) === 1
                      ? invertTestKeyState(resres[matrixIdx])
                      : resres[matrixIdx];
                  return resres;
                }, res);
            },
            Array.isArray(selectedKeys) && selectedKeys.length === rows * cols
              ? [...selectedKeys]
              : Array(rows * cols).fill(TestKeyState.Initial),
          );
          return newPressedKeys as any as {[key: string]: TestKeyState};
        });
        flat = newFlat;
        await api.timeout(20);
        useMatrixTest();
      } catch (e) {
        startTest = false;
        dispatch(setTestMatrixEnabled(false));
      }
    }
  };

  const onClickHandler = () => {
    flat = [];
    setSelectedKeys({});
  };

  // Add event listeners
  useEffect(() => {
    window.addEventListener('keydown', downHandler);
    window.addEventListener('keyup', upHandler);
    // Remove event listeners on cleanup
    return () => {
      startTest = false;
      window.removeEventListener('keydown', downHandler);
      window.removeEventListener('keyup', upHandler);
    };
  }, []); // Empty array ensures that effect is only run on mount and unmount

  const flexRef = useRef<HTMLDivElement>(null);
  // FIXME: Won't work on the initial render
  useResizeObserver(flexRef, ({contentRect}) => {
    if (!flexRef.current) return;

    setDimensions({
      width: contentRect.width,
      height: contentRect.height,
    });
  });

  // TODO: really need to find a way to clean these nulls up. createEntityAdapter maybe?
  if (!selectedDevice || !selectedDefinition || !keyDefinitions) {
    return null;
  }
  const {api, protocol} = selectedDevice;
  const canUseMatrixState = PROTOCOL_GAMMA <= protocol;

  const pressedKeys =
    !isTestMatrixEnabled || !keyDefinitions
      ? selectedKeys
      : keyDefinitions.map(
          ({row, col}: {row: number; col: number}) =>
            selectedKeys[
              (row * selectedDefinition.matrix.cols +
                col) as keyof typeof selectedKeys
            ],
        );
  const testDefinition = isTestMatrixEnabled
    ? selectedDefinition
    : fullKeyboardDefinition;
  const testKeys = isTestMatrixEnabled
    ? keyDefinitions
    : fullKeyboardDefinition.layouts.keys;
  return (
    <TestPane>
      <Grid1Col>
        <FlexCell ref={flexRef}>
          <TestKeyboard
            definition={testDefinition}
            keys={testKeys}
            pressedKeys={pressedKeys}
            matrixKeycodes={isTestMatrixEnabled ? [] : matrixKeycodes}
            containerDimensions={dimensions}
          />
        </FlexCell>
        <OverflowCell>
          <Container>
            <ControlRow>
              <Label>Reset Keyboard</Label>
              <Detail>
                <AccentButton onClick={onClickHandler}>Reset</AccentButton>
              </Detail>
            </ControlRow>
            {canUseMatrixState && selectedDefinition ? (
              <ControlRow>
                <Label>Test Matrix</Label>
                <Detail>
                  <AccentSlider
                    isChecked={isTestMatrixEnabled}
                    onChange={(val) => {
                      startTest = val;

                      dispatch(setTestMatrixEnabled(val));

                      if (val) {
                        setSelectedKeys({});
                        useMatrixTest();
                      } else {
                        setSelectedKeys({});
                      }
                    }}
                  />
                </Detail>
              </ControlRow>
            ) : null}
          </Container>
        </OverflowCell>
      </Grid1Col>
    </TestPane>
  );
};
