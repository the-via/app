import { TestKeyState } from "src/types/types";
import { Note } from "./note";

let lastPressedKeys: TestKeyState[] = [];
let notes: Record<number, Note> = {};
export const testKeyboardSounds = (pressedKeys: TestKeyState[] | undefined) => {
  if ( pressedKeys === undefined ) {
    return;
  }

  if ( Object.keys(pressedKeys).length === 0 ) {
    Object.values(notes).forEach((note) => note?.noteOff() );
    return;
  }

  Object.keys(pressedKeys).forEach( (key) => {
    const index: number = Number.parseInt(key);
    const oldState = lastPressedKeys[index] ?? TestKeyState.KeyUp;
    const state = pressedKeys[index];
    if ( state != oldState ) {
      if ( state == TestKeyState.KeyDown ) {
        const midiNote = notes[index]?.midiNote ?? 60 + Math.floor(Math.random() * 24);
        notes[index] = new Note(midiNote);
        notes[index].noteOn();
      } else if ( state == TestKeyState.KeyUp ) {
        notes[index]?.noteOff();
      }
      lastPressedKeys[index] = state;
    }
  });
}