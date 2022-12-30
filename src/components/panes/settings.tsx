import React from 'react';
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
const Container = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  padding: 0 12px;
`;

export const Settings = () => {
  const dispatch = useDispatch();
  const showDesignTab = useAppSelector(getShowDesignTab);
  const disableFastRemap = useAppSelector(getDisableFastRemap);
  const themeMode = useAppSelector(getThemeMode);
  const themeName = useAppSelector(getThemeName);
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
          </Container>
        </SpanOverflowCell>
      </Grid>
    </Pane>
  );
};
