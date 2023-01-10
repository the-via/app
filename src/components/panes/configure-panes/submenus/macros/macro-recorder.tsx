import {
  faCircle,
  faPenToSquare,
  faPlus,
  faSquare,
} from '@fortawesome/free-solid-svg-icons';
import TextareaAutosize from 'react-textarea-autosize';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {AccentButton} from 'src/components/inputs/accent-button';
import {AccentSlider} from 'src/components/inputs/accent-slider';
import {ControlRow, Detail, Label} from 'src/components/panes/grid';
import {useAppSelector} from 'src/store/hooks';
import {
  GroupedKeycodeSequenceAction,
  GroupedKeycodeSequenceItem,
  OptimizedKeycodeSequence,
  OptimizedKeycodeSequenceItem,
  RawKeycodeSequenceAction,
  RawKeycodeSequenceItem,
} from 'src/utils/macro-api/types';
import {useKeycodeRecorder} from 'src/utils/use-keycode-recorder';
import styled from 'styled-components';

function capitalize(string: string) {
  return string[0].toUpperCase() + string.slice(1);
}

const IconButton = styled.button`
  appearance: none;
  background: transparent;
  border: none;
  cursor: pointer;
  color: ${(props) =>
    props.disabled ? 'var(--bg_control)' : 'var(--color_accent)'};
  border-color: ${(props) =>
    props.disabled ? 'var(--bg_control)' : 'var(--color_accent)'};
  &:hover {
    color: ${(props) =>
      props.disabled ? 'var(--bg_control)' : 'var(--color_inside-accent)'};
    border-color: ${(props) =>
      props.disabled ? 'var(--bg_control)' : 'var(--color_accent)'};
    background-color: ${(props) =>
      props.disabled ? 'transparent' : 'var(--color_accent)'};
  }

  svg {
    color: ${(props) =>
      props.disabled ? 'var(--bg_control)' : 'var(--color_accent)'};
  }
  &:hover svg {
    color: ${(props) =>
      props.disabled ? 'var(--bg_control)' : 'var(--color_inside-accent)'};
  }
`;

const KeycodeSequenceWaitNumber = styled.span`
  display: inline-flex;
  border: 2px solid transparent;
  padding: 5px 2px;
  font-weight: initial;
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
`;
const AddNextContainer = styled.div`
  border-radius: 4px;
  border: 1px solid var(--border_color_icon);
  display: inline-flex;
  > button:last-child {
    border: none;
  }
`;

const AddNextItem = styled(IconButton)`
  padding: 10px 10px;
  cursor: pointer;
  line-height: initial;
  background: var(--bg_control);
  font-size: initial;
  border-right: 1px solid var(--border_color_icon);
`;

const AddNextItemDisabled = styled(IconButton)`
  padding: 10px 10px;
  cursor: initial;
  font-size: initial;
  line-height: initial;
  border-right: 1px solid var(--border_color_icon);
  cursor: not-allowed;
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
  padding: 5px;
  text-overflow: ellipsis;
  cursor: pointer;
  min-width: 30px;
  font-size: 12px;
  text-align: center;
  border-radius: 4px;
  justify-content: center;
  align-items: center;
  white-space: pre-wrap;
  border-radius: 64px;
  font-size: 16px;
  border: 4px solid var(--border_color_icon);
  background: var(--bg_control);
  color: var(--color_label-highlighted);
  margin: 0;
  box-shadow: none;
  position: relative;
  border-radius: 10px;
  white-space: nowrap;
  position: relative;
  text-transform: capitalize;
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
  padding: 10px 0;
`;

declare global {
  interface Navigator {
    keyboard: {
      unlock(): Promise<void>;
      lock(): Promise<void>;
    };
  }
}

