import React, {useState} from 'react';
import {Pane} from './pane';
import styled from 'styled-components';
import {ControlRow, Label, Detail, OverflowCell} from './grid';
import {AccentSlider} from '../inputs/accent-slider';
import {useDispatch} from 'react-redux';
import {useAppSelector} from 'src/store/hooks';
import {
  getShowDesignTab,
  getDisableFastRemap,
  toggleCreatorMode,
  toggleFastRemap,
} from 'src/store/settingsSlice';
import {getSelectedConnectedDevice} from 'src/store/devicesSlice';
import {ErrorMessage} from '../styled';

const Container = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  padding: 0 12px;
`;

const DebugPane = styled(Pane)`
  display: grid;
  max-width: 100vw;
  grid-template-columns: 100vw;
`;

const DiagnosticContainer = styled(Container)`
  border-top: 1px solid var(--color_dark-grey);
  margin-top: 20px;
  padding-top: 20px;
`;

const SettingsErrorMessage = styled(ErrorMessage)`
  margin: 0;
  font-style: italic;
`;

export const Settings = () => {
  const dispatch = useDispatch();
  const showDesignTab = useAppSelector(getShowDesignTab);
  const disableFastRemap = useAppSelector(getDisableFastRemap);
  const selectedDevice = useAppSelector(getSelectedConnectedDevice);

  const [showDiagnostics, setShowDiagnostics] = useState(false);

  return (
    <DebugPane>
      <OverflowCell>
        <Container>
          <ControlRow>
            <Label>Show Design tab</Label>
            <Detail>
              <AccentSlider
                onChange={() => dispatch(toggleCreatorMode())}
                isChecked={showDesignTab}
              />
            </Detail>
          </ControlRow>
          <ControlRow>
            <Label>Fast Key Mapping</Label>
            <Detail>
              <AccentSlider
                onChange={() => dispatch(toggleFastRemap())}
                isChecked={!disableFastRemap}
              />
            </Detail>
          </ControlRow>
          <ControlRow>
            <Label>Show Diagnostic Information</Label>

            <Detail>
              {selectedDevice ? (
                <AccentSlider
                  onChange={() => setShowDiagnostics(!showDiagnostics)}
                  isChecked={showDiagnostics}
                />
              ) : (
                <SettingsErrorMessage>
                  Requires connected device
                </SettingsErrorMessage>
              )}
            </Detail>
          </ControlRow>
        </Container>
        {showDiagnostics && selectedDevice ? (
          <DiagnosticContainer>
            <ControlRow>
              <Label>VIA Firmware Protocol</Label>
              <Detail>{selectedDevice.protocol}</Detail>
            </ControlRow>
          </DiagnosticContainer>
        ) : null}
      </OverflowCell>
    </DebugPane>
  );
};
