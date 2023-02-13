import React, {FC, useContext, useEffect} from 'react';
import fullKeyboardDefinition from '../../utils/test-keyboard-definition.json';
import {Pane} from './pane';
import styled from 'styled-components';
import {PROTOCOL_GAMMA} from '../../utils/keyboard-api';
import {
  ControlRow,
  Label,
  Detail,
  OverflowCell,
  Grid1Col,
  MenuCell,
  Row,
  IconContainer,
  Grid,
  SpanOverflowCell,
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
import {MenuContainer} from './configure-panes/custom/menu-generator';
import Icon from './configure-panes/custom/icon';
import {MenuTooltip} from '../inputs/tooltip';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {
  faCircleQuestion,
  faSquare,
  faSquareCheck,
} from '@fortawesome/free-solid-svg-icons';
import {useProgress} from '@react-three/drei';

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
  const {progress} = useProgress();

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
  return progress !== 100 ? null : (
    <TestPane>
      <Grid>
        <MenuCell style={{pointerEvents: 'all'}}>
          <MenuContainer>
            <Row selected={true}>
              <IconContainer>
                <FontAwesomeIcon icon={faCircleQuestion} />
                <MenuTooltip>Check Key</MenuTooltip>
              </IconContainer>
            </Row>
          </MenuContainer>
        </MenuCell>
        <SpanOverflowCell>
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
        </SpanOverflowCell>
      </Grid>
    </TestPane>
  );
};
