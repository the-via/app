import {useEffect} from 'react';
import {getTestKeyboardSoundsSettings} from 'src/store/settingsSlice';
import {TestKeyState} from 'src/types/types';
import {Note, setGlobalAmpGain} from '../../utils/note';
import {useAppSelector} from 'src/store/hooks';

let lastPressedKeys: Record<string, TestKeyState> = {};
let notes: Record<string, Note> = {};

const turnOffAllTheNotes = () => {
  Object.values(notes).forEach((note) => note?.noteOff());
};

export const TestKeyboardSounds: React.FC<{
  pressedKeys: Record<string, TestKeyState>;
}> = ({pressedKeys}) => {
  const {waveform, volume} = useAppSelector(getTestKeyboardSoundsSettings);

  useEffect(() => {
    setGlobalAmpGain(volume / 100);
  }, [volume]);

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
            notes[index] = new Note(midiNote, waveform);
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
