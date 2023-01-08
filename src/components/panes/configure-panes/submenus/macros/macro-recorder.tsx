import {faCircle, faPlus, faSquare} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {AccentButton} from 'src/components/inputs/accent-button';
import {AccentSlider} from 'src/components/inputs/accent-slider';
import {ControlRow, Detail, Label} from 'src/components/panes/grid';
import {useAppSelector} from 'src/store/hooks';
import {KeyAction} from 'src/utils/macro-api/macro-api.common';
import {
  KeycodeSequence,
  KeycodeSequenceItem,
  useKeycodeRecorder,
} from 'src/utils/use-keycode-recorder';
import styled from 'styled-components';

function capitalize(string: string) {
  return string[0].toUpperCase() + string.slice(1);
}

const IconButton = styled.button`
  appearance: none;
  background: transparent;
  border: none;
  cursor: pointer;
  &:hover {
    filter:brightness(0.8);
  }
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
  margin: 0;
  box-shadow: none;
  position: relative;
  white-space: nowrap;
  position: relative;
  margin: 15px 10px;
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
  margin: 15px 10px;
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
  [acc, prev, currHeld]: [KeycodeSequence, KeycodeSequenceItem, number],
  curr: KeycodeSequenceItem,
) => {
  const [action, actionArg] = curr;
  if (action === KeyAction.Delay && currHeld === 0) {
    acc.push(curr);
  } else if (
    (action === KeyAction.Down || action === KeyAction.Tap) &&
    currHeld === 0
  ) {
    acc.push([KeyAction.Tap, capitalize(actionArg as string)]);
    currHeld = currHeld + 1;
  } else if (action === KeyAction.Tap && String(actionArg).length === 1) {
    acc[acc.length - 1][1] = `${acc[acc.length - 1][1]}${actionArg}`;
  } else if (action === KeyAction.Tap) {
    acc[acc.length - 1][1] = `${acc[acc.length - 1][1]} + ${capitalize(
      actionArg as string,
    )}`;
  } else if (action === KeyAction.Down) {
    acc[acc.length - 1][1] = `${acc[acc.length - 1][1]} + ${capitalize(
      actionArg as string,
    )}`;
    currHeld = currHeld + 1;
  } else if (action === KeyAction.Up) {
    currHeld = currHeld - 1;
  }
  return [acc, curr, currHeld] as [
    KeycodeSequence,
    KeycodeSequenceItem,
    number,
  ];
};

export const MacroRecorder: React.FC<{selectedMacro: number}> = ({
  selectedMacro,
}) => {
  const [showVerboseKeyState, setShowVerboseKeyState] = useState(true);
  const [showWaitTimes, setShowWaitTimes] = useState(true);
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
    : ast[selectedMacro];

  const sequence = useMemo(() => {
    const [acc] = showVerboseKeyState
      ? [currSequence]
      : currSequence.reduce(transformToCompressed, [
          [],
          [KeyAction.Delay, 0],
          0,
        ] as [KeycodeSequence, KeycodeSequenceItem, number]);

    return acc.map((sequenceItem, idx) => {
      const Label =
        sequenceItem[0] === KeyAction.Down
          ? KeycodeDownLabel
          : sequenceItem[0] === KeyAction.Up
          ? KeycodeUpLabel
          : KeycodePressLabel;
      const prefix = idx ? (
        <FontAwesomeIcon icon={faPlus} color={'var(--color_accent)'} />
      ) : null;
      return !showWaitTimes && sequenceItem[0] === KeyAction.Delay ? null : (
        <>
          {prefix}
          {KeyAction.Delay !== sequenceItem[0] ? (
            <Label>{sequenceItem[1]}</Label>
          ) : showWaitTimes ? (
            <>
              <KeycodeSequenceWait>
                <KeycodeSequenceWaitNumber>
                  {sequenceItem[1]}
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
        <Label>Record Macro</Label>
        <Detail>
          {isFullscreen ? (
            <IconButton
              onClick={() => {
                recordingToggleChange(!isRecording);
              }}
            >
              <FontAwesomeIcon
                size={'xl'}
                color={isRecording ? 'var(--color_label-highlighted)' : 'red'}
                icon={isRecording ? faSquare : faCircle}
              />
            </IconButton>
          ) : (
            'Can only record while fullscreen'
          )}
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
      {ast.length ? (
        <MacroSequenceContainer ref={macroSequenceRef}>
          {sequence}
        </MacroSequenceContainer>
      ) : null}
    </>
  );
};
