import {useEffect} from 'react';
import {TestKeyState} from 'src/types/types';
import {Note} from '../../utils/note';

let lastPressedKeys: Record<string, TestKeyState> = {};
let notes: Record<string, Note> = {};

const turnOffAllTheNotes = () => {
  Object.values(notes).forEach((note) => note?.noteOff());
};

export const TestKeyboardSounds: React.FC<{
  pressedKeys: Record<string, TestKeyState>;
}> = ({pressedKeys}) => {
  useEffect(() => {
    if (Object.keys(pressedKeys).length === 0) {
      turnOffAllTheNotes();
    } else {
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
    }
  }, [pressedKeys]);

  useEffect(() => {
    return () => {
      turnOffAllTheNotes();
    };
  }, []);

  return null;
};
