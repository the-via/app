import {TestKeyState} from 'src/types/types';
import {Note} from './note';

let lastPressedKeys: Record<string, TestKeyState> = {};
let notes: Record<string, Note> = {};
export const testKeyboardSounds = (
  pressedKeys: Record<string, TestKeyState> | undefined,
) => {
  if (pressedKeys === undefined) {
    return;
  }

  if (Object.keys(pressedKeys).length === 0) {
    Object.values(notes).forEach((note) => note?.noteOff());
    return;
  }

  Object.entries(pressedKeys).forEach(([index, state]) => {
    const lastState = lastPressedKeys[index] ?? TestKeyState.KeyUp;
    if (state != lastState) {
      if (state == TestKeyState.KeyDown) {
        const midiNote =
          notes[index]?.midiNote ?? 60 + Math.floor(Math.random() * 24);
        notes[index] = new Note(midiNote);
        notes[index].noteOn();
      } else if (state == TestKeyState.KeyUp) {
        notes[index]?.noteOff();
      }
      lastPressedKeys[index] = state;
    }
  });
};
