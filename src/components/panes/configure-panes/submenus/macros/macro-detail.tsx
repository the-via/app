import React from 'react';
import styled from 'styled-components';
import {ControlRow, Label, Detail} from '../../../grid';
import {AccentSlider} from '../../../../inputs/accent-slider';
import {MacroRecorder} from './macro-recorder';
import {useAppSelector} from 'src/store/hooks';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faCode, faGear} from '@fortawesome/free-solid-svg-icons';
import {ScriptMode} from './script-mode';

const MacroTab = styled.span<{selected: boolean}>`
  display: inline-flex;
  border: 1px solid;
  line-height: initial;
  border-top: none;
  padding: 8px;
  border-bottom-left-radius: 6px;
  border-bottom-right-radius: 6px;
  color: ${(props) =>
    props.selected ? 'var(--color_accent)' : 'var(--bg_icon)'};
  cursor: pointer;
  &:hover {
    color: ${(props) =>
      props.selected ? 'var(--color_accent)' : 'var(--bg_icon-highlighted)'};
  }
`;

const TabBar = styled.div`
  display: flex;
  column-gap: 10px;
  margin-bottom: 10px;
`;

type Props = {
  macroExpressions: string[];
  selectedMacro: number;
  saveMacros: (macro: string) => void;
  protocol: number;
};

export const MacroDetailPane: React.VFC<Props> = (props) => {
  const currentMacro = props.macroExpressions[props.selectedMacro] || '';
  const [showSettings, setShowSettings] = React.useState(false);
  const [showAdvancedView, setShowAdvancedView] = React.useState(false);
  const ast = useAppSelector((state) => state.macros.ast);

  return (
    <>
      <TabBar>
        <MacroTab
          selected={!showSettings}
          onClick={() => setShowSettings(false)}
        >
          <FontAwesomeIcon icon={faCode} />
        </MacroTab>
        <MacroTab selected={showSettings} onClick={() => setShowSettings(true)}>
          <FontAwesomeIcon icon={faGear} />
        </MacroTab>
      </TabBar>
      {showSettings ? (
        <ControlRow>
          <Label>Script Mode</Label>
          <Detail>
            <AccentSlider
              isChecked={showAdvancedView}
              onChange={setShowAdvancedView}
            />
          </Detail>
        </ControlRow>
      ) : null}
      {showAdvancedView ? (
        <ScriptMode
          macro={currentMacro}
          macroIndex={props.selectedMacro}
          showSettings={showSettings}
          protocol={props.protocol}
          saveMacros={props.saveMacros}
          key={props.selectedMacro}
        />
      ) : (
        <MacroRecorder
          selectedMacro={ast[props.selectedMacro]}
          showSettings={showSettings}
        />
      )}
    </>
  );
};