const transformToCompressed = (
  [acc, prev, currHeld]: [
    OptimizedKeycodeSequence,
    OptimizedKeycodeSequenceItem,
    number,
  ],
  curr: OptimizedKeycodeSequenceItem,
) => {
  const [action, actionArg] = curr;
  if (action === RawKeycodeSequenceAction.Delay && currHeld === 0) {
    acc.push(curr);
  } else if (
    (action === RawKeycodeSequenceAction.Down ||
      action === RawKeycodeSequenceAction.Tap) &&
    currHeld === 0
  ) {
    acc.push([RawKeycodeSequenceAction.Tap, capitalize(actionArg as string)]);
    currHeld = currHeld + 1;
  } else if (
    action === RawKeycodeSequenceAction.Tap &&
    String(actionArg).length === 1
  ) {
    acc[acc.length - 1][1] = `${acc[acc.length - 1][1]}${actionArg}`;
  } else if (action === RawKeycodeSequenceAction.Tap) {
    acc[acc.length - 1][1] = `${acc[acc.length - 1][1]} + ${capitalize(
      actionArg as string,
    )}`;
  } else if (action === RawKeycodeSequenceAction.Down) {
    acc[acc.length - 1][1] = `${acc[acc.length - 1][1]} + ${capitalize(
      actionArg as string,
    )}`;
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

export const MacroRecorder: React.FC<{
  selectedMacro?: OptimizedKeycodeSequence;
}> = ({selectedMacro}) => {
  const [showVerboseKeyState, setShowVerboseKeyState] = useState(false);
  const [showWaitTimes, setShowWaitTimes] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(
    !!document.fullscreenElement,
  );
  const [keycodeSequence, setKeycodeSequence] = useKeycodeRecorder(isRecording);
  const ast = useAppSelector((state) => state.macros.ast);
  const macroSequenceRef = useRef<HTMLDivElement>(null);
  const recordingToggleChange = useCallback(
    async (isRecording: boolean) => {
      setIsRecording(isRecording);
      if (isRecording) {
        await navigator.keyboard.lock();
        setKeycodeSequence([]);
      } else {
        navigator.keyboard.unlock();
      }
    },
    [setIsRecording],
  );
  const currSequence = keycodeSequence.length
    ? keycodeSequence
    : selectedMacro ?? [];

  const plusIcon = (
    <FontAwesomeIcon
      style={{marginLeft: 10, marginRight: 10}}
      icon={faPlus}
      color={'var(--color_accent)'}
    />
  );

  console.log(currSequence);
  const sequence = useMemo(() => {
    const [acc] = showVerboseKeyState
      ? [currSequence]
      : currSequence.reduce(transformToCompressed, [
          [],
          [RawKeycodeSequenceAction.Delay, 0],
          0,
        ] as [OptimizedKeycodeSequence, OptimizedKeycodeSequenceItem, number]);

    return acc.map(([action, actionArg], idx) => {
      const Label =
        action === RawKeycodeSequenceAction.Down
          ? KeycodeDownLabel
          : action === RawKeycodeSequenceAction.Up
          ? KeycodeUpLabel
          : action === RawKeycodeSequenceAction.CharacterStream
          ? CharacterStreamInput
          : KeycodePressLabel;
      const prefix = idx ? plusIcon : null;
      return !showWaitTimes &&
        action === RawKeycodeSequenceAction.Delay ? null : (
        <>
          {prefix}
          {RawKeycodeSequenceAction.Delay !== action ? (
            <Label>{actionArg}</Label>
          ) : showWaitTimes ? (
            <>
              <KeycodeSequenceWait>
                <KeycodeSequenceWaitNumber>
                  {actionArg}
                </KeycodeSequenceWaitNumber>
                ms
              </KeycodeSequenceWait>
            </>
          ) : null}
        </>
      );
    });
  }, [keycodeSequence, showVerboseKeyState, showWaitTimes]);
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
  return (
    <>
      <ControlRow>
        <Label>Fullscreen Mode</Label>
        <Detail>
          <AccentButton
            onClick={() => {
              if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen();
              } else if (document.exitFullscreen) {
                recordingToggleChange(false);
                document.exitFullscreen();
              }
            }}
          >
            {isFullscreen ? 'Leave' : 'Enter'}
          </AccentButton>
        </Detail>
      </ControlRow>
      <ControlRow>
        <Label>Always show separate keyup/keydown</Label>
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
          <AccentSlider isChecked={showWaitTimes} onChange={setShowWaitTimes} />
        </Detail>
      </ControlRow>
      <ControlRow>
        <Label>Rerecord Macro</Label>
        <Detail>
          <AddNext
            isFullscreen={isFullscreen}
            isRecording={isRecording}
            recordingToggleChange={recordingToggleChange}
          />
        </Detail>
      </ControlRow>
      {sequence.length ? (
        <MacroSequenceContainer ref={macroSequenceRef}>
          {sequence}
          {plusIcon}
          <AddNext
            isFullscreen={isFullscreen}
            isRecording={isRecording}
            recordingToggleChange={recordingToggleChange}
          />
        </MacroSequenceContainer>
      ) : null}
    </>
  );
};

const AddNext: React.FC<{
  isFullscreen: boolean;
  isRecording: boolean;
  recordingToggleChange: (a: boolean) => void;
}> = ({isFullscreen, isRecording, recordingToggleChange}) => {
  const recordComponent = isFullscreen ? (
    <AddNextItem
      onClick={() => {
        recordingToggleChange(!isRecording);
      }}
    >
      <FontAwesomeIcon
        size={'sm'}
        color={'var(--color_label)'}
        icon={isRecording ? faSquare : faCircle}
      />{' '}
      {isRecording ? 'Stop Recording' : 'Record Keystrokes'}
    </AddNextItem>
  ) : (
    <AddNextItemDisabled disabled={true}>
      <FontAwesomeIcon
        size={'sm'}
        color={'var(--color_label)'}
        icon={faCircle}
      />{' '}
      Can only record when fullscreen
    </AddNextItemDisabled>
  );
  return (
    <AddNextContainer>
      {recordComponent}
      <AddNextItem>
        <FontAwesomeIcon
          size={'sm'}
          color="var(--color_label)"
          icon={faPenToSquare}
        />{' '}
        Add Text
      </AddNextItem>
    </AddNextContainer>
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
