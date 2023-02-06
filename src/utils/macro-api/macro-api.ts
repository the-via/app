import {isAutocompleteKeycode} from '../autocomplete-keycodes';
import type {KeyboardAPI} from '../keyboard-api';
import {
  IMacroAPI,
  ValidationResult,
  KeyAction,
  MacroTerminator,
} from './macro-api.common';
import {RawKeycodeSequence, RawKeycodeSequenceAction} from './types';

// TODO: Move to IMacroAPI
export function validateMacroExpression(expression: string): ValidationResult {
  let unclosedBlockRegex, keycodeBlockRegex;

  // Eval the macro regexes to prevent script errors in browsers that don't
  // have support for the negative lookbehind feature.
  // See: https://caniuse.com/js-regexp-lookbehind
  try {
    unclosedBlockRegex = eval('/(?<!\\\\){(?![^{]*})/');
    keycodeBlockRegex = eval('/(?<!\\\\){(.*?)}/g');
  } catch (e) {
    // TODO: Display a message to the user
    console.error('Lookbehind is not supported in this browser.');
    return {
      isValid: false,
      errorMessage: 'Lookbehind is not supported in this browser.',
    };
  }

  // Check for unclosed action blocks
  if (expression.match(unclosedBlockRegex)) {
    return {
      isValid: false,
      errorMessage:
        "Looks like a keycode block - {} - is unclosed! Are you missing an '}'?",
    };
  }

  // Validate each block of keyactions
  let groups: RegExpExecArray | null = null;
  while ((groups = keycodeBlockRegex.exec(expression))) {
    const csv = groups[1].replace(/\s+/g, ''); // Remove spaces
    // Empty action blocks {} can't be persisted
    if (!csv.length) {
      return {
        isValid: false,
        errorMessage:
          "Sorry, I can't handle empty {}. Fill them up with keycodes or use \\{} to tell the macro to literally type {}",
      };
    }

    const invalidKeycodes = csv
      .split(',')
      .filter(
        (keycode) => keycode.trim().length && !isAutocompleteKeycode(keycode),
      );
    if (invalidKeycodes.length) {
      return {
        isValid: false,
        errorMessage: `Whoops! Invalid keycodes detected inside {}: ${invalidKeycodes.join(
          ', ',
        )}`,
      };
    }
  }

  return {
    isValid: true,
    errorMessage: undefined,
  };
}

export class MacroAPI implements IMacroAPI {
  constructor(
    private keyboardApi: KeyboardAPI,
    private basicKeyToByte: Record<string, number>,
    private byteToKey: Record<number, string>,
  ) {}

  async readRawKeycodeSequences(): Promise<RawKeycodeSequence[]> {
    const bytes = await this.keyboardApi.getMacroBytes();
    const macroCount = await this.keyboardApi.getMacroCount();

    let macroId = 0;
    let i = 0;
    const sequences: RawKeycodeSequence[] = [];
    let currentSequence: RawKeycodeSequence = [];

    // If macroCount is 0, macros are disabled
    if (macroCount === 0) {
      throw Error('Macros are disabled');
    }

    while (i < bytes.length && macroId < macroCount) {
      let byte = bytes[i];
      switch (byte) {
        case MacroTerminator:
          sequences[macroId] = currentSequence;
          macroId++;
          currentSequence = [];
          break;
        case KeyAction.Tap:
          byte = bytes[++i];
          currentSequence.push([
            RawKeycodeSequenceAction.Tap,
            (this.byteToKey as any)[byte],
          ]);
          break;
        case KeyAction.Down:
          byte = bytes[++i];
          currentSequence.push([
            RawKeycodeSequenceAction.Down,
            (this.byteToKey as any)[byte],
          ]);
          break;
        case KeyAction.Up:
          byte = bytes[++i];
          currentSequence.push([
            RawKeycodeSequenceAction.Up,
            (this.byteToKey as any)[byte],
          ]);
          break;
        default: {
          const char = String.fromCharCode(byte);
          if (
            currentSequence.length &&
            currentSequence[currentSequence.length - 1][0] ===
              RawKeycodeSequenceAction.CharacterStream
          ) {
            currentSequence[currentSequence.length - 1] = [
              RawKeycodeSequenceAction.CharacterStream,
              (currentSequence[currentSequence.length - 1][1] as string) + char,
            ];
          } else {
            currentSequence.push([
              RawKeycodeSequenceAction.CharacterStream,
              char,
            ]);
          }
          break;
        }
      }
      i++;
    }

    return sequences;
  }

  rawKeycodeSequencesToMacroBytes(sequences: RawKeycodeSequence[]): number[] {
    return sequences.flatMap((sequence) => {
      const bytes: number[] = [];
      sequence.forEach((element) => {
        switch (element[0]) {
          case RawKeycodeSequenceAction.Tap:
            bytes.push(KeyAction.Tap, this.basicKeyToByte[element[1]]);
            break;
          case RawKeycodeSequenceAction.Up:
            bytes.push(KeyAction.Up, this.basicKeyToByte[element[1]]);
            break;
          case RawKeycodeSequenceAction.Down:
            bytes.push(KeyAction.Down, this.basicKeyToByte[element[1]]);
            break;
          case RawKeycodeSequenceAction.Delay:
            // Unsupported
            break;
          case RawKeycodeSequenceAction.CharacterStream:
            bytes.push(
              ...(element[1] as string)
                .split('')
                .map((char) => char.charCodeAt(0)),
            );
            break;
        }
      });

      bytes.push(MacroTerminator);
      return bytes;
    });
  }

  async writeRawKeycodeSequences(sequences: RawKeycodeSequence[]) {
    const macroBytes = this.rawKeycodeSequencesToMacroBytes(sequences);
    await this.keyboardApi.setMacroBytes(macroBytes);
  }
}
