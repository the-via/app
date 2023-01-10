import {
  GroupedKeycodeSequenceAction,
  OptimizedKeycodeSequence,
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

export function rawSequenceToOptimizedSequence(
  sequence: RawKeycodeSequence,
): OptimizedKeycodeSequence {
  let result: OptimizedKeycodeSequence = [];
  let cat: OptimizedKeycodeSequence = [];
  let keyDownKeycodes: string[] = [];
  let unmatchedKeyDownCount: number = 0;
  sequence.forEach((element) => {
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
          result.push([GroupedKeycodeSequenceAction.Chord, keyDownKeycodes]);
          // We don't want this concatenated in the default case below.
          cat = [];
        } else {
          // Still a possible key chord, keep going
          keepGoing = true;
        }
      }
    }

    if (!keepGoing) {
      result.push(...cat);
      cat = [];
      keyDownKeycodes = [];
      unmatchedKeyDownCount = 0;
    }
  });

  return result;
}

export function sequenceToExpression(
  sequence: OptimizedKeycodeSequence,
): string {
  let result: string[] = [];
  sequence.forEach((element) => {
    const action: number = element[0] as number;
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
