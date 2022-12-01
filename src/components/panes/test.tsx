import React, {useState, useEffect, useRef, FC} from 'react';
import fullKeyboardDefinition from '../../utils/test-keyboard-definition.json';
import {Pane} from './pane';
import styled from 'styled-components';
import {PROTOCOL_GAMMA} from '../../utils/keyboard-api';
import {TestKeyState} from '../test-keyboard';
import {
  ControlRow,
  Label,
  Detail,
  OverflowCell,
  FlexCell,
  Grid1Col,
  TestFlexCell,
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
import {useSize} from 'src/utils/use-size';
import {TestKeyboard} from '../three-keyboard/keyboard';
import {matrixKeycodes} from 'src/utils/key-event';
import {VIADefinitionV2, VIAKey} from '@the-via/reader';
import {useGlobalKeys} from 'src/utils/use-global-keys';
import {useMatrixTest} from 'src/utils/use-matrix-test';

const EMPTY_ARR: number[] = [];
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

export const Test: FC = () => {
  const dispatch = useDispatch();
  const selectedDevice = useAppSelector(getSelectedConnectedDevice);
  const selectedDefinition = useAppSelector(getSelectedDefinition);
  const keyDefinitions = useAppSelector(getSelectedKeyDefinitions);
  const isTestMatrixEnabled = useAppSelector(getIsTestMatrixEnabled);
  const flexRef = useRef(null);
  const dimensions = useSize(flexRef);

  const hasTestMatrixDevice =
    selectedDevice && selectedDefinition && keyDefinitions;
  const canUseMatrixState =
    hasTestMatrixDevice && PROTOCOL_GAMMA <= selectedDevice.protocol;

  const api = selectedDevice && selectedDevice.api;
  const [globalPressedKeys, setGlobalPressedKeys] = useGlobalKeys();
  const [matrixPressedKeys, setMatrixPressedKeys] = useMatrixTest(
    isTestMatrixEnabled,
    api as any,
    selectedDefinition as any,
  );

  // If pressed key is our target key then set to true

  const onClickHandler = () => {
    setMatrixPressedKeys({});
    setGlobalPressedKeys({});
  };

  //// Add event listeners
  //useEffect(() => {
  //window.addEventListener('keydown', downHandler);
  //window.addEventListener('keyup', upHandler);
  //// Remove event listeners on cleanup
  //return () => {
  //startTest = false;
  //window.removeEventListener('keydown', downHandler);
  //window.removeEventListener('keyup', upHandler);
  //dispatch(setTestMatrixEnabled(false));
  //};
  //}, []); // Empty array ensures that effect is only run on mount and unmount

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
    <TestPane>
      <Grid1Col>
        <TestFlexCell ref={flexRef}>
          <TestKeyboard
            definition={testDefinition as VIADefinitionV2}
            keys={testKeys as VIAKey[]}
            pressedKeys={
              isTestMatrixEnabled
                ? (pressedKeys as TestKeyState[])
                : (globalPressedKeys as TestKeyState[])
            }
            matrixKeycodes={isTestMatrixEnabled ? EMPTY_ARR : matrixKeycodes}
            containerDimensions={dimensions}
          />
        </TestFlexCell>
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
                      dispatch(setTestMatrixEnabled(val));

                      if (val) {
                        setMatrixPressedKeys({});
                        setGlobalPressedKeys({});
                      } else {
                        setGlobalPressedKeys({});
                        setMatrixPressedKeys({});
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
