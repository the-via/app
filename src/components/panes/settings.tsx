import * as React from 'react';
import {bindActionCreators} from 'redux';
import {Pane} from './pane';
import styled from 'styled-components';
import {connect} from 'react-redux';
import {ControlRow, Label, Detail, OverflowCell} from './grid';
import {AccentSlider} from '../inputs/accent-slider';
import {RootState} from '../../redux';
import {actions as SettingsActions} from '../../redux/modules/settings';
import {ErrorMessage} from '../styled';

const RestartMessage = styled(ErrorMessage)`
  margin: 0;
  font-size: 20px;
`;

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

const version = require('../../../package.json').version;
type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;
function Settings(props: Props) {
  return (
    <DebugPane>
      <OverflowCell>
        <Container>
          <ControlRow>
            <Label>VIA Version</Label>
            <Detail>{version}</Detail>
          </ControlRow>
          <ControlRow>
            <Label>Show Design tab</Label>
            <Detail>
              <AccentSlider
                onChange={props.toggleCreatorMode}
                isChecked={props.showDesignTab}
              />
            </Detail>
          </ControlRow>
          <ControlRow>
            <Label>Fast Key Mapping</Label>
            <Detail>
              <AccentSlider
                onChange={props.toggleFastRemap}
                isChecked={!props.disableFastRemap}
              />
            </Detail>
          </ControlRow>
          <ControlRow>
            <Label>Hardware Acceleration</Label>
            <Detail>
              <AccentSlider
                onChange={() => {
                  props.toggleHardwareAcceleration();
                  props.setRequireRestart();
                }}
                isChecked={!props.disableHardwareAcceleration}
              />
            </Detail>
          </ControlRow>
          <ControlRow>
            <Label>Allow remapping via keyboard</Label>
            <Detail>
              <AccentSlider
                onChange={props.toggleKeyRemappingViaKeyboard}
                isChecked={props.allowKeyRemappingViaKeyboard}
              />
            </Detail>
          </ControlRow>
          {props.requireRestart && (
            <ControlRow>
              <RestartMessage>
                VIA requires a restart to finish applying your changes.
              </RestartMessage>
            </ControlRow>
          )}
        </Container>
      </OverflowCell>
    </DebugPane>
  );
}

function mapStateToProps(state: RootState) {
  return {
    allowKeyRemappingViaKeyboard: state.settings.allowKeyboardKeyRemapping,
    showDesignTab: state.settings.showDesignTab,
    disableFastRemap: state.settings.disableFastRemap,
    disableHardwareAcceleration: state.settings.disableHardwareAcceleration,
    requireRestart: state.settings.requireRestart
  };
}
const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      toggleKeyRemappingViaKeyboard:
        SettingsActions.toggleKeyRemappingViaKeyboard,
      toggleCreatorMode: SettingsActions.toggleCreatorMode,
      toggleFastRemap: SettingsActions.toggleFastRemap,
      toggleHardwareAcceleration: SettingsActions.toggleHardwareAcceleration,
      setRequireRestart: SettingsActions.requireRestart
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(Settings);
