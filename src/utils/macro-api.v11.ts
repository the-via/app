import {byteToKey} from './key';
import {isAutocompleteKeycode} from './autocomplete-keycodes';
import type {KeyboardAPI} from './keyboard-api';
import basicKeyToByte from './key-to-byte.json5';

// Corresponds to 'magic codes' in qmk sendstring
enum KeyAction {
  Tap = 1, // \x01
  Down = 2, // \x02
  Up = 3, // \x03
  Delay = 4, // \x04
}
const KeyActionPrefix = 1; // \x01
const DelayTerminator = 124; // '|';
const MacroTerminator = 0;

interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
}

// Only comma-separated valid keycodes should be allowed in unescaped action blocks: {KC_VALID_KEYCODE, KC_ANOTHER_ONE}
// Empty action blocks can't be persisted, so should fail: {}
export function validateExpression(expression: string): ValidationResult {
  let unclosedBlockRegex, keycodeBlockRegex;

  // Eval the macro regexes to prevent script errors in browsers that don't
  // have support for the negative lookbehind feature.
  // See: https://caniuse.com/js-regexp-lookbehind
  try {
    unclosedBlockRegex = eval('/(?<!\\\\){(?![^{]*})/');
    keycodeBlockRegex = eval('/(?<!\\\\){(.*?)}/g');
  } catch (e) {
    // TODO: Display a message to the user
    console.error('Lookbehind support is not supported in this browser.');
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
    if (/\d+/.test(csv)) {
      if (/\d{5,}/.test(csv)) {
        return {
          isValid: false,
          errorMessage: `Invalid delay: ${csv}. Please use a delay value of 9999 or less.`,
        };
      }
    } else {
      // Otherwise test for keycode expressions
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
  }

  return {
    isValid: true,
    errorMessage: undefined,
  };
}

function getByte(keycode: string): number {
  return basicKeyToByte[keycode.toUpperCase()];
}

function buildKeyActionBytes(keyaction: KeyAction, keycode: string) {
  return [KeyActionPrefix, keyaction, getByte(keycode)];
}

export class MacroAPI {
  constructor(private keyboardApi: KeyboardAPI) {}

  async readMacroExpressions(): Promise<string[]> {
    const bytes = await this.keyboardApi.getMacroBytes();
    const macroCount = await this.keyboardApi.getMacroCount();

    let macroId = 0;
    let i = 0;
    const expressions: string[] = [];
    let currentExpression = [];
    let currentChord = [];

    // If macroCount is 0, macros are disabled
    if (macroCount === 0) {
      throw Error('Macros are disabled');
    }

    while (i < bytes.length && macroId < macroCount) {
      let byte = bytes[i];
      switch (byte) {
        case MacroTerminator:
          expressions[macroId] = currentExpression.join('');
          macroId++;
          currentExpression = [];
          break;
        case KeyActionPrefix:
          byte = bytes[++i]; // select keyaction from next byte
          switch (byte) {
            case KeyAction.Tap: // Encode as {KEYCODE}
              byte = bytes[++i]; // Skip the key action
              currentExpression.push(`{${(byteToKey as any)[byte]}}`);
              break;
            case KeyAction.Down: // Encode sequential Keydowns as {KEYCODE,KEYCODE,KEYCODE}
              byte = bytes[++i]; // Skip the key action
              currentChord.push((byteToKey as any)[byte]);
              break;
            case KeyAction.Up: // Seek to the last keyup and write the keydown stack
              while (
                bytes[i + 2] === KeyActionPrefix &&
                bytes[i + 3] === KeyAction.Up &&
                i < bytes.length
              ) {
                // Peek ahead for another keyup
                i += 3;
              }
              currentExpression.push(`{${currentChord.join(',')}}`);

              currentChord = []; // reset chord
              i++; // Skip the key action
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

  // TODO: limit delay to 4 digits max

  async writeMacroExpressions(expressions: string[]) {
    const macroBytes = expressions.flatMap((expression) => {
      const validationResult = validateExpression(expression);
      if (!validationResult.isValid) {
        throw validationResult.errorMessage;
      }
      const bytes: number[] = [];
      let i = 0;
      while (i < expression.length) {
        const char = expression[i];
        // Check for keycode block, peek behind to make sure there's no escape char \
        if (char === '{' && expression[i - 1] !== '\\') {
          const keyActionEnd = expression.indexOf('}', i + 1);
          if (keyActionEnd < 0) {
            throw new Error("Syntax error: KeyAction block must end with '}'");
          }
          const block = expression.substr(i + 1, keyActionEnd - i - 1);
          // If it's a delay value
          if (/\d+/.test(block)) {
            bytes.push(
              KeyActionPrefix,
              KeyAction.Delay,
              ...block.split('').map((char) => char.charCodeAt(0)),
              DelayTerminator,
            );
          } else {
            // Otherwise handle as a keycode block
            const keycodes = block
              .split(',')
              .map((keycode) => keycode.trim())
              .filter((keycode) => keycode.length);
            switch (keycodes.length) {
              case 0:
                throw new Error(
                  'Syntax error: Keycodes expected within block. Use \\{} to define literal {}',
                );
              case 1:
                bytes.push(...buildKeyActionBytes(KeyAction.Tap, keycodes[0]));
                break;
              default:
                // Keydowns
                keycodes.forEach((keycode) => {
                  bytes.push(...buildKeyActionBytes(KeyAction.Down, keycode));
                });
                // Symmetrical Keyups
                keycodes.reverse().forEach((keycode) => {
                  bytes.push(...buildKeyActionBytes(KeyAction.Up, keycode));
                });
                break;
            }
          }
          i = keyActionEnd; // fastforward cursor to end of action block
        } else if (char === '\\' && expression[i + 1] === '{') {
          // Skip if this is an escape char for {
        } else {
          bytes.push(char.charCodeAt(0));
        }

        i++;
      }

      bytes.push(MacroTerminator);
      return bytes;
    });

    await this.keyboardApi.setMacroBytes(macroBytes);
  }
}
