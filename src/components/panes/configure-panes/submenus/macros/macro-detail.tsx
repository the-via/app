import React, {useCallback, useEffect, useState} from 'react';
import styled from 'styled-components';
import {MacroRecorder} from './macro-recorder';
import {useAppSelector} from 'src/store/hooks';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faClapperboard, faCode} from '@fortawesome/free-solid-svg-icons';
import {ScriptMode} from './script-mode';
import {ProgressBarTooltip} from 'src/components/inputs/tooltip';
import {getMacroBufferSize} from 'src/store/macrosSlice';
import {
  getSelectedConnectedDevice,
  getSelectedKeyboardAPI,
} from 'src/store/devicesSlice';
import {canUseDelays, getMacroAPI} from 'src/utils/macro-api';
import {ConnectedDevice} from 'src/types/types';

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
const MacroTab = styled.span<{$selected: boolean}>`
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
    props.$selected ? 'var(--color_accent)' : 'var(--bg_icon)'};
  cursor: pointer;
  &:hover {
    color: ${(props) =>
      props.$selected ? 'var(--color_accent)' : 'var(--bg_icon-highlighted)'};
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

type Props = {
  macroExpressions: string[];
  selectedMacro: number;
  saveMacros: (macro: string) => void;
  protocol: number;
};

const printBytesUsed = (bytesUsed: number, bufferSize: number) => {
  const units = ['Bytes', 'kB', 'MB', 'GB'];
  const scale = Math.floor(Math.log10(bufferSize) / 3);
  const suffix = units[scale];
  const denominator = scale === 0 ? 1 : Math.pow(1000, scale);
  const convertedBytesUsed = bytesUsed / denominator;
  const convertedBufferSize = bufferSize / denominator;

  return `${convertedBytesUsed.toFixed(scale)} / ${convertedBufferSize.toFixed(
    scale,
  )} ${suffix} space used`;
};

const BufferSizeUsage = () => {
  const ast = useAppSelector((state) => state.macros.ast);
  const bufferSize = useAppSelector(getMacroBufferSize);
  const connectedDevice = useAppSelector(getSelectedConnectedDevice);
  const api = useAppSelector(getSelectedKeyboardAPI);
  if (!connectedDevice || !api) {
    return null;
  }
  const {protocol} = connectedDevice;
  const macroApi = getMacroAPI(protocol, api);
  const bytesUsed = macroApi.rawKeycodeSequencesToMacroBytes(ast).length;
  return (
    <ProgressBarContainer>
      <ProgressBar>
        <span style={{transform: `scaleX(${bytesUsed / bufferSize})`}} />
      </ProgressBar>
      <ProgressBarTooltip>
        {printBytesUsed(bytesUsed, bufferSize)}
      </ProgressBarTooltip>
    </ProgressBarContainer>
  );
};

export const MacroDetailPane: React.VFC<Props> = (props) => {
  const currentMacro = props.macroExpressions[props.selectedMacro] || '';
  const [showAdvancedView, setShowAdvancedView] = React.useState(false);
  const ast = useAppSelector((state) => state.macros.ast);
  const {protocol} = useAppSelector(
    getSelectedConnectedDevice,
  ) as ConnectedDevice;
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
            $selected={!showAdvancedView}
            onClick={() => setShowAdvancedView(false)}
          >
            <FontAwesomeIcon icon={faClapperboard} />
          </MacroTab>
          <MacroTab
            $selected={showAdvancedView}
            onClick={() => setShowAdvancedView(true)}
          >
            <FontAwesomeIcon icon={faCode} />
          </MacroTab>
        </TabBar>
      </CenterTabContainer>
      <BufferSizeUsage />
      {showAdvancedView ? (
        <ScriptMode
          macro={currentMacro}
          macroIndex={props.selectedMacro}
          protocol={props.protocol}
          canUseDelays={canUseDelays(protocol)}
          setUnsavedMacro={setUnsavedMacro}
          saveMacros={props.saveMacros}
          key={props.selectedMacro}
        />
      ) : (
        <MacroRecorder
          selectedMacro={ast[props.selectedMacro]}
          setUnsavedMacro={setUnsavedMacro}
          undoMacro={undoChanges}
          saveMacro={saveMacro}
          canUseDelays={canUseDelays(protocol)}
        />
      )}
    </>
  );
};
