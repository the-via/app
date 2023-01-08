import {isAutocompleteKeycode} from '../autocomplete-keycodes';
import type {KeyboardAPI} from '../keyboard-api';
import {
  DelayTerminator,
  KeyActionPrefix,
  MacroTerminator,
  KeyAction,
  ValidationResult,
  buildKeyActionBytes,
  IMacroAPI,
} from './macro-api.common';
import {RawKeycodeSequence, RawKeycodeSequenceAction} from './types';

// split "{KC_A}bcd{KC_E}" into "{KC_A}","bcd","{KC_E}"
// handles escaped braces e.g. "\{"
export function splitMacroExpression(expression: string): string[] {
  let regex;
  try {
    regex = eval('/(?<!\\\\)({.*?})/g');
    return expression.split(regex).filter((s) => s.length);
  } catch (e) {
    console.error('Lookbehind is not supported in this browser.');
    return [];
  }
}

// join "{KC_A}","bcd","{KC_E}" into "{KC_A}bcd{KC_E}"
export function joinMacroExpression(expression: string[]): string {
  return expression.join('');
}

// Only comma-separated valid keycodes should be allowed in unescaped action blocks: {KC_VALID_KEYCODE, KC_ANOTHER_ONE}
// Empty action blocks can't be persisted, so should fail: {}
export function validateMacroExpressionV11(
  expression: string,
): ValidationResult {
  let unclosedBlockRegex, keycodeBlockRegex;

  // Eval the macro regexes to prevent script errors in browsers that don't
  // have support for the negative lookbehind feature.
  // See: https://caniuse.com/js-regexp-lookbehind
  try {
    unclosedBlockRegex = eval('/(?<!\\\\){(?![^{]*})/');
    keycodeBlockRegex = eval('/(?<!\\\\){(.*?)}/g');
  } catch (e) {
    console.error('Lookbehind is not supported in this browser.');
    return {
      isValid: false,
      errorMessage:
        "Lookbehind is not supported in this browser.",
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

    // Test if it's a delay expression
    if (/^\d+$/.test(csv)) {
      if (/\d{5,}/.test(csv)) {
        return {
          isValid: false,
          errorMessage: `Invalid delay: ${csv}. Please use a delay value of 9999 or less.`,
        };
      }
    } else {
      // Otherwise test for keycode expressions
      const invalidKeycodes = csv
        .replace(/^[-+]/, '')
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
  }

  return {
    isValid: true,
    errorMessage: undefined,
  };
}

export function simplifyMacroExpression(expression: string): string {
  let result: string = '';
  let cat: string = '';
  let keyDownKeycodes: string[] = [];
  let unmatchedKeyDownCount: number = 0;
  splitMacroExpression(expression).forEach((element) => {
    // This gets set true while we are iterating over
    // a possible key chord (symmetric nested key downs/key ups)
    let keepGoing = false;
    // Concatenate elements of a possible key chord, if it turns out
    // not possible, then we concatenate this to the output
    cat = cat.concat(element);

    if (/^{[+]/.test(element)) {
      // If key down "{+KEYCODE}"
      if (unmatchedKeyDownCount == keyDownKeycodes.length) {
        // If we have not matched key ups to key downs yet
        // Add to key downs
        keyDownKeycodes.push(element.replace(/[{}+]/g, ''));
        unmatchedKeyDownCount++;
        keepGoing = true;
      }
    } else if (/^{[-]/.test(element)) {
      // If key up "{-KEYCODE}"
      const keyUpKeycode = element.replace(/[{}-]/g, '');
      if (
        keyDownKeycodes.length > 0 &&
        keyUpKeycode == keyDownKeycodes[unmatchedKeyDownCount - 1]
      ) {
        // If it matches last key down
        unmatchedKeyDownCount--;
        if (unmatchedKeyDownCount == 0) {
          // If we have matched all the last key downs.
          // we have a valid key chord, concatenate it
          result = result.concat(`{${keyDownKeycodes.join(',')}}`);
          // We don't want this concatenated in the default case below.
          cat = '';
        } else {
          // Still a possible key chord, keep going
          keepGoing = true;
        }
      }
    }

    if (!keepGoing) {
      result = result.concat(cat);
      cat = '';
      keyDownKeycodes = [];
      unmatchedKeyDownCount = 0;
    }
  });

  return result;
}

export class MacroAPIV11 implements IMacroAPI {
  constructor(
    private keyboardApi: KeyboardAPI,
    private basicKeyToByte: Record<string, number>,
    private byteToKey: Record<number, string>,
  ) {}

  async readMacroASTS(): Promise<RawKeycodeSequence[]> {
    const bytes = await this.keyboardApi.getMacroBytes();
    const macroCount = await this.keyboardApi.getMacroCount();

    let macroId = 0;
    let i = 0;
    const expressions: RawKeycodeSequence[] = [];
    let currentExpression = [];

    // If macroCount is 0, macros are disabled
    if (macroCount === 0) {
      throw Error('Macros are disabled');
    }

    while (i < bytes.length && macroId < macroCount) {
      let byte = bytes[i];
      switch (byte) {
        case MacroTerminator:
          expressions[macroId] = [...currentExpression] as RawKeycodeSequence;
          macroId++;
          currentExpression = [];
          break;
        case KeyActionPrefix:
          byte = bytes[++i]; // select keyaction from next byte
          switch (byte) {
            case KeyAction.Tap: // Encode as {KEYCODE}
              byte = bytes[++i]; // Skip the key action
              currentExpression.push([
                RawKeycodeSequenceAction.Tap,
                `${(this.byteToKey as any)[byte]}`,
              ]);
              break;
            case KeyAction.Down: // Encode sequential Keydowns as {KEYCODE,KEYCODE,KEYCODE}
              byte = bytes[++i]; // Skip the key action
              currentExpression.push([
                RawKeycodeSequenceAction.Down,
                `${(this.byteToKey as any)[byte]}`,
              ]);
              break;
            case KeyAction.Up: // Seek to the last keyup and write the keydown stack
              byte = bytes[++i]; // Skip the key action
              currentExpression.push([
                RawKeycodeSequenceAction.Up,
                `${(this.byteToKey as any)[byte]}`,
              ]);
              break;
            case KeyAction.Delay:
              let delayBytes = [];
              byte = bytes[++i];
              while (byte !== DelayTerminator && i < bytes.length) {
                delayBytes.push(byte);
                byte = bytes[++i];
              }
              const delayValue = delayBytes.reduce((acc, byte) => {
                acc += String.fromCharCode(byte);
                return acc;
              }, '');
              currentExpression.push([
                RawKeycodeSequenceAction.Delay,
                parseInt(delayValue),
              ]);
              break;
            default:
              throw `Expected a KeyAction to follow the KeyActionPrefix. Received ${byte} instead.`;
          }
          break;
        default: {
          const char = String.fromCharCode(byte);
          // Escape { with \
          currentExpression.push([RawKeycodeSequenceAction.Character, char]);
          break;
        }
      }
      i++;
    }

    return expressions;
  }

  async readMacroExpressions(): Promise<string[]> {
    const bytes = await this.keyboardApi.getMacroBytes();
    const macroCount = await this.keyboardApi.getMacroCount();

    let macroId = 0;
    let i = 0;
    const expressions: string[] = [];
    let currentExpression = [];

    // If macroCount is 0, macros are disabled
    if (macroCount === 0) {
      throw Error('Macros are disabled');
    }

    while (i < bytes.length && macroId < macroCount) {
      let byte = bytes[i];
      switch (byte) {
        case MacroTerminator:
          expressions[macroId] = simplifyMacroExpression(
            joinMacroExpression(currentExpression),
          );
          macroId++;
          currentExpression = [];
          break;
        case KeyActionPrefix:
          byte = bytes[++i]; // select keyaction from next byte
          switch (byte) {
            case KeyAction.Tap: // Encode as {KEYCODE}
              byte = bytes[++i]; // Skip the key action
              currentExpression.push(`{${(this.byteToKey as any)[byte]}}`);
              break;
            case KeyAction.Down: // Encode as {+KEYCODE}
              byte = bytes[++i]; // Skip the key action
              currentExpression.push(`{+${(this.byteToKey as any)[byte]}}`);
              break;
            case KeyAction.Up: // Encode as {-KEYCODE}
              byte = bytes[++i]; // Skip the key action
              currentExpression.push(`{-${(this.byteToKey as any)[byte]}}`);
              break;
            case KeyAction.Delay:
              let delayBytes = [];
              byte = bytes[++i];
              while (byte !== DelayTerminator && i < bytes.length) {
                delayBytes.push(byte);
                byte = bytes[++i];
              }
              const delayValue = delayBytes.reduce((acc, byte) => {
                acc += String.fromCharCode(byte);
                return acc;
              }, '');
              currentExpression.push(`{${delayValue}}`);
              break;
            default:
              throw `Expected a KeyAction to follow the KeyActionPrefix. Received ${byte} instead.`;
          }
          break;
        default: {
          const char = String.fromCharCode(byte);
          // Escape { with \
          if (char === '{') {
            currentExpression.push('\\');
          }
          currentExpression.push(char);
          break;
        }
      }
      i++;
    }

    return expressions;
  }

  async writeMacroExpressions(expressions: string[]) {
    const macroBytes = expressions.flatMap((expression) => {
      const validationResult = validateMacroExpressionV11(expression);
      if (!validationResult.isValid) {
        throw validationResult.errorMessage;
      }
      const bytes: number[] = [];
      splitMacroExpression(expression).forEach((element) => {
        if (/^{.*}$/.test(element)) {
          // If it's a tag with braces
          element = element.slice(1, -1);
          if (/^\d+$/.test(element)) {
            bytes.push(
              KeyActionPrefix,
              KeyAction.Delay,
              ...element.split('').map((char) => char.charCodeAt(0)),
              DelayTerminator,
            );
          } else {
            // Otherwise handle as a keycode block
            // Test if there's a + or - after the {
            const downOrUpAction = /^[+-]/.test(element) ? element.slice(0,1) : null;
            const keycodes = element
              .replace(/^[+-]/, '')
              .split(',')
              .map((keycode) => keycode.trim())
              .filter((keycode) => keycode.length);

            if (keycodes.length == 0) {
              throw new Error(
                'Syntax error: Keycodes expected within block. Use \\{} to define literal {}',
              );
            }

            if (downOrUpAction == null) {
              if (keycodes.length == 1) {
                bytes.push(
                  ...buildKeyActionBytes(
                    this.basicKeyToByte,
                    KeyAction.Tap,
                    keycodes[0],
                  ),
                );
              } else {
                keycodes.forEach((keycode) => {
                  bytes.push(
                    ...buildKeyActionBytes(
                      this.basicKeyToByte,
                      KeyAction.Down,
                      keycode,
                    ),
                  );
                });
                keycodes.reverse().forEach((keycode) => {
                  bytes.push(
                    ...buildKeyActionBytes(
                      this.basicKeyToByte,
                      KeyAction.Up,
                      keycode,
                    ),
                  );
                });
              }
            } else {
              keycodes.forEach((keycode) => {
                bytes.push(
                  ...buildKeyActionBytes(
                    this.basicKeyToByte,
                    downOrUpAction == '+' ? KeyAction.Down : KeyAction.Up,
                    keycode,
                  ),
                );
              });
            }
          }
        } else {
          element = element.replace(/\\{/g, '{');
          bytes.push(...element.split('').map((char) => char.charCodeAt(0)));
        }
      });

      bytes.push(MacroTerminator);
      return bytes;
    });

    await this.keyboardApi.setMacroBytes(macroBytes);
  }
}
