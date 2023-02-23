import {
  GroupedKeycodeSequenceAction,
  OptimizedKeycodeSequence,
  OptimizedKeycodeSequenceItem,
  RawKeycodeSequence,
  RawKeycodeSequenceAction,
  RawKeycodeSequenceItem,
} from './types';

export type ValidationResult = {
  isValid: boolean;
  errorMessage?: string;
};

export interface IMacroAPI {
  readRawKeycodeSequences(): Promise<RawKeycodeSequence[]>;
  writeRawKeycodeSequences(sequences: RawKeycodeSequence[]): void;
  rawKeycodeSequencesToMacroBytes(sequences: RawKeycodeSequence[]): number[];
}

// Corresponds to 'magic codes' in qmk sendstring
export enum KeyAction {
  Tap = 1, // \x01
  Down = 2, // \x02
  Up = 3, // \x03
  Delay = 4, // \x04
}

export const KeyActionPrefix = 1; // \x01
export const DelayTerminator = 124; // '|';
export const MacroTerminator = 0;

// split "{KC_A}bcd{KC_E}" into "{KC_A}","bcd","{KC_E}",
// handles escaped braces e.g. "\{"
export function splitExpression(expression: string): string[] {
  let regex;
  try {
    regex = eval('/(?<!\\\\)({.*?})/g');
    return expression.split(regex).filter((s) => s.length);
  } catch (e) {
    console.error('Lookbehind is not supported in this browser.');
    return [];
  }
}

export function optimizedSequenceToRawSequence(
  sequence: OptimizedKeycodeSequence,
): RawKeycodeSequence {
  return sequence.flatMap((element) => {
    if (element[0] == GroupedKeycodeSequenceAction.Chord) {
      const makeTurnToKeyAction =
        (action: RawKeycodeSequenceAction) => (keycode: string) =>
          [action, keycode] as RawKeycodeSequenceItem;
      return [...element[1]]
        .map(makeTurnToKeyAction(RawKeycodeSequenceAction.Down))
        .concat(
          [...element[1]]
            .reverse()
            .map(makeTurnToKeyAction(RawKeycodeSequenceAction.Up)),
        );
    } else {
      return [element];
    }
  });
}

export function filterSmallOverlaps(
  sequence: RawKeycodeSequence,
): RawKeycodeSequence {
  const mods: Record<string, boolean> = {KC_LSFT: true, KC_RSFT: true};
  let seq = [...sequence];
  for (let index = 0; index + 2 < sequence.length; index++) {
    if (
      seq[index][0] === RawKeycodeSequenceAction.Down &&
      seq[index + 1][0] === RawKeycodeSequenceAction.Delay &&
      seq[index + 2][0] === RawKeycodeSequenceAction.Up &&
      seq[index][1] != seq[index + 2][1] &&
      seq[index + 1][1] < 2000 &&
      seq[index][1] != 'KC_RSFT'
    ) {
      const temp = seq[index];
      seq[index] = seq[index + 2];
      seq[index + 2] = temp;
    }
  }
  return seq;
}

export function filterAllDelays(
  sequence: RawKeycodeSequence,
): RawKeycodeSequence {
  return sequence.filter(
    ([action]) => action !== RawKeycodeSequenceAction.Delay,
  );
}

export function rawSequenceToOptimizedSequence(
  sequence: RawKeycodeSequence,
): OptimizedKeycodeSequence {
  let result: OptimizedKeycodeSequence = [];
  result = convertToTapsAndChords(sequence);
  result = convertToCharacterStreams(result);
  return result;
}

