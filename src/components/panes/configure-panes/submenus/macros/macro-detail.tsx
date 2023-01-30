import React, {useEffect, useState} from 'react';
import styled from 'styled-components';
import {ControlRow, Label, Detail} from '../../../grid';
import {AccentSlider} from '../../../../inputs/accent-slider';
import {MacroRecorder} from './macro-recorder';
import {useAppSelector} from 'src/store/hooks';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {
  faCancel,
  faCheck,
  faCode,
  faGear,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import {ScriptMode} from './script-mode';

const MacroTab = styled.span<{selected: boolean}>`
  display: inline-flex;
  border: 1px solid;
  line-height: initial;
  border-top: none;
  padding: 8px;
  border-bottom-left-radius: 6px;
  border-bottom-right-radius: 6px;
  min-width: 38px;
  justify-content: center;
  box-sizing: border-box;
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
`;

const TabContainer = styled.div`
  display: flex;
  margin-bottom: 10px;
  width: 100%;
  max-width: 960px;
`;
const CenterTabContainer = styled(TabContainer)`
  justify-content: center;
`;
const EndTabContainer = styled(TabContainer)`
  justify-content: flex-end;
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
  const [unsavedMacro, setUnsavedMacro] = useState(currentMacro);

  useEffect(() => {
    setUnsavedMacro(currentMacro);
  }, [currentMacro]);

  return (
    <>
      <CenterTabContainer>
        <TabBar>
          <MacroTab
            selected={!showSettings}
            onClick={() => setShowSettings(false)}
          >
            <FontAwesomeIcon icon={faCode} />
          </MacroTab>
          <MacroTab
            selected={showSettings}
            onClick={() => setShowSettings(true)}
          >
            <FontAwesomeIcon icon={faGear} />
          </MacroTab>
        </TabBar>
      </CenterTabContainer>
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
          setUnsavedMacro={setUnsavedMacro}
          saveMacros={props.saveMacros}
          key={props.selectedMacro}
        />
      ) : (
        <MacroRecorder
          selectedMacro={ast[props.selectedMacro]}
          showSettings={showSettings}
          setUnsavedMacro={setUnsavedMacro}
        />
      )}
      <EndTabContainer>
        <TabBar>
          {unsavedMacro !== currentMacro ? (
            <>
              <MacroTab selected={false} onClick={() => setShowSettings(false)}>
                <FontAwesomeIcon icon={faXmark} />
              </MacroTab>
              <MacroTab selected={false} onClick={() => setShowSettings(true)}>
                <FontAwesomeIcon icon={faCheck} />
              </MacroTab>
            </>
          ) : null}
        </TabBar>
      </EndTabContainer>
    </>
  );
};
