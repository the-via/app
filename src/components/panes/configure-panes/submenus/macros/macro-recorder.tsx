import {
  faCircle,
  faCompress,
  faExpand,
  faPenToSquare,
  faPlus,
  faSave,
  faSquare,
  faTrash,
  faUndo,
  faXmarkCircle,
} from '@fortawesome/free-solid-svg-icons';
import TextareaAutosize from 'react-textarea-autosize';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import React, {
  ChangeEvent,
  PropsWithChildren,
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
import {IconButtonTooltip} from 'src/components/inputs/tooltip';
import {getKeycodes, IKeycode} from 'src/utils/key';

function capitalize(string: string) {
  return string[0].toUpperCase() + string.slice(1);
}

const IconButton = styled.button`
  appearance: none;
  width: 40px;
  position: relative;
  display: inline-block;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 10px 10px;
  line-height: initial;
  font-size: initial;
  color: ${(props) =>
    props.disabled ? 'var(--bg_control)' : 'var(--color_accent)'};
  border-color: ${(props) =>
    props.disabled ? 'var(--bg_control)' : 'var(--color_accent)'};
  &:disabled {
    cursor: not-allowed;
    border-right: 1px solid var(--border_color_icon);
    cursor: not-allowed;
    background: var(--bg_menu);
  }
  &:hover {
    color: ${(props) =>
      props.disabled ? 'var(--bg_control)' : 'var(--color_inside-accent)'};
    border-color: ${(props) =>
      props.disabled ? 'var(--bg_control)' : 'var(--color_accent)'};
    border-right: 1px solid var(--border_color_icon);
    background-color: ${(props) =>
      props.disabled ? 'var(--bg_menu)' : 'var(--color_accent)'};
  }

  svg {
    color: ${(props) =>
      props.disabled ? 'var(--bg_control)' : 'var(--color_accent)'};
  }
  &:hover {
    svg {
      color: ${(props) =>
        props.disabled ? 'var(--bg_control)' : 'var(--color_inside-accent)'};
    }

    color: var(--color_label-highlighted);
    & .tooltip {
      transform: scale(1) translateX(0px);
      opacity: 1;
    }
  }
  .tooltip {
    transform: translateX(-5px) scale(0.6);
    opacity: 0;
  }
`;

const NoMacroRecorded = styled.div`
  margin: 10px 0px;
  font-style: italic;
  color: var(--color_label-highlighted);
`;
const KeycodeSequenceWaitNumber = styled.span`
  display: inline-flex;
  border: 2px solid transparent;
  padding: 5px 2px;
  font-weight: initial;
  border-bottom: 1px solid;
`;
const KeycodeSequenceWait = styled.div`
  display: inline-flex;
  font-weight: bold;
  user-select: none;
  color: #717070;
  text-overflow: ellipsis;
  min-width: 30px;
  text-align: center;
  justify-content: center;
  align-items: center;
  white-space: pre-wrap;
  font-size: 16px;
  color: var(--color_label-highlighted);
  box-shadow: none;
  position: relative;
  white-space: nowrap;
  position: relative;
  margin: 15px 0px;
  box-sizing: border-box;
  border: 2px solid;
  padding: 4px 4px;
  border-color: var(--color_accent);
  border-radius: 2px;
`;
const MacroEditControlsContainer = styled.div`
  border-radius: 2px;
  border: 1px solid var(--border_color_icon);
  display: inline-flex;
  > button:last-child {
    border: none;
  }
`;

const IconButtonContainer = styled(IconButton)`
  cursor: pointer;
  background: var(--bg_control);
  border-right: 1px solid var(--border_color_icon);
`;

const AddNextItemDisabled = styled(IconButton)`
  cursor: initial;
  font-size: initial;
  line-height: initial;
  border-right: 1px solid var(--border_color_icon);
  cursor: not-allowed;
  background: var(--bg_menu);
`;

const AddToSequenceContainer = styled.button`
  appearance: none;
  background: transparent;
  cursor: pointer;
  border-radius: 4px;
  border: 4px solid var(--border_color_icon);
  display: inline-flex;
`;

const CharacterStreamContainer = styled.div`
  border: 2px solid var(--bg_control);
  transition: border-color 0.2s ease-in-out;
  margin: 15px 0px;
  display: inline-block;
  &:focus-within {
    border-color: var(--color_accent);
  }
  border-radius: 4px;
  font-size: 16px;
`;

const KeycodeSequenceLabel = styled.div`
  display: inline-flex;
  user-select: none;
  color: #717070;
  padding: 6px 4px;
  text-overflow: ellipsis;
  min-width: 30px;
  font-size: 12px;
  text-align: center;
  border-radius: 4px;
  justify-content: center;
  align-items: center;
  white-space: pre-wrap;
  font-size: 16px;
  border: 2px solid var(--border_color_icon);
  background: var(--bg_control);
  color: var(--color_label-highlighted);
  margin: 0;
  box-shadow: none;
  position: relative;
  border-radius: 2px;
  white-space: nowrap;
  position: relative;
  margin: 15px 0px;
`;
const KeycodeDownLabel = styled(KeycodeSequenceLabel)`
  &::after {
    border-style: solid;
    border-color: transparent;
    content: '';
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-top: 6px solid var(--color_accent);
    position: absolute;
    margin-top: 55px;
    width: 0;
  }
`;

const KeycodePressLabel = styled(KeycodeSequenceLabel)`
  border-color: var(--color_accent);
`;
const KeycodeUpLabel = styled(KeycodeSequenceLabel)`
  &::after {
    content: '';
    border-style: solid;
    margin-top: -55px;
    border-color: transparent;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-bottom: 6px solid var(--color_accent);
    position: absolute;
    width: 0;
  }
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

const SequenceLabelSeparator = styled.div`
  width: 20px;
  display: inline-flex;
  vertical-align: middle;
  border: 1px solid var(--color_accent);
`;

const DeletableContainer = styled.div`
  display: inline-flex;
  vertical-align: middle;
  position: relative;
  svg {
    color: var(--bg_icon-highlighted);
    position: absolute;
    right: -5px;
    top: 6px;
    opacity: 0;
    cursor: pointer;
    transition: transform 0.2s ease-in-out;
    background: var(--bg_icon);
    border-radius: 50%;
    transform: scale(0.8);
  }
  &:hover svg {
    opacity: 1;
    transform: scale(1);
  }
`;

const NumberInput = styled.input.attrs({type: 'number', placeholder: 'XXXXX'})`
  appearance: none;
  background: none;
  border: none;
  border-bottom: 1px solid;
  color: var(--color_label);
  width: 45px;
  text-align: center;
  font-family: inherit;
  font-size: inherit;
  color: var(--color_label-highlighted);
  margin: 0 5px 0 0;
  &:focus {
    color: var(--color_accent);
  }
  &::-webkit-inner-spin-button {
    appearance: none;
    display: none;
  }
  &:invalid {
    color: red;
  }
  &:placeholder-shown {
    color: red;
  }
`;

const Deletable: React.FC<
  PropsWithChildren<{index: number; deleteItem: (index: number) => void}>
> = (props) => {
  return (
    <DeletableContainer>
      {props.children}
      <FontAwesomeIcon
        icon={faXmarkCircle}
        size={'lg'}
        onClick={() => props.deleteItem(props.index)}
      />
    </DeletableContainer>
  );
};

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

const getSequenceItemComponent = (action: OptimizedKeycodeSequenceItem[0]) =>
  action === RawKeycodeSequenceAction.Down
    ? KeycodeDownLabel
    : action === RawKeycodeSequenceAction.Up
    ? KeycodeUpLabel
    : action === RawKeycodeSequenceAction.CharacterStream
    ? KeycodePressLabel
    : KeycodePressLabel;

const WaitInput: React.FC<{
  value: number | string;
  setInput: (wait: number) => void;
}> = (props) => {
  const [waitNumber, setWaitNumber] = useState(props.value);
  const inputRef = useRef(null);
  const onBeforeInput = (evt: InputEvent) => {
    if (!evt.data || !/^\d$/.test(evt.data)) {
      evt.preventDefault();
    }
    console.log(evt.data);
  };
  const onChange = (evt: ChangeEvent<HTMLInputElement>) => {
    if (
      evt.target.value === '' ||
      (+evt.target.value > 0 && +evt.target.value < 100000)
    ) {
      setWaitNumber(evt.target.value);
    }
  };

  return (
    <KeycodeSequenceWait>
      <NumberInput
        ref={inputRef}
        onBeforeInput={onBeforeInput as any}
        value={waitNumber}
        onChange={onChange}
      />
      ms
    </KeycodeSequenceWait>
  );
};

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
  const keycodeMap = useMemo(
    () =>
      getKeycodes()
        .flatMap((menu) => menu.keycodes)
        .reduce(
          (p, n) => ({...p, [n.code]: n}),
          {} as Record<string, IKeycode>,
        ),
    [],
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
  const currSequence = !showOriginalMacro
    ? keycodeSequence
    : selectedMacro ?? [];
  useEffect(() => {
    setShowOriginalMacro(true);
    setKeycodeSequence([]);
  }, [selectedMacro]);

  const showWaitTimes = recordWaitTimes || showOriginalMacro;
  const displayedSequence = useMemo(() => {
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
    )[0].filter(
      ([action]) =>
        showWaitTimes ||
        currSequence === selectedMacro ||
        action !== RawKeycodeSequenceAction.Delay,
    );
  }, [
    showOriginalMacro,
    currSequence,
    showVerboseKeyState,
    showWaitTimes,
    selectedMacro,
  ]);
  useEffect(() => {
    if (displayedSequence) {
      setUnsavedMacro(sequenceToExpression(displayedSequence));
    }
  }, [displayedSequence]);

  const sequence = useMemo(() => {
    return componentJoin(
      displayedSequence.map(([action, actionArg], index) => {
        const Label = getSequenceItemComponent(action);
        return !showWaitTimes &&
          action === RawKeycodeSequenceAction.Delay ? null : (
          <>
            {RawKeycodeSequenceAction.Delay !== action ? (
              <Deletable
                index={index}
                deleteItem={(idx) => console.log('trying to delete:', idx)}
              >
                <Label>
                  {action === RawKeycodeSequenceAction.CharacterStream
                    ? actionArg
                    : Array.isArray(actionArg)
                    ? actionArg
                        .map((k) => getSequenceLabel(keycodeMap[k]) ?? k)
                        .join(' + ')
                    : getSequenceLabel(keycodeMap[actionArg])}
                </Label>
              </Deletable>
            ) : showWaitTimes ? (
              <>
                <Deletable
                  index={index}
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
        <Label></Label>
        <Detail>
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
            }}
            saveChanges={() => saveMacro()}
            hasUnsavedChanges={!!keycodeSequence.length}
            recordingToggleChange={recordingToggleChange}
          />
        </Detail>
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

const MacroEditControls: React.FC<{
  isFullscreen: boolean;
  isRecording: boolean;
  hasUnsavedChanges?: boolean;
  revertChanges(): void;
  deleteMacro(): void;
  saveChanges(): void;
  toggleFullscreen(): void;
  isEmpty?: boolean;
  recordingToggleChange: (a: boolean) => void;
  addText: () => void;
}> = ({
  isFullscreen,
  isRecording,
  recordingToggleChange,
  hasUnsavedChanges,
  revertChanges,
  saveChanges,
  isEmpty,
  deleteMacro,
  toggleFullscreen,
}) => {
  const recordComponent = (
    <IconButtonContainer
      onClick={() => {
        recordingToggleChange(!isRecording);
      }}
      disabled={!isFullscreen}
    >
      <FontAwesomeIcon
        size={'sm'}
        color={'var(--color_label)'}
        icon={isRecording ? faSquare : faCircle}
      />
      <IconButtonTooltip>
        {isFullscreen
          ? isRecording
            ? 'Stop Recording'
            : 'Record Keystrokes'
          : 'Can only record when fullscreen'}
      </IconButtonTooltip>
    </IconButtonContainer>
  );
  return (
    <MacroEditControlsContainer>
      {hasUnsavedChanges ? (
        <>
          <IconButtonContainer
            disabled={!hasUnsavedChanges || isRecording}
            onClick={revertChanges}
          >
            <FontAwesomeIcon
              size={'sm'}
              color="var(--color_label)"
              icon={faUndo}
            />
            <IconButtonTooltip>Undo Changes</IconButtonTooltip>
          </IconButtonContainer>
          <IconButtonContainer
            disabled={!hasUnsavedChanges || isRecording}
            onClick={() => saveChanges()}
          >
            <FontAwesomeIcon
              size={'sm'}
              color="var(--color_label)"
              icon={faSave}
            />
            <IconButtonTooltip>Save Changes</IconButtonTooltip>
          </IconButtonContainer>
        </>
      ) : !isEmpty ? (
        <IconButtonContainer
          disabled={hasUnsavedChanges || isRecording}
          onClick={deleteMacro}
        >
          <FontAwesomeIcon
            size={'sm'}
            color="var(--color_label)"
            icon={faTrash}
          />
          <IconButtonTooltip>Delete Macro</IconButtonTooltip>
        </IconButtonContainer>
      ) : null}
      {recordComponent}
      {
        <IconButtonContainer onClick={toggleFullscreen}>
          <FontAwesomeIcon
            size={'sm'}
            color="var(--color_label)"
            icon={isFullscreen ? faCompress : faExpand}
          />
          <IconButtonTooltip>
            {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          </IconButtonTooltip>
        </IconButtonContainer>
      }
    </MacroEditControlsContainer>
  );
};
const CharacterStreamInput: React.FC<{
  children?: React.ReactNode | undefined;
}> = (props) => {
  return (
    <>
      <CharacterStreamContainer>
        <TextareaAutosize
          style={{
            background: 'transparent',
            color: 'var(--color_label-highlighted)',
            padding: '8px',
            borderRadius: 4,
            border: 'none',
            fontFamily: '"Fira Sans"',
            verticalAlign: 'middle',
            resize: 'none',
            fontSize: 16,
          }}
          minRows={1}
          maxRows={3}
        >
          {props.children}
        </TextareaAutosize>
      </CharacterStreamContainer>
    </>
  );
};
