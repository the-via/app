import {useCallback, useEffect, useMemo, useState} from 'react';
import {getKeycodes} from './key';
import {mapEvtToKeycode} from './key-event';
import {KeyAction} from './macro-api/macro-api.common';

let heldKeys = {} as any;
let lastEvtTime = 0;
export type KeycodeSequenceItem = [KeyAction, string | number];
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
    (evt: KeyboardEvent, keyState: KeyAction) => {
      evt.preventDefault();
      if (enableRecording && !evt.repeat) {
        setKeycodeSequence((keycodeSequence) => {
          const keycode = keycodes.find((k) => k.code === mapEvtToKeycode(evt));
          const currTime = Date.now();
          const keycodeLabel =
            keycode?.keys ?? keycode?.shortName ?? keycode?.name ?? evt.code;
          if (keycodeSequence.length) {
            keycodeSequence.push([KeyAction.Delay, currTime - lastEvtTime]);
          }
          keycodeSequence.push([keyState, keycodeLabel]);
          lastEvtTime = currTime;
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
        addToSequence(evt, KeyAction.Down);
      }
    },
    [enableRecording],
  );

  // If released key is our target key then set to false
  const upHandler = useCallback(
    (evt: KeyboardEvent) => {
      heldKeys[evt.code] = false;
      addToSequence(evt, KeyAction.Up);
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
