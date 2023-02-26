import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  OptimizedKeycodeSequence,
  OptimizedKeycodeSequenceItem,
  RawKeycodeSequence,
  RawKeycodeSequenceAction,
} from 'src/utils/macro-api/types';
import {useKeycodeRecorder} from 'src/utils/use-keycode-recorder';
import styled from 'styled-components';
import {
  convertCharacterTaps,
  foldKeydownKeyupKeys,
  convertToCharacterStreams,
  mergeConsecutiveWaits,
  rawOptRaw,
  sequenceToExpression,
  trimLastWait,
} from 'src/utils/macro-api/macro-api.common';
import {getKeycodes, IKeycode} from 'src/utils/key';
import {
  getSequenceItemComponent,
  getSequenceLabel,
  SequenceLabelSeparator,
  WaitInput,
} from './keycode-sequence-components';
import {MacroEditControls} from './macro-controls';
import {Deletable} from './deletable';
import {pipeline} from 'src/utils/pipeline';
import {useAppSelector} from 'src/store/hooks';
import {
  getMacroEditorSettings,
  setMacroEditorSettings,
} from 'src/store/settingsSlice';
import {useDispatch} from 'react-redux';

declare global {
  interface Navigator {
    keyboard: {
      unlock(): Promise<void>;
      lock(): Promise<void>;
    };
  }
}

const NoMacroRecorded = styled.div`
  font-style: italic;
  color: var(--color_label-highlighted);
`;

const MacroSequenceContainer = styled.div<{$isModified: boolean}>`
  max-width: 960px;
  width: 100%;
  display: block;
  border: 1px solid var(--border_color_cell);
  border-style: ${(props) => (props.$isModified ? 'dashed' : 'solid')};
  padding: 30px 20px;
  border-radius: 15px;
  margin-top: 10px;
  box-sizing: border-box;
}
`;

type SmartTransformAcc = [
  [OptimizedKeycodeSequenceItem, number][],
  [OptimizedKeycodeSequenceItem, number],
  number,
];

// TODO: make this handle {+LC_CTL}abc{-LC_CTL}
// TODO: make this handle abc{KC_ENT}def{KC_ENT}
const smartTransform = (
  [acc, , currHeld]: SmartTransformAcc,
  [curr, id]: [OptimizedKeycodeSequenceItem, number],
): SmartTransformAcc => {
  const [action, actionArg] = curr;
  if (action === RawKeycodeSequenceAction.Delay && currHeld === 0) {
    acc.push([curr, id]);
  } else if (
    (action === RawKeycodeSequenceAction.Down ||
      action === RawKeycodeSequenceAction.Tap) &&
    currHeld === 0
  ) {
    acc.push([[RawKeycodeSequenceAction.Tap, actionArg as string], id]);
    currHeld = currHeld + 1;
  } else if (
    action === RawKeycodeSequenceAction.Tap &&
    String(actionArg).length === 1 // this is meant to concatenate letters
  ) {
    acc[acc.length - 1][0][1] = `${acc[acc.length - 1][0][1]}${actionArg}`;
  } else if (action === RawKeycodeSequenceAction.Tap) {
    acc[acc.length - 1][0][1] = [acc[acc.length - 1][0][1] as string[]]
      .flat()
      .concat(actionArg as string);
  } else if (action === RawKeycodeSequenceAction.Down) {
    acc[acc.length - 1][0][1] = [acc[acc.length - 1][0][1] as string[]]
      .flat()
      .concat(actionArg as string);
    currHeld = currHeld + 1;
  } else if (action === RawKeycodeSequenceAction.Up) {
    currHeld = currHeld - 1;
  } else if (action === RawKeycodeSequenceAction.CharacterStream) {
    acc.push([curr, id]);
  }
  return [acc, [curr, id], currHeld] as SmartTransformAcc;
};

const componentJoin = (arr: (JSX.Element | null)[], separator: JSX.Element) => {
  return arr.reduce((acc, next, idx) => {
    if (idx) {
      acc.push({...separator, key: idx});
    }
    acc.push(next);
    return acc;
  }, [] as (JSX.Element | null)[]);
};

const KeycodeMap = getKeycodes()
  .flatMap((menu) => menu.keycodes)
  .reduce((p, n) => ({...p, [n.code]: n}), {} as Record<string, IKeycode>);

const optimizeKeycodeSequence = (sequence: RawKeycodeSequence) => {
  return pipeline(
    sequence,
    convertCharacterTaps,
    trimLastWait,
    mergeConsecutiveWaits,
    foldKeydownKeyupKeys,
    convertToCharacterStreams,
  );
};
const cleanKeycodeSequence = (sequence: RawKeycodeSequence) => {
  return pipeline(sequence, mergeConsecutiveWaits);
};

