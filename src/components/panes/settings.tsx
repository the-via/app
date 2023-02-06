import React, {useState} from 'react';
import {Pane} from './pane';
import styled from 'styled-components';
import {
  ControlRow,
  Label,
  Detail,
  OverflowCell,
  Grid,
  MenuCell,
  Row,
  IconContainer,
  SpanOverflowCell,
} from './grid';
import {AccentSlider} from '../inputs/accent-slider';
import {useDispatch} from 'react-redux';
import {useAppSelector} from 'src/store/hooks';
import {
  getShowDesignTab,
  getDisableFastRemap,
  toggleCreatorMode,
  toggleFastRemap,
  getThemeMode,
  toggleThemeMode,
  getThemeName,
  updateThemeName,
} from 'src/store/settingsSlice';
import {AccentSelect} from '../inputs/accent-select';
import {THEMES} from 'src/utils/themes';
import {MenuContainer} from './configure-panes/custom/menu-generator';
import {MenuTooltip} from '../inputs/tooltip';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faToolbox} from '@fortawesome/free-solid-svg-icons';
import {getSelectedConnectedDevice} from 'src/store/devicesSlice';
import {ErrorMessage} from '../styled';

const Container = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  padding: 0 12px;
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
  const themeMode = useAppSelector(getThemeMode);
  const themeName = useAppSelector(getThemeName);
  const selectedDevice = useAppSelector(getSelectedConnectedDevice);

  const [showDiagnostics, setShowDiagnostics] = useState(false);

  const selectOptions = Object.keys(THEMES).map((k) => ({
    label: k.replaceAll('_', ' '),
    value: k,
  }));
  const defaultValue = selectOptions.find((opt) => opt.value === themeName);

  return (
    <Pane>
      <Grid style={{overflow: 'hidden'}}>
        <MenuCell style={{pointerEvents: 'all', borderTop: 'none'}}>
          <MenuContainer>
            <Row selected={true}>
              <IconContainer>
                <FontAwesomeIcon icon={faToolbox} />
                <MenuTooltip>General</MenuTooltip>
              </IconContainer>
            </Row>
          </MenuContainer>
        </MenuCell>
        <SpanOverflowCell style={{flex: 1, borderWidth: 0}}>
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
              <Label>Light Mode</Label>
              <Detail>
                <AccentSlider
                  onChange={() => dispatch(toggleThemeMode())}
                  isChecked={themeMode === 'light'}
                />
              </Detail>
            </ControlRow>
            <ControlRow>
              <Label>Keycap Theme</Label>
              <Detail>
                <AccentSelect
                  defaultValue={defaultValue}
                  options={selectOptions}
                  onChange={(option: any) => {
                    option && dispatch(updateThemeName(option.value));
                  }}
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
        </SpanOverflowCell>
      </Grid>
    </Pane>
  );
};
