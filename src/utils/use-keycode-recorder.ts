import {useCallback, useEffect, useMemo, useState} from 'react';
import {getKeycodes} from './key';
import {mapEvtToKeycode} from './key-event';
import {RawKeycodeSequence, RawKeycodeSequenceAction} from './macro-api/types';

let heldKeys = {} as any;
let lastEvtTime = 0;
export const useKeycodeRecorder = (
  enableRecording: boolean,
  recordDelays: boolean,
) => {
  const keycodeSequenceState = useState<RawKeycodeSequence>([]);
  const [, setKeycodeSequence] = keycodeSequenceState;
  const keycodes = useMemo(
    () => getKeycodes().flatMap((menu) => menu.keycodes),
    [],
  );
  // If pressed key is our target key then set to true
  const addToSequence = useCallback(
    (evt: KeyboardEvent, keyState: RawKeycodeSequenceAction) => {
      evt.preventDefault();
      if (enableRecording && !evt.repeat) {
        setKeycodeSequence((keycodeSequence) => {
          const keycode = keycodes.find((k) => k.code === mapEvtToKeycode(evt));
          const currTime = Date.now();
          const keycodeLabel = keycode?.code;
          if (keycodeSequence.length && recordDelays) {
            keycodeSequence.push([
              RawKeycodeSequenceAction.Delay,
              currTime - lastEvtTime,
            ]);
          }
          if (keycodeLabel) {
            keycodeSequence.push([keyState, keycodeLabel]);
          }
          lastEvtTime = currTime;
          return [...keycodeSequence];
        });
      }
    },
    [enableRecording, recordDelays],
  );
  const downHandler = useCallback(
    (evt: KeyboardEvent) => {
      if (!heldKeys[evt.code]) {
        heldKeys[evt.code] = true;
        addToSequence(evt, RawKeycodeSequenceAction.Down);
      }
    },
    [enableRecording],
  );

  // If released key is our target key then set to false
  const upHandler = useCallback(
    (evt: KeyboardEvent) => {
      heldKeys[evt.code] = false;
      addToSequence(evt, RawKeycodeSequenceAction.Up);
    },
    [enableRecording],
  );

  useEffect(() => {
    heldKeys = {};
    if (enableRecording) {
      window.addEventListener('keydown', downHandler);
      window.addEventListener('keyup', upHandler);
    }
    // Remove event listeners on cleanup
    return () => {
      heldKeys = {};
      window.removeEventListener('keydown', downHandler);
      window.removeEventListener('keyup', upHandler);
    };
  }, [enableRecording]); // Empty array ensures that effect is only run on mount and unmount
  return keycodeSequenceState;
};