export const MacroRecorder: React.FC<{
  selectedMacro?: OptimizedKeycodeSequence;
  undoMacro(): void;
  saveMacro(macro?: string): void;
  setUnsavedMacro: (a: any) => void;
}> = ({selectedMacro, setUnsavedMacro, saveMacro, undoMacro}) => {
  const [showOriginalMacro, setShowOriginalMacro] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [useRecordingSettings, setUseRecordingSettings] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(
    !!document.fullscreenElement,
  );
  const {smartOptimizeEnabled, recordDelaysEnabled} = useAppSelector(
    getMacroEditorSettings,
  );
  const dispatch = useDispatch();
  const [keycodeSequence, setKeycodeSequence] = useKeycodeRecorder(
    isRecording,
    recordDelaysEnabled,
  );
  const macroSequenceRef = useRef<HTMLDivElement>(null);
  const recordingToggleChange = useCallback(
    async (isRecording: boolean) => {
      setIsRecording(isRecording);
      if (isRecording) {
        await navigator.keyboard.lock();
        setKeycodeSequence([]);
        setShowOriginalMacro(false);
        setUseRecordingSettings(true);
      } else {
        navigator.keyboard.unlock();
        if (smartOptimizeEnabled) {
          setKeycodeSequence(optimizeKeycodeSequence(keycodeSequence));
        } else {
        }
        setUseRecordingSettings(false);
      }
    },
    [keycodeSequence, setIsRecording],
  );
  const deleteMacro = useCallback(() => {
    saveMacro('');
    setShowOriginalMacro(true);
    setUseRecordingSettings(false);
  }, [setKeycodeSequence, saveMacro]);

  const undoChanges = useCallback(() => {
    undoMacro();
    setKeycodeSequence([]);
    setShowOriginalMacro(true);
    setUseRecordingSettings(false);
  }, [undoMacro]);

  // When we switch to another macro, reset
  useEffect(() => {
    setShowOriginalMacro(true);
    setUseRecordingSettings(false);
    setKeycodeSequence([]);
  }, [selectedMacro]);

  const getSliceableSequence = () => {
    let sliceableSequence = showOriginalMacro
      ? ((selectedMacro ?? []) as RawKeycodeSequence)
      : keycodeSequence;
    return [...sliceableSequence];
  };

  const displayedSequence = useMemo(() => {
    let partialSequence;
    let sliceSequence = getSliceableSequence();
    if (
      !(showOriginalMacro || !useRecordingSettings || !smartOptimizeEnabled)
    ) {
      partialSequence = optimizeKeycodeSequence(sliceSequence);
    } else {
      partialSequence = sliceSequence;
    }
    return partialSequence;
  }, [
    keycodeSequence,
    showOriginalMacro,
    smartOptimizeEnabled,
    useRecordingSettings,
    selectedMacro,
  ]);

  useEffect(() => {
    if (displayedSequence) {
      setUnsavedMacro(sequenceToExpression(displayedSequence));
    }
  }, [displayedSequence]);

  const switchToEditMode = useCallback(() => {
    if (showOriginalMacro) {
      setShowOriginalMacro(false);
    }
  }, [showOriginalMacro]);

  const deleteSequenceItem = useCallback(
    (id: number) => {
      const newSequence = getSliceableSequence();
      newSequence.splice(id, 1);
      setKeycodeSequence(cleanKeycodeSequence(newSequence));
      switchToEditMode();
    },
    [displayedSequence, selectedMacro, keycodeSequence, showOriginalMacro],
  );

  const editSequenceItem = useCallback(
    (id: number, val: number) => {
      const newSequence = getSliceableSequence();
      newSequence.splice(id, 1, [RawKeycodeSequenceAction.Delay, val]);
      setKeycodeSequence(cleanKeycodeSequence(newSequence));
      switchToEditMode();
    },
    [displayedSequence, selectedMacro, keycodeSequence, showOriginalMacro],
  );

  const sequence = useMemo(() => {
    return componentJoin(
      displayedSequence.map(([action, actionArg], id) => {
        const Label = getSequenceItemComponent(action);
        return (
          <Deletable
            key={`${id}-${action}`}
            index={id}
            deleteItem={deleteSequenceItem}
          >
            {RawKeycodeSequenceAction.Delay !== action ? (
              <Label>
                {action === RawKeycodeSequenceAction.CharacterStream
                  ? componentJoin(
                      String(actionArg)
                        .split(' ')
                        .map((a) => <span>{a}</span>),
                      <span
                        style={{
                          fontFamily: 'fantasy, cursive, monospace',
                        }}
                      >
                        ␣
                      </span>,
                    )
                  : Array.isArray(actionArg)
                  ? actionArg
                      .map((k) => getSequenceLabel(KeycodeMap[k]) ?? k)
                      .join(' + ')
                  : getSequenceLabel(KeycodeMap[actionArg])}
              </Label>
            ) : (
              <WaitInput
                index={id}
                value={Number(actionArg)}
                updateValue={editSequenceItem}
              />
            )}
          </Deletable>
        );
      }),
      <SequenceLabelSeparator />,
    );
  }, [displayedSequence]);

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

  return (
    <>
      <MacroSequenceContainer
        ref={macroSequenceRef}
        $isModified={!showOriginalMacro}
      >
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
          transform: 'translate(-0px, -21px)',
        }}
      >
        <MacroEditControls
          isFullscreen={isFullscreen}
          isEmpty={!selectedMacro || !selectedMacro.length}
          optimizeRecording={smartOptimizeEnabled}
          recordDelays={recordDelaysEnabled}
          isRecording={isRecording}
          addText={() => {}}
          deleteMacro={deleteMacro}
          toggleOptimizeRecording={() => {
            dispatch(
              setMacroEditorSettings({
                smartOptimizeEnabled: !smartOptimizeEnabled,
              }),
            );
          }}
          toggleRecordDelays={() => {
            dispatch(
              setMacroEditorSettings({
                recordDelaysEnabled: !recordDelaysEnabled,
              }),
            );
          }}
          toggleFullscreen={toggleFullscreen}
          undoChanges={undoChanges}
          saveChanges={() => saveMacro()}
          hasUnsavedChanges={!showOriginalMacro}
          recordingToggleChange={recordingToggleChange}
        />
      </div>
    </>
  );
};
