import {isAutocompleteKeycode} from '../autocomplete-keycodes';
import type {KeyboardAPI} from '../keyboard-api';
import {
  getByte,
  IMacroAPI,
  ValidationResult,
  KeyAction,
  MacroTerminator,
} from './macro-api.common';

// Corresponds to 'magic codes' in qmk sendstring
export type MacroValidator = typeof validateMacroExpression;

// Only comma-separated valid keycodes should be allowed in unescaped action blocks: {KC_VALID_KEYCODE, KC_ANOTHER_ONE}
// Empty action blocks can't be persisted, so should fail: {}
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
        case KeyAction.Tap: // Encode as {KEYCODE}
          byte = bytes[++i]; // Skip the key action
          currentExpression.push(`{${(this.byteToKey as any)[byte]}}`);
          break;
        case KeyAction.Down: // Encode sequential Keydowns as {KEYCODE,KEYCODE,KEYCODE}
          byte = bytes[++i]; // Skip the key action
          currentChord.push((this.byteToKey as any)[byte]);
          break;
        case KeyAction.Up: // Seek to the last keyup and write the keydown stack
          while (bytes[i + 2] === KeyAction.Up && i < bytes.length) {
            // Peek ahead for another keyup
            i += 2;
          }
          currentExpression.push(`{${currentChord.join(',')}}`);

          currentChord = []; // reset chord
          i++; // Skip the key action
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
      const validationResult = validateMacroExpression(expression);
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
          const keycodes = expression
            .substr(i + 1, keyActionEnd - i - 1)
            .split(',')
            .map((keycode) => keycode.trim())
            .filter((keycode) => keycode.length);
          switch (keycodes.length) {
            case 0:
              throw new Error(
                'Syntax error: Keycodes expected within block. Use \\{} to define literal {}',
              );
            case 1:
              bytes.push(KeyAction.Tap);
              bytes.push(getByte(this.basicKeyToByte, keycodes[0]));
              break;
            default:
              // Keydowns
              keycodes.forEach((keycode) => {
                bytes.push(KeyAction.Down);
                bytes.push(getByte(this.basicKeyToByte, keycode));
              });
              // Symmetrical Keyups
              keycodes.reverse().forEach((keycode) => {
                bytes.push(KeyAction.Up);
                bytes.push(getByte(this.basicKeyToByte, keycode));
              });
              break;
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