export function convertToTapsAndChords(
  sequence: OptimizedKeycodeSequence,
): OptimizedKeycodeSequence {
  let cat: OptimizedKeycodeSequence = [];
  let keyDownKeycodes: string[] = [];
  let unmatchedKeyDownCount: number = 0;

  // Convert taps to down/up so that chord detection algorithm is simpler
  const seq: OptimizedKeycodeSequence = sequence.reduce((p, n) => {
    if (n[0] === RawKeycodeSequenceAction.Tap) {
      return [
        ...p,
        [RawKeycodeSequenceAction.Down, n[1]],
        [RawKeycodeSequenceAction.Up, n[1]],
      ];
    }
    return [...p, n];
  }, [] as OptimizedKeycodeSequenceItem[]);

  let seq2: OptimizedKeycodeSequence = [];
  seq.forEach((element, index) => {
    // This gets set true while we are iterating over
    // a possible key chord (symmetric nested key downs/key ups)
    let keepGoing = false;
    // Concatenate elements of a possible key chord, if it turns out
    // not possible, then we concatenate this to the output
    cat.push(element);

    if (element[0] === RawKeycodeSequenceAction.Down) {
      // If key down
      if (unmatchedKeyDownCount == keyDownKeycodes.length) {
        // If we have not matched key ups to key downs yet
        // Add to key downs
        keyDownKeycodes.push(element[1] as string);
        unmatchedKeyDownCount++;
        keepGoing = true;
      }
    } else if (element[0] === RawKeycodeSequenceAction.Up) {
      // If key up
      const keyUpKeycode = element[1];
      if (
        keyDownKeycodes.length > 0 &&
        keyUpKeycode === keyDownKeycodes[unmatchedKeyDownCount - 1]
      ) {
        // If it matches last key down
        unmatchedKeyDownCount--;
        if (unmatchedKeyDownCount == 0) {
          // If we have matched all the last key downs.
          // we have a valid key chord, concatenate it
          if (keyDownKeycodes.length === 1) {
            seq2.push([RawKeycodeSequenceAction.Tap, keyDownKeycodes[0]]);
          } else {
            seq2.push([GroupedKeycodeSequenceAction.Chord, keyDownKeycodes]);
          }
          // We don't want this concatenated in the default case below.
          cat = [];
        } else {
          // Still a possible key chord, keep going
          keepGoing = true;
        }
      }
    }

    if (index === seq.length - 1) {
      keepGoing = false;
    }

    if (!keepGoing) {
      seq2.push(...cat);
      cat = [];
      keyDownKeycodes = [];
      unmatchedKeyDownCount = 0;
    }
  });

  // Convert adjacent down/ups to taps
  let seq3: OptimizedKeycodeSequence = [];
  for (let index = 0; index < seq2.length; index++) {
    if (
      index + 1 < seq2.length &&
      seq2[index][0] == RawKeycodeSequenceAction.Down &&
      seq2[index + 1][0] == RawKeycodeSequenceAction.Up &&
      seq2[index][1] === seq2[index + 1][1]
    ) {
      seq3.push([RawKeycodeSequenceAction.Tap, seq2[index][1] as string]);
      index++;
    } else {
      seq3.push(seq2[index]);
    }
  }

  return seq3;
}

const mapKeycodeToCharacterStream: Record<string, string[]> = {
  KC_A: ['a', 'A'],
  KC_B: ['b', 'B'],
  KC_C: ['c', 'C'],
  KC_D: ['d', 'D'],
  KC_E: ['e', 'E'],
  KC_F: ['f', 'F'],
  KC_G: ['g', 'G'],
  KC_H: ['h', 'H'],
  KC_I: ['i', 'I'],
  KC_J: ['j', 'J'],
  KC_K: ['k', 'K'],
  KC_L: ['l', 'L'],
  KC_M: ['m', 'M'],
  KC_N: ['n', 'N'],
  KC_O: ['o', 'O'],
  KC_P: ['p', 'P'],
  KC_Q: ['q', 'Q'],
  KC_R: ['r', 'R'],
  KC_S: ['s', 'S'],
  KC_T: ['t', 'T'],
  KC_U: ['u', 'U'],
  KC_V: ['v', 'V'],
  KC_W: ['w', 'W'],
  KC_X: ['x', 'X'],
  KC_Y: ['y', 'Y'],
  KC_Z: ['z', 'Z'],
  KC_1: ['1', '!'],
  KC_2: ['2', '@'],
  KC_3: ['3', '#'],
  KC_4: ['4', '$'],
  KC_5: ['5', '%'],
  KC_6: ['6', '^'],
  KC_7: ['7', '&'],
  KC_8: ['8', '*'],
  KC_9: ['9', '('],
  KC_0: ['0', ')'],
  KC_SPC: [' ', ' '],
  KC_MINS: ['-', '_'],
  KC_EQL: ['=', '+'],
  KC_LBRC: ['[', '{'],
  KC_RBRC: [']', '}'],
  KC_BSLS: ['\\', '|'],
  KC_SCLN: [';', ':'],
  KC_QUOT: ["'", '"'],
  KC_GRV: ['`', '~'],
  KC_COMM: [',', '<'],
  KC_DOT: ['.', '>'],
  KC_SLSH: ['/', '?'],
};

