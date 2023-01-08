import {useCallback, useEffect, useMemo, useState} from 'react';
import {TestKeyState} from 'src/types/types';
import {getKeycodes} from './key';
import {mapEvtToKeycode} from './key-event';

let heldKeys = {} as any;
let lastEvtTime = 0;
export type KeycodeSequenceItem = [string, TestKeyState | null, number];
export type KeycodeSequence = KeycodeSequenceItem[];
export const useKeycodeRecorder = (enableRecording: boolean) => {
  const keycodeSequenceState = useState<KeycodeSequence>([]);
  const [, setKeycodeSequence] = keycodeSequenceState;
  const keycodes = useMemo(
    () => getKeycodes().flatMap((menu) => menu.keycodes),
    [],
  );
  // If pressed key is our target key then set to true
  const addToSequence = useCallback(
    (evt: KeyboardEvent, keyState: TestKeyState) => {
      evt.preventDefault();
      if (enableRecording && !evt.repeat) {
        setKeycodeSequence((keycodeSequence) => {
          const keycode = keycodes.find((k) => k.code === mapEvtToKeycode(evt));
          const currTime = Date.now();
          const keycodeLabel =
            keycode?.keys ?? keycode?.shortName ?? keycode?.name ?? evt.code;
          const sequenceItem = [
            keycodeLabel,
            keyState,
            currTime - lastEvtTime,
          ] as KeycodeSequenceItem;
          lastEvtTime = currTime;
          keycodeSequence.push(sequenceItem);

          return [...keycodeSequence];
        });
      }
    },
    [enableRecording],
  );
  const downHandler = useCallback(
    (evt: KeyboardEvent) => {
      if (!heldKeys[evt.code]) {
        heldKeys[evt.code] = true;
        addToSequence(evt, TestKeyState.KeyDown);
      }
    },
    [enableRecording],
  );

  // If released key is our target key then set to false
  const upHandler = useCallback(
    (evt: KeyboardEvent) => {
      heldKeys[evt.code] = false;
      addToSequence(evt, TestKeyState.KeyUp);
    },
    [enableRecording],
  );

  useEffect(() => {
    heldKeys = {};
    if (enableRecording) {
      lastEvtTime = Date.now();
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
