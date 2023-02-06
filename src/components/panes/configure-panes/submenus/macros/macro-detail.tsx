import React, {useCallback, useEffect, useState} from 'react';
import styled from 'styled-components';
import {ControlRow, Label, Detail} from '../../../grid';
import {AccentSlider} from '../../../../inputs/accent-slider';
import {MacroRecorder} from './macro-recorder';
import {useAppSelector} from 'src/store/hooks';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {
  faCheck,
  faCode,
  faGear,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import {ScriptMode} from './script-mode';
import {ProgressBarTooltip} from 'src/components/inputs/tooltip';
import {getMacroBufferSize} from 'src/store/macrosSlice';
import {getSelectedConnectedDevice} from 'src/store/devicesSlice';
import {getMacroAPI} from 'src/utils/macro-api';

const ProgressBarContainer = styled.div`
  position: relative;
  margin-top: 10px;
  &:hover {
    & .tooltip {
      transform: scale(1) translateY(0px);
      opacity: 1;
    }
  }
  .tooltip {
    transform: translateY(5px) scale(0.6);
    opacity: 0;
  }
`;
const ProgressBar = styled.div`
  background: var(--bg_control);
  position: relative;
  padding: 5px;
  border-radius: 5px;
  overflow: hidden;
  margin-bottom: 10px;
  cursor: pointer;
  width: 250px;

  > span {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    background: var(--color_accent);
    height: 10px;
    width: 100%;
    transform: scaleX(0.1);
    transform-origin: left;
    transition: transform 0.4s ease-in-out;
  }
`;
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

const BufferSizeUsage = () => {
  const ast = useAppSelector((state) => state.macros.ast);
  const bufferSize = useAppSelector(getMacroBufferSize);
  const connectedDevice = useAppSelector(getSelectedConnectedDevice);
  if (!connectedDevice) {
    return null;
  }
  const {protocol, api} = connectedDevice;
  const macroApi = getMacroAPI(protocol, api);
  const bytesUsed = macroApi.rawKeycodeSequencesToMacroBytes(ast).length;
  return (
    <ProgressBarContainer>
      <ProgressBar>
        <span style={{transform: `scaleX(${bytesUsed / bufferSize})`}} />
      </ProgressBar>
      <ProgressBarTooltip>
        {100 - Math.round((100 * bytesUsed) / bufferSize)}% memory remaining
      </ProgressBarTooltip>
    </ProgressBarContainer>
  );
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

  const undoChanges = useCallback(() => {
    setUnsavedMacro(currentMacro);
  }, [currentMacro]);

  const saveMacro = useCallback(
    (macro?: string) => {
      if (macro !== undefined) {
        props.saveMacros('');
        setUnsavedMacro('');
      } else if (unsavedMacro !== currentMacro) {
        props.saveMacros(unsavedMacro);
        setUnsavedMacro(unsavedMacro);
      }
    },
    [unsavedMacro],
  );

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
      <BufferSizeUsage />
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
          undoMacro={undoChanges}
          saveMacro={saveMacro}
        />
      )}
    </>
  );
};