const mapCharToShiftedChar = Object.values(mapKeycodeToCharacterStream).reduce(
  (p, [n, m]) => {
    return {...p, [n]: m};
  },
  {} as Record<string, string>,
);

// Convert all down actions of characters (i.e. letters, numbers, punctuation)
// into tap actions and throw away the up actions.
export function convertCharacterTaps(
  sequence: RawKeycodeSequence,
): RawKeycodeSequence {
  let result: RawKeycodeSequence = sequence.reduce((p, n) => {
    if (
      n[0] == RawKeycodeSequenceAction.Down &&
      n[1] in mapKeycodeToCharacterStream
    ) {
      return [...p, [RawKeycodeSequenceAction.Tap, n[1]]];
    } else if (
      n[0] == RawKeycodeSequenceAction.Up &&
      n[1] in mapKeycodeToCharacterStream
    ) {
      return p;
    } else {
      return [...p, n];
    }
  }, [] as RawKeycodeSequenceItem[]);
  return result;
}

export function convertToCharacterStreams(
  sequence: OptimizedKeycodeSequence,
): OptimizedKeycodeSequence {
  // Convert "{KC_A}{KC_B}{KC_C}" to "abc"
  // Convert "{KC_LSFT,KC_A}" to "A"
  let seq: OptimizedKeycodeSequence = sequence.reduce((p, n) => {
    let newChars = '';
    if (
      n[0] == RawKeycodeSequenceAction.Tap &&
      n[1] in mapKeycodeToCharacterStream
    ) {
      newChars = mapKeycodeToCharacterStream[n[1]][0];
    } else if (
      n[0] == GroupedKeycodeSequenceAction.Chord &&
      n[1].every(
        (keycode) =>
          keycode in mapKeycodeToCharacterStream ||
          keycode === 'KC_LSFT' ||
          keycode === 'KC_RSFT',
      )
    ) {
      let shift = false;
      newChars = n[1]
        .reduce((p, n) => {
          if (n === 'KC_LSFT' || n === 'KC_RSFT') {
            shift = true;
            return [...p];
          }
          return [...p, mapKeycodeToCharacterStream[n][shift ? 1 : 0]];
        }, [] as string[])
        .join('');
    }

    if (newChars.length > 0) {
      if (
        p[p.length - 1] !== undefined &&
        p[p.length - 1][0] === RawKeycodeSequenceAction.CharacterStream
      ) {
        // append case
        newChars = (p[p.length - 1][1] as string) + newChars;
        return [
          ...p.slice(0, -1),
          [RawKeycodeSequenceAction.CharacterStream, newChars],
        ];
      } else {
        return [...p, [RawKeycodeSequenceAction.CharacterStream, newChars]];
      }
    } else {
      return [...p, n];
    }
  }, [] as OptimizedKeycodeSequenceItem[]);

  // convert "{+KC_LSFT}abc{-KC_LSFT}" into "ABC"
  let seq2: OptimizedKeycodeSequence = [];
  for (let index = 0; index < seq.length; index++) {
    if (
      index + 2 < seq.length &&
      seq[index][0] === RawKeycodeSequenceAction.Down &&
      seq[index + 1][0] === RawKeycodeSequenceAction.CharacterStream &&
      seq[index + 2][0] === RawKeycodeSequenceAction.Up &&
      seq[index][1] === seq[index + 2][1] &&
      (seq[index][1] === 'KC_LSFT' || seq[index][1] === 'KC_RSFT')
    ) {
      const newChars = (seq[index + 1][1] as string)
        .split('')
        .map((char) => mapCharToShiftedChar[char])
        .join('');
      seq2.push([RawKeycodeSequenceAction.CharacterStream, newChars]);
      index += 2;
    } else {
      seq2.push(seq[index]);
    }
  }

  // concatenate adjacent character streams
  const seq3: OptimizedKeycodeSequence = seq2.reduce((p, n) => {
    if (
      n[0] === RawKeycodeSequenceAction.CharacterStream &&
      p[p.length - 1] !== undefined &&
      p[p.length - 1][0] === RawKeycodeSequenceAction.CharacterStream
    ) {
      p[p.length - 1][1] = (p[p.length - 1][1] as string).concat(
        n[1] as string,
      );
      return p;
    }
    return [...p, n];
  }, [] as OptimizedKeycodeSequenceItem[]);

  return seq3;
}

