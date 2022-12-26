import React, {FC, useContext, useEffect} from 'react';
import fullKeyboardDefinition from '../../utils/test-keyboard-definition.json';
import {Pane} from './pane';
import styled from 'styled-components';
import {PROTOCOL_GAMMA} from '../../utils/keyboard-api';
import {ControlRow, Label, Detail, OverflowCell, Grid1Col} from './grid';
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

export const TestContext = React.createContext([
  {clearTestKeys: () => {}},
  (...a: any[]) => {},
] as const);

export const Test: FC = () => {
  const dispatch = useDispatch();
  const selectedDevice = useAppSelector(getSelectedConnectedDevice);
  const selectedDefinition = useAppSelector(getSelectedDefinition);
  const keyDefinitions = useAppSelector(getSelectedKeyDefinitions);
  const isTestMatrixEnabled = useAppSelector(getIsTestMatrixEnabled);
  const [testContextObj] = useContext(TestContext);

  const hasTestMatrixDevice =
    selectedDevice && selectedDefinition && keyDefinitions;
  const canUseMatrixState =
    hasTestMatrixDevice && PROTOCOL_GAMMA <= selectedDevice.protocol;

  const testDefinition = isTestMatrixEnabled
    ? selectedDefinition
    : fullKeyboardDefinition;

  if (!testDefinition || typeof testDefinition === 'string') {
    return null;
  }
  return (
    <TestPane>
      <Grid1Col>
        <OverflowCell>
          <Container>
            <ControlRow>
              <Label>Reset Keyboard</Label>
              <Detail>
                <AccentButton onClick={testContextObj.clearTestKeys}>
                  Reset
                </AccentButton>
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

                      testContextObj.clearTestKeys();
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
