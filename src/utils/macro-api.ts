import {byteToKey, keycodesList} from './key';
import {Device, KeyboardAPI} from './keyboard-api';
import basicKeyToByte from './key-to-byte.json5';

// Corresponds to 'magic codes' in qmk sendstring
enum KeyAction {
  Tap = 1, // \x01
  Down = 2, // \x02
  Up = 3, // \x03
}
const MacroTerminator = 0;

interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
}

// Only comma-separated valid keycodes should be allowed in unescaped action blocks: {KC_VALID_KEYCODE, KC_ANOTHER_ONE}
// Empty action blocks can't be persisted, so should fail: {}
export function validateExpression(expression: string): ValidationResult {
  // Check for unclosed action blocks
  if (expression.match(/(?<!\\)\{(?![^{]*})/)) {
    return {
      isValid: false,
      errorMessage:
        "Looks like a keycode block - {} - is unclosed! Are you missing an '}'?",
    };
  }

  // Validate each block of keyactions
  const keycodeBlockRegex = /(?<!\\){(.*?)}/g;
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
      .filter((keycode) => keycode.trim().length && !isMacroKeycode(keycode));
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

function isMacroKeycode(keycode: string): boolean {
  const key = keycode.toUpperCase();
  return !!(macroKeycodes as any)[key];
}

function getByte(keycode: string): number {
  return basicKeyToByte[keycode.toUpperCase()];
}

export const getMacroApi = (device: Device) => {
  if (!device) {
    return undefined;
  }
  const keyboardApi = new KeyboardAPI(device);
  if (!keyboardApi) {
    return undefined;
  }
  return new MacroAPI(keyboardApi);
};

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
          currentExpression.push(`{${(byteToKey as any)[byte]}}`);
          break;
        case KeyAction.Down: // Encode sequential Keydowns as {KEYCODE,KEYCODE,KEYCODE}
          byte = bytes[++i]; // Skip the key action
          currentChord.push((byteToKey as any)[byte]);
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
              bytes.push(getByte(keycodes[0]));
              break;
            default:
              // Keydowns
              keycodes.forEach((keycode) => {
                bytes.push(KeyAction.Down);
                bytes.push(getByte(keycode));
              });
              // Symmetrical Keyups
              keycodes.reverse().forEach((keycode) => {
                bytes.push(KeyAction.Up);
                bytes.push(getByte(keycode));
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

const macroKeycodes = {
  KC_NO: true,
  KC_A: true,
  KC_B: true,
  KC_C: true,
  KC_D: true,
  KC_E: true,
  KC_F: true,
  KC_G: true,
  KC_H: true,
  KC_I: true,
  KC_J: true,
  KC_K: true,
  KC_L: true,
  KC_M: true,
  KC_N: true,
  KC_O: true,
  KC_P: true,
  KC_Q: true,
  KC_R: true,
  KC_S: true,
  KC_T: true,
  KC_U: true,
  KC_V: true,
  KC_W: true,
  KC_X: true,
  KC_Y: true,
  KC_Z: true,
  KC_1: true,
  KC_2: true,
  KC_3: true,
  KC_4: true,
  KC_5: true,
  KC_6: true,
  KC_7: true,
  KC_8: true,
  KC_9: true,
  KC_0: true,
  KC_ENT: true,
  KC_ESC: true,
  KC_BSPC: true,
  KC_TAB: true,
  KC_SPC: true,
  KC_MINS: true,
  KC_EQL: true,
  KC_LBRC: true,
  KC_RBRC: true,
  KC_BSLS: true,
  KC_NUHS: true,
  KC_SCLN: true,
  KC_QUOT: true,
  KC_GRV: true,
  KC_COMM: true,
  KC_DOT: true,
  KC_SLSH: true,
  KC_CAPS: true,
  KC_F1: true,
  KC_F2: true,
  KC_F3: true,
  KC_F4: true,
  KC_F5: true,
  KC_F6: true,
  KC_F7: true,
  KC_F8: true,
  KC_F9: true,
  KC_F10: true,
  KC_F11: true,
  KC_F12: true,
  KC_PSCR: true,
  KC_SLCK: true,
  KC_PAUS: true,
  KC_INS: true,
  KC_HOME: true,
  KC_PGUP: true,
  KC_DEL: true,
  KC_END: true,
  KC_PGDN: true,
  KC_RGHT: true,
  KC_LEFT: true,
  KC_DOWN: true,
  KC_UP: true,
  KC_NLCK: true,
  KC_PSLS: true,
  KC_KP_ASTERISK: true,
  KC_PAST: true,
  KC_PPLS: true,
  KC_PENT: true,
  KC_P1: true,
  KC_P2: true,
  KC_P3: true,
  KC_P4: true,
  KC_P5: true,
  KC_P6: true,
  KC_P7: true,
  KC_P8: true,
  KC_P9: true,
  KC_P0: true,
  KC_PDOT: true,
  KC_NUBS: true,
  KC_APP: true,
  KC_POWER: true,
  KC_PEQL: true,
  KC_F13: true,
  KC_F14: true,
  KC_F15: true,
  KC_F16: true,
  KC_F17: true,
  KC_F18: true,
  KC_F19: true,
  KC_F20: true,
  KC_F21: true,
  KC_F22: true,
  KC_F23: true,
  KC_F24: true,
  KC_EXECUTE: true,
  KC_HELP: true,
  KC_MENU: true,
  KC_SELECT: true,
  KC_STOP: true,
  KC_AGAIN: true,
  KC_UNDO: true,
  KC_CUT: true,
  KC_COPY: true,
  KC_PASTE: true,
  KC_FIND: true,
  KC_LCAP: true,
  KC_LNUM: true,
  KC_LSCR: true,
  KC_PCMM: true,
  KC_KP_EQUAL_AS400: true,
  KC_RO: true,
  KC_KANA: true,
  KC_JYEN: true,
  KC_HENK: true,
  KC_MHEN: true,
  KC_INT6: true,
  KC_INT7: true,
  KC_INT8: true,
  KC_INT9: true,
  KC_HAEN: true,
  KC_HANJ: true,
  KC_LANG3: true,
  KC_LANG4: true,
  KC_LANG5: true,
  KC_LANG6: true,
  KC_LANG7: true,
  KC_LANG8: true,
  KC_LANG9: true,
  KC_SYSREQ: true,
  KC_CANCEL: true,
  KC_CLEAR: true,
  KC_PRIOR: true,
  KC_OUT: true,
  KC_OPER: true,
  KC_CLEAR_AGAIN: true,
  KC_CRSEL: true,
  KC_EXSEL: true,

  /* Modifiers */
  KC_LCTL: true,
  KC_LSFT: true,
  KC_LALT: true,
  KC_LGUI: true,
  KC_RCTL: true,
  KC_RSFT: true,
  KC_RALT: true,
  KC_RGUI: true,

  /* System Control */
  KC_PWR: true,
  KC_SLEP: true,
  KC_WAKE: true,

  /* Media Control */
  KC_MUTE: true,
  KC_VOLU: true,
  KC_VOLD: true,
  KC_MNXT: true,
  KC_MPRV: true,
  KC_MSTP: true,
  KC_MPLY: true,
  KC_MSEL: true,
  KC_EJCT: true,
  KC_MAIL: true,
  KC_CALC: true,
  KC_MYCM: true,
  KC_WWW_SEARCH: true,
  KC_WWW_HOME: true,
  KC_WWW_BACK: true,
  KC_WWW_FORWARD: true,
  KC_WWW_STOP: true,
  KC_WWW_REFRESH: true,
  KC_WWW_FAVORITES: true,
  KC_MFFD: true,
  KC_MRWD: true,
};

export const getMacroKeycodes = () =>
  keycodesList.filter((keycode) => !!(macroKeycodes as any)[keycode.code]);