export function sequenceToExpression(
  sequence: OptimizedKeycodeSequence,
): string {
  let result: string[] = [];
  sequence.forEach((element) => {
    switch (element[0]) {
      case RawKeycodeSequenceAction.Tap:
        result.push('{' + element[1] + '}');
        break;
      case RawKeycodeSequenceAction.Down:
        result.push('{+' + element[1] + '}');
        break;
      case RawKeycodeSequenceAction.Up:
        result.push('{-' + element[1] + '}');
        break;
      case RawKeycodeSequenceAction.Delay:
        result.push('{' + element[1] + '}');
        break;
      case GroupedKeycodeSequenceAction.Chord:
        result.push('{' + element[1].join(',') + '}');
        break;
      case RawKeycodeSequenceAction.CharacterStream:
        // Insert escape character \ before {
        result.push((element[1] as string).replace(/{/g, '\\{'));
    }
  });
  return result.join('');
}

export function expressionToSequence(str: string): OptimizedKeycodeSequence {
  let expression: string[] = splitExpression(str);
  let result: OptimizedKeycodeSequence = [];

  expression.forEach((element) => {
    if (/^{.*}$/.test(element)) {
      // If it's a tag with braces
      element = element.slice(1, -1);
      if (/^\d+$/.test(element)) {
        result.push([RawKeycodeSequenceAction.Delay, parseInt(element)]);
      } else {
        // Otherwise handle as a keycode block
        // Test if there's a + or - after the {
        const downOrUpAction = /^[+-]/.test(element)
          ? element.slice(0, 1)
          : null;
        const keycodes = element
          .replace(/^[+-]/, '')
          .split(',')
          .map((keycode) => keycode.trim().toUpperCase())
          .filter((keycode) => keycode.length);
        if (keycodes.length > 0) {
          if (downOrUpAction == null) {
            if (keycodes.length == 1) {
              result.push([RawKeycodeSequenceAction.Tap, keycodes[0]]);
            } else {
              result.push([GroupedKeycodeSequenceAction.Chord, keycodes]);
            }
          } else {
            const action: RawKeycodeSequenceAction =
              downOrUpAction == '+'
                ? RawKeycodeSequenceAction.Down
                : RawKeycodeSequenceAction.Up;
            result.push([action, keycodes[0]]);
          }
        }
      }
    } else {
      // It's a character sequence
      // Remove escape character \ before {
      element = element.replace(/\\{/g, '{');
      result.push([RawKeycodeSequenceAction.CharacterStream, element]);
    }
  });

  return result;
}
