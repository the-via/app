import {faPlus} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import React, {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {AccentSlider} from 'src/components/inputs/accent-slider';
import {ControlRow, Detail, Label} from 'src/components/panes/grid';
import {
  OptimizedKeycodeSequence,
  OptimizedKeycodeSequenceItem,
  RawKeycodeSequence,
  RawKeycodeSequenceAction,
} from 'src/utils/macro-api/types';
import {useKeycodeRecorder} from 'src/utils/use-keycode-recorder';
import styled from 'styled-components';
import {
  rawSequenceToOptimizedSequence,
  sequenceToExpression,
} from 'src/utils/macro-api/macro-api.common';
import {getKeycodes, IKeycode} from 'src/utils/key';
import {
  getSequenceItemComponent,
  KeycodeDownLabel,
  KeycodePressLabel,
  KeycodeSequenceWait,
  KeycodeUpLabel,
  NumberInput,
  SequenceLabelSeparator,
  WaitInput,
} from './keycode-sequence-components';
import {
  IconButtonContainer,
  MacroEditControls,
  MacroEditControlsContainer,
} from './macro-controls';
import {Deletable} from './deletable';
import {tagWithID, unwrapTagWithID} from './tagging';

function capitalize(string: string) {
  return string[0].toUpperCase() + string.slice(1);
}

const NoMacroRecorded = styled.div`
  margin: 10px 0px;
  font-style: italic;
  color: var(--color_label-highlighted);
`;

const MacroSequenceContainer = styled.div`
  max-width: 960px;
  width: 100%;
  display: block;
  border: 1px solid var(--border_color_cell);
  padding: 10px 20px;
  border-radius: 15px;
  margin-top: 10px;
  box-sizing: border-box;
}
`;

declare global {
  interface Navigator {
    keyboard: {
      unlock(): Promise<void>;
      lock(): Promise<void>;
    };
  }
}

const smartTransform = (
  [acc, prev, currHeld]: [
    OptimizedKeycodeSequence,
    OptimizedKeycodeSequenceItem,
    number,
  ],
  curr: OptimizedKeycodeSequenceItem,
  index: number,
) => {
  const [action, actionArg] = curr;
  if (action === RawKeycodeSequenceAction.Delay && currHeld === 0) {
    acc.push(curr);
  } else if (
    (action === RawKeycodeSequenceAction.Down ||
      action === RawKeycodeSequenceAction.Tap) &&
    currHeld === 0
  ) {
    acc.push([RawKeycodeSequenceAction.Tap, actionArg as string]);
    currHeld = currHeld + 1;
  } else if (
    action === RawKeycodeSequenceAction.Tap &&
    String(actionArg).length === 1
  ) {
    acc[acc.length - 1][1] = `${acc[acc.length - 1][1]}${actionArg}`;
  } else if (action === RawKeycodeSequenceAction.Tap) {
    acc[acc.length - 1][1] = [acc[acc.length - 1][1] as string[]]
      .flat()
      .concat(actionArg as string);
  } else if (action === RawKeycodeSequenceAction.Down) {
    acc[acc.length - 1][1] = [acc[acc.length - 1][1] as string[]]
      .flat()
      .concat(actionArg as string);
    currHeld = currHeld + 1;
  } else if (action === RawKeycodeSequenceAction.Up) {
    currHeld = currHeld - 1;
  } else if (action === RawKeycodeSequenceAction.CharacterStream) {
    acc.push(curr);
  }
  return [acc, curr, currHeld] as [
    OptimizedKeycodeSequence,
    OptimizedKeycodeSequenceItem,
    number,
  ];
};

const componentJoin = (arr: (JSX.Element | null)[], separator: JSX.Element) => {
  return arr.reduce((acc, next, idx) => {
    if (idx) {
      acc.push(separator);
    }
    acc.push(next);
    return acc;
  }, [] as (JSX.Element | null)[]);
};

const PlusIcon = () => (
  <FontAwesomeIcon
    style={{marginLeft: 10, marginRight: 10}}
    icon={faPlus}
    color={'var(--color_accent)'}
  />
);
const getSequenceLabel = (keycode: IKeycode) => {
  const label = keycode?.keys ?? keycode?.shortName ?? keycode?.name ?? '';
  return label.length > 1 ? capitalize(label) : label;
};

const KeycodeMap = getKeycodes()
  .flatMap((menu) => menu.keycodes)
  .reduce((p, n) => ({...p, [n.code]: n}), {} as Record<string, IKeycode>);

export const MacroRecorder: React.FC<{
  selectedMacro?: OptimizedKeycodeSequence;
  showSettings: boolean;
  undoMacro(): void;
  saveMacro(macro?: string): void;
  setUnsavedMacro: (a: any) => void;
}> = ({selectedMacro, showSettings, setUnsavedMacro, saveMacro, undoMacro}) => {
  const [showVerboseKeyState, setShowVerboseKeyState] = useState(false);
  const [recordWaitTimes, setRecordWaitTimes] = useState(false);
  const [showOriginalMacro, setShowOriginalMacro] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(
    !!document.fullscreenElement,
  );
  const [keycodeSequence, setKeycodeSequence] = useKeycodeRecorder(isRecording);
  const macroSequenceRef = useRef<HTMLDivElement>(null);
  const recordingToggleChange = useCallback(
    async (isRecording: boolean) => {
      setIsRecording(isRecording);
      if (isRecording) {
        await navigator.keyboard.lock();
        setKeycodeSequence([]);
        setShowOriginalMacro(false);
      } else {
        navigator.keyboard.unlock();
      }
    },
    [setIsRecording],
  );
  const deleteMacro = useCallback(() => {
    saveMacro('');
    setShowOriginalMacro(true);
  }, [setKeycodeSequence, saveMacro]);

  // When we switch to another macro, reset
  useEffect(() => {
    setShowOriginalMacro(true);
    setKeycodeSequence([]);
  }, [selectedMacro]);

  const showWaitTimes = recordWaitTimes || showOriginalMacro;
  const displayedSequence = useMemo(() => {
    const currSequence = !showOriginalMacro
      ? keycodeSequence
      : selectedMacro ?? [];
    return (
      showOriginalMacro
        ? [rawSequenceToOptimizedSequence(currSequence as RawKeycodeSequence)]
        : showVerboseKeyState
        ? [currSequence]
        : currSequence.reduce(smartTransform, [
            [],
            [RawKeycodeSequenceAction.Delay, 0],
            0,
          ] as [OptimizedKeycodeSequence, OptimizedKeycodeSequenceItem, number])
    )[0]
      .map(tagWithID)
      .filter(
        ([[action]]) =>
          showOriginalMacro ||
          showWaitTimes ||
          action !== RawKeycodeSequenceAction.Delay,
      );
  }, [
    keycodeSequence,
    showOriginalMacro,
    showVerboseKeyState,
    showWaitTimes,
    selectedMacro,
  ]);
  useEffect(() => {
    if (displayedSequence) {
      setUnsavedMacro(
        sequenceToExpression(displayedSequence.map(unwrapTagWithID)),
      );
    }
  }, [displayedSequence]);

  const sequence = useMemo(() => {
    return componentJoin(
      displayedSequence.map(([[action, actionArg], id]) => {
        const Label = getSequenceItemComponent(action);
        return !showWaitTimes &&
          action === RawKeycodeSequenceAction.Delay ? null : (
          <>
            {RawKeycodeSequenceAction.Delay !== action ? (
              <Deletable
                index={id}
                deleteItem={(idx) => console.log('trying to delete:', idx)}
              >
                <Label>
                  {action === RawKeycodeSequenceAction.CharacterStream
                    ? actionArg
                    : Array.isArray(actionArg)
                    ? actionArg
                        .map((k) => getSequenceLabel(KeycodeMap[k]) ?? k)
                        .join(' + ')
                    : getSequenceLabel(KeycodeMap[actionArg])}
                </Label>
              </Deletable>
            ) : showWaitTimes ? (
              <>
                <Deletable
                  index={id}
                  deleteItem={(idx) => console.log('trying to delete:', idx)}
                >
                  <WaitInput value={Number(actionArg)} setInput={() => null} />
                </Deletable>
              </>
            ) : null}
          </>
        );
      }),
      <SequenceLabelSeparator />,
    );
  }, [displayedSequence, showWaitTimes]);

  useEffect(() => {
    const onFullScreenChanged: EventListener = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.documentElement.addEventListener(
      'fullscreenchange',
      onFullScreenChanged,
    );
    return () => {
      recordingToggleChange(false);
      document.documentElement.removeEventListener(
        'fullscreenchange',
        onFullScreenChanged,
      );
    };
  }, [setIsFullscreen]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else if (document.exitFullscreen) {
      recordingToggleChange(false);
      document.exitFullscreen();
    }
  }, [recordingToggleChange]);
  return !showSettings ? (
    <>
      <MacroSequenceContainer ref={macroSequenceRef}>
        {sequence.length ? (
          sequence
        ) : (
          <NoMacroRecorded>No macro recorded yet...</NoMacroRecorded>
        )}
      </MacroSequenceContainer>
      <div
        style={{
          border: 'none',
          maxWidth: 960,
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          transform: 'translate(-0px, -5px)',
        }}
      >
        <MacroEditControls
          isFullscreen={isFullscreen}
          isEmpty={!selectedMacro || !selectedMacro.length}
          isRecording={isRecording}
          addText={() => {}}
          deleteMacro={deleteMacro}
          toggleFullscreen={toggleFullscreen}
          revertChanges={() => {
            undoMacro();
            setKeycodeSequence([]);
            setShowOriginalMacro(true);
          }}
          saveChanges={() => saveMacro()}
          hasUnsavedChanges={!!keycodeSequence.length}
          recordingToggleChange={recordingToggleChange}
        />
      </div>
    </>
  ) : (
    <>
      <ControlRow>
        <Label>Include separate keyup/keydown actions</Label>
        <Detail>
          <AccentSlider
            isChecked={showVerboseKeyState}
            onChange={setShowVerboseKeyState}
          />
        </Detail>
      </ControlRow>
      <ControlRow>
        <Label>Include delays (ms)</Label>
        <Detail>
          <AccentSlider
            isChecked={recordWaitTimes}
            onChange={setRecordWaitTimes}
          />
        </Detail>
      </ControlRow>
    </>
  );
};
