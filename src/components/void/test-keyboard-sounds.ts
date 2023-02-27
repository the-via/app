import {useEffect} from 'react';
import {getTestKeyboardSoundsSettings} from 'src/store/settingsSlice';
import {TestKeyState} from 'src/types/types';
import {Note, setGlobalAmpGain} from '../../utils/note';
import {useAppSelector} from 'src/store/hooks';

export enum TestKeyboardSoundsMode {
  Random,
  WickiHayden,
  Chromatic,
}

let lastPressedKeys: TestKeyState[][] = [];
let notes: Record<string, Note> = {};

const baseSeed = Math.floor(Math.random() * 1000);
const seededRandom = (seed: number) => {
  return (((baseSeed + seed) * 9301 + 49297) % 233280) / 233280;
};

const calculateMidiNote = (
  mode: TestKeyboardSoundsMode,
  transpose: number,
  rowCount: number,
  row: number,
  col: number,
) => {
  // Adjust for more or less than 5 rows
  // Map to 0..4 = bottom row to top row
  // eg. a 2 row macropad maps to the same as
  // the top two rows of a 60%
  const adjustedRow =
    Math.min(4, rowCount - row - 1) + Math.max(0, 5 - rowCount);

  switch (mode) {
    case TestKeyboardSoundsMode.WickiHayden: {
      // This is bottom row relative
      // J is C4 = 72
      // Home row starts on 72 - 14
      const rowStartMidiNote = [-18, -19, -14, -9, -4];
      return rowStartMidiNote[adjustedRow] + 72 + transpose + col * 2;
    }
    case TestKeyboardSoundsMode.Chromatic: {
      // This is bottom row relative
      // J is C4 = 72
      // Home row starts on 72 - 7
      const rowStartMidiNote = [-15, -12, -7, -1, +4];
      return rowStartMidiNote[adjustedRow] + 72 + transpose + col;
    }
    case TestKeyboardSoundsMode.Random:
    default: {
      return (
        72 + transpose + Math.floor(seededRandom(row * 1000 + col) * 24) - 12
      );
    }
  }
};

const turnOffAllTheNotes = () => {
  Object.values(notes).forEach((note) => note?.noteOff());
};

export const TestKeyboardSounds: React.FC<{
  pressedKeys: TestKeyState[][];
}> = ({pressedKeys}) => {
  const {waveform, volume, mode, transpose} = useAppSelector(
    getTestKeyboardSoundsSettings,
  );

  useEffect(() => {
    setGlobalAmpGain(volume / 100);
  }, [volume]);

  useEffect(() => {
    if (pressedKeys.length === 0) {
      turnOffAllTheNotes();
    } else {
      const rowCount = pressedKeys.length;
      lastPressedKeys = pressedKeys.reduce((p, n, row) => {
        return [
          ...p,
          n.reduce((p2, n2, col) => {
            const index = `${row},${col}`;
            const lastState =
              lastPressedKeys?.at(row)?.at(col) ?? TestKeyState.KeyUp;
            const state = n2 ?? TestKeyState.KeyUp;
            if (state != lastState) {
              if (state == TestKeyState.KeyDown) {
                const midiNote = calculateMidiNote(
                  mode,
                  transpose,
                  rowCount,
                  row,
                  col,
                );
                notes[index] = new Note(midiNote, waveform);
                notes[index].noteOn();
              } else if (state == TestKeyState.KeyUp) {
                notes[index]?.noteOff();
              }
            }
            return [...p2, n2];
          }, [] as TestKeyState[]),
        ];
      }, [] as TestKeyState[][]);
    }
  }, [pressedKeys]);

  useEffect(() => {
    return () => {
      turnOffAllTheNotes();
    };
  }, []);

  return null;
};
