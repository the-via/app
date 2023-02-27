import React, {FC, useContext} from 'react';
import fullKeyboardDefinition from '../../utils/test-keyboard-definition.json';
import {Pane} from './pane';
import styled from 'styled-components';
import {PROTOCOL_GAMMA} from '../../utils/keyboard-api';
import {
  ControlRow,
  Label,
  Detail,
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
  getTestKeyboardSoundsSettings,
  setTestKeyboardSoundsSettings,
} from 'src/store/settingsSlice';
import {MenuContainer} from './configure-panes/custom/menu-generator';
import {MenuTooltip} from '../inputs/tooltip';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faCircleQuestion} from '@fortawesome/free-solid-svg-icons';
import {useProgress} from '@react-three/drei';
import {AccentSelect} from '../inputs/accent-select';
import {AccentRange} from '../inputs/accent-range';
import {TestKeyboardSoundsMode} from '../void/test-keyboard-sounds';

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
  const testKeyboardSoundsSettings = useAppSelector(
    getTestKeyboardSoundsSettings,
  );

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

  const waveformOptions = [
    {
      label: 'Sine',
      value: 'sine',
    },
    {
      label: 'Triangle',
      value: 'triangle',
    },
    {
      label: 'Sawtooth',
      value: 'sawtooth',
    },
    {
      label: 'Square',
      value: 'square',
    },
  ];
  const waveformDefaultValue = waveformOptions.find(
    (opt) => opt.value === testKeyboardSoundsSettings.waveform,
  );

  const modeOptions = [
    {
      label: 'Random',
      value: TestKeyboardSoundsMode.Random,
    },
    {
      label: 'Wicki-Hayden',
      value: TestKeyboardSoundsMode.WickiHayden,
    },
    {
      label: 'Chromatic',
      value: TestKeyboardSoundsMode.Chromatic,
    },
  ];
  const modeDefaultValue = modeOptions.find(
    (opt) => opt.value === testKeyboardSoundsSettings.mode,
  );

  return progress !== 100 ? null : (
    <TestPane>
      <Grid>
        <MenuCell style={{pointerEvents: 'all'}}>
          <MenuContainer>
            <Row $selected={true}>
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
            <ControlRow>
              <Label>Key Sounds</Label>
              <Detail>
                <AccentSlider
                  isChecked={testKeyboardSoundsSettings.isEnabled}
                  onChange={(val) => {
                    dispatch(
                      setTestKeyboardSoundsSettings({
                        isEnabled: val,
                      }),
                    );
                  }}
                />
              </Detail>
            </ControlRow>
            <ControlRow>
              <Label>Volume</Label>
              <Detail>
                <AccentRange
                  max={100}
                  min={0}
                  defaultValue={testKeyboardSoundsSettings.volume}
                  onChange={(value: number) => {
                    dispatch(
                      setTestKeyboardSoundsSettings({
                        volume: value,
                      }),
                    );
                  }}
                />
              </Detail>
            </ControlRow>
            <ControlRow>
              <Label>Transpose</Label>
              <Detail>
                <AccentRange
                  max={24}
                  min={-24}
                  defaultValue={testKeyboardSoundsSettings.transpose}
                  onChange={(value: number) => {
                    dispatch(
                      setTestKeyboardSoundsSettings({
                        transpose: value,
                      }),
                    );
                  }}
                />
              </Detail>
            </ControlRow>
            <ControlRow>
              <Label>Waveform</Label>
              <Detail>
                <AccentSelect
                  isSearchable={false}
                  defaultValue={waveformDefaultValue}
                  options={waveformOptions}
                  onChange={(option: any) => {
                    option &&
                      dispatch(
                        setTestKeyboardSoundsSettings({
                          waveform: option.value,
                        }),
                      );
                  }}
                />
              </Detail>
            </ControlRow>
            <ControlRow>
              <Label>Mode</Label>
              <Detail>
                <AccentSelect
                  isSearchable={false}
                  defaultValue={modeDefaultValue}
                  options={modeOptions}
                  onChange={(option: any) => {
                    option &&
                      dispatch(
                        setTestKeyboardSoundsSettings({
                          mode: option.value,
                        }),
                      );
                  }}
                />
              </Detail>
            </ControlRow>
          </Container>
        </SpanOverflowCell>
      </Grid>
    </TestPane>
  );
};
