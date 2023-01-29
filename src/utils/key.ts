import {
  advancedKeycodeToString,
  advancedStringToKeycode,
} from './advanced-keys';
import {
  BuiltInKeycodeModule,
  VIADefinitionV3,
  VIADefinitionV2,
  getLightingDefinition,
  KeycodeType,
} from '@the-via/reader';
import type {KeycodeDict} from './keycode-dict';

export interface IKeycode {
  name: string;
  code: string;
  title?: string;
  shortName?: string;
  keys?: string;
  width?: number;
  type?: 'container' | 'text' | 'layer';
  layer?: number;
}

export interface IKeycodeMenu {
  label: string;
  keycodes: IKeycode[];
  width?: 'label';
  detailed?: string;
}

// Tests if label is an alpha
export function isAlpha(label: string) {
  return /[A-Za-z]/.test(label) && label.length === 1;
}

// Tests if label is a number
export function isNumericOrShiftedSymbol(label: string) {
  const numbersTop = '!@#$%^&*()_+|~{}:"<>?1234567890'.split('');
  return label.length === 1 && numbersTop.includes(label[0]);
}

// Tests if label is a number
export function isNumericSymbol(label: string) {
  const numbersTop = '!@#$%^&*()_+|~{}:"<>?'.split('');
  return label.length !== 1 && numbersTop.includes(label[0]);
}

// Maps the byte value to the keycode
export function getByteForCode(code: string, keycodeDict: KeycodeDict) {
  const byte: number | undefined = keycodeDict.keycodes[code]?.byte;
  if (byte !== undefined) {
    return byte;
  } else if (isLayerCode(code)) {
    return getByteForLayerCode(code, keycodeDict);
  } else if (advancedStringToKeycode(code, keycodeDict) !== null) {
    return advancedStringToKeycode(code, keycodeDict);
  }
  throw `Could not find byte for ${code}`;
}

function isLayerCode(code: string) {
  return /([A-Za-z]+)\((\d+)\)/.test(code);
}

// TODO: this is redundant with advanced keycode parsing
// should refactor both together
function getByteForLayerCode(
  keycode: string,
  keycodeDict: KeycodeDict,
): number {
  const keycodeMatch = keycode.match(/([A-Za-z]+)\((\d+)\)/);
  if (keycodeMatch) {
    const [, code, layer] = keycodeMatch;
    const numLayer = parseInt(layer);
    switch (code) {
      case 'TO': {
        return Math.min(
          keycodeDict.ranges.QK_TO + numLayer,
          keycodeDict.ranges.QK_TO_MAX,
        );
      }
      case 'MO': {
        return Math.min(
          keycodeDict.ranges.QK_MOMENTARY + numLayer,
          keycodeDict.ranges.QK_MOMENTARY_MAX,
        );
      }
      case 'DF': {
        return Math.min(
          keycodeDict.ranges.QK_DEF_LAYER + numLayer,
          keycodeDict.ranges.QK_DEF_LAYER_MAX,
        );
      }
      case 'TG': {
        return Math.min(
          keycodeDict.ranges.QK_TOGGLE_LAYER + numLayer,
          keycodeDict.ranges.QK_TOGGLE_LAYER_MAX,
        );
      }
      case 'OSL': {
        return Math.min(
          keycodeDict.ranges.QK_ONE_SHOT_LAYER + numLayer,
          keycodeDict.ranges.QK_ONE_SHOT_LAYER_MAX,
        );
      }
      case 'TT': {
        return Math.min(
          keycodeDict.ranges.QK_LAYER_TAP_TOGGLE + numLayer,
          keycodeDict.ranges.QK_LAYER_TAP_TOGGLE_MAX,
        );
      }
      case 'CUSTOM': {
        return Math.min(
          keycodeDict.ranges.QK_KB + numLayer,
          keycodeDict.ranges.QK_KB_MAX,
        );
      }
      case 'MACRO': {
        return Math.min(
          keycodeDict.ranges.QK_MACRO + numLayer,
          keycodeDict.ranges.QK_MACRO_MAX,
        );
      }
      default: {
        throw new Error('Incorrect code');
      }
    }
  }
  throw new Error('No match found');
}

// TODO: this is redundant with advanced keycode parsing
// should refactor both together
function getCodeForLayerByte(byte: number, keycodeDict: KeycodeDict) {
  if (
    keycodeDict.ranges.QK_TO <= byte &&
    keycodeDict.ranges.QK_TO_MAX >= byte
  ) {
    const layer = byte - keycodeDict.ranges.QK_TO;
    return `TO(${layer})`;
  } else if (
    keycodeDict.ranges.QK_MOMENTARY <= byte &&
    keycodeDict.ranges.QK_MOMENTARY_MAX >= byte
  ) {
    const layer = byte - keycodeDict.ranges.QK_MOMENTARY;
    return `MO(${layer})`;
  } else if (
    keycodeDict.ranges.QK_DEF_LAYER <= byte &&
    keycodeDict.ranges.QK_DEF_LAYER_MAX >= byte
  ) {
    const layer = byte - keycodeDict.ranges.QK_DEF_LAYER;
    return `DF(${layer})`;
  } else if (
    keycodeDict.ranges.QK_TOGGLE_LAYER <= byte &&
    keycodeDict.ranges.QK_TOGGLE_LAYER_MAX >= byte
  ) {
    const layer = byte - keycodeDict.ranges.QK_TOGGLE_LAYER;
    return `TG(${layer})`;
  } else if (
    keycodeDict.ranges.QK_ONE_SHOT_LAYER <= byte &&
    keycodeDict.ranges.QK_ONE_SHOT_LAYER_MAX >= byte
  ) {
    const layer = byte - keycodeDict.ranges.QK_ONE_SHOT_LAYER;
    return `OSL(${layer})`;
  } else if (
    keycodeDict.ranges.QK_LAYER_TAP_TOGGLE <= byte &&
    keycodeDict.ranges.QK_LAYER_TAP_TOGGLE_MAX >= byte
  ) {
    const layer = byte - keycodeDict.ranges.QK_LAYER_TAP_TOGGLE;
    return `TT(${layer})`;
  } else if (
    keycodeDict.ranges.QK_KB <= byte &&
    keycodeDict.ranges.QK_KB_MAX >= byte
  ) {
    const n = byte - keycodeDict.ranges.QK_KB;
    return `USER(${n})`;
  } else if (
    keycodeDict.ranges.QK_MACRO <= byte &&
    keycodeDict.ranges.QK_MACRO_MAX >= byte
  ) {
    const n = byte - keycodeDict.ranges.QK_MACRO;
    return `MACRO(${n})`;
  }
}

export const keycodesList = getKeycodes().reduce<IKeycode[]>(
  (p, n) => p.concat(n.keycodes),
  [],
);

/* SCREAM TEST
export const getByteToKey = (basicKeyToByte: Record<string, number>) =>
  Object.keys(basicKeyToByte).reduce((p, n) => {
    const key = basicKeyToByte[n];
    if (key in p) {
      const basicKeycode = keycodesList.find(({code}) => code === n);
      if (basicKeycode) {
        return {...p, [key]: basicKeycode.code};
      }
      return p;
    }
    return {...p, [key]: n};
  }, {} as {[key: number]: string});
*/

function isLayerKey(byte: number, keycodeDict: KeycodeDict) {
  return [
    [keycodeDict.ranges.QK_TO, keycodeDict.ranges.QK_TO_MAX],
    [keycodeDict.ranges.QK_MOMENTARY, keycodeDict.ranges.QK_MOMENTARY_MAX],
    [keycodeDict.ranges.QK_DEF_LAYER, keycodeDict.ranges.QK_DEF_LAYER_MAX],
    [
      keycodeDict.ranges.QK_TOGGLE_LAYER,
      keycodeDict.ranges.QK_TOGGLE_LAYER_MAX,
    ],
    [
      keycodeDict.ranges.QK_ONE_SHOT_LAYER,
      keycodeDict.ranges.QK_ONE_SHOT_LAYER_MAX,
    ],
    [
      keycodeDict.ranges.QK_LAYER_TAP_TOGGLE,
      keycodeDict.ranges.QK_LAYER_TAP_TOGGLE_MAX,
    ],
    [keycodeDict.ranges.QK_KB, keycodeDict.ranges.QK_KB_MAX],
    [keycodeDict.ranges.QK_MACRO, keycodeDict.ranges.QK_MACRO_MAX],
  ].some((code) => byte >= code[0] && byte <= code[1]);
}

export function getCodeForByte(byte: number, keycodeDict: KeycodeDict) {
  const keycode = keycodeDict.byteToKeycode[byte];
  if (keycode) {
    return keycode;
  } else if (isLayerKey(byte, keycodeDict)) {
    return getCodeForLayerByte(byte, keycodeDict);
  } else if (advancedKeycodeToString(byte, keycodeDict) !== null) {
    return advancedKeycodeToString(byte, keycodeDict);
  } else {
    return '0x' + Number(byte).toString(16);
  }
}

export function keycodeInMaster(keycode: string, keycodeDict: KeycodeDict) {
  return (
    keycode in keycodeDict.keycodes ||
    isLayerCode(keycode) ||
    advancedStringToKeycode(keycode, keycodeDict) !== null
  );
}

function shorten(str: string) {
  return str
    .split(' ')
    .map((word) => word.slice(0, 1) + word.slice(1).replace(/[aeiou ]/gi, ''))
    .join('');
}

export function isCustomKeycodeByte(byte: number, keycodeDict: KeycodeDict) {
  return (
    byte >= keycodeDict.ranges.QK_KB && byte <= keycodeDict.ranges.QK_KB_MAX
  );
}

export function getCustomKeycodeIndex(byte: number, keycodeDict: KeycodeDict) {
  return byte - keycodeDict.ranges.QK_KB;
}

export function isMacroKeycodeByte(byte: number, keycodeDict: KeycodeDict) {
  return (
    byte >= keycodeDict.ranges.QK_MACRO &&
    byte <= keycodeDict.ranges.QK_MACRO_MAX
  );
}

export function getMacroKeycodeIndex(byte: number, keycodeDict: KeycodeDict) {
  return byte - keycodeDict.ranges.QK_MACRO;
}

export function getLabelForByte(
  byte: number,
  size = 100,
  keycodeDict: KeycodeDict,
) {
  const keycode = getCodeForByte(byte, keycodeDict);
  const basicKeycode = keycodesList.find(({code}) => code === keycode);
  if (!basicKeycode) {
    return keycode;
  }
  return getShortNameForKeycode(basicKeycode, size);
}

export function getShortNameForKeycode(keycode: IKeycode, size = 100) {
  const {code, name, shortName} = keycode;
  if (size <= 150 && shortName) {
    return shortName;
  }
  if (size === 100 && name.length > 5) {
    const shortenedName = shorten(name);
    if (!!code) {
      const shortCode = code.replace('KC_', '').replace('_', ' ');
      return shortenedName.length > 4 && shortCode.length < shortenedName.length
        ? shortCode
        : shortenedName;
    }
    return shortenedName;
  }
  return name;
}

export function mapEvtToKeycode(evt: KeyboardEvent): string | undefined {
  const map: Record<string, string> = {
    Digit1: 'KC_1',
    Digit2: 'KC_2',
    Digit3: 'KC_3',
    Digit4: 'KC_4',
    Digit5: 'KC_5',
    Digit6: 'KC_6',
    Digit7: 'KC_7',
    Digit8: 'KC_8',
    Digit9: 'KC_9',
    Digit0: 'KC_0',
    KeyA: 'KC_A',
    KeyB: 'KC_B',
    KeyC: 'KC_C',
    KeyD: 'KC_D',
    KeyE: 'KC_E',
    KeyF: 'KC_F',
    KeyG: 'KC_G',
    KeyH: 'KC_H',
    KeyI: 'KC_I',
    KeyJ: 'KC_J',
    KeyK: 'KC_K',
    KeyL: 'KC_L',
    KeyM: 'KC_M',
    KeyN: 'KC_N',
    KeyO: 'KC_O',
    KeyP: 'KC_P',
    KeyQ: 'KC_Q',
    KeyR: 'KC_R',
    KeyS: 'KC_S',
    KeyT: 'KC_T',
    KeyU: 'KC_U',
    KeyV: 'KC_V',
    KeyW: 'KC_W',
    KeyX: 'KC_X',
    KeyY: 'KC_Y',
    KeyZ: 'KC_Z',
    Comma: 'KC_COMMA',
    Period: 'KC_DOT',
    Semicolon: 'KC_SEMICOLON',
    Quote: 'KC_QUOTE',
    BracketLeft: 'KC_LEFT_BRACKET',
    BracketRight: 'KC_RIGHT_BRACKET',
    Backquote: 'KC_GRAVE',
    Slash: 'KC_SLASH',
    Backspace: 'KC_BACKSPACE',
    Backslash: 'KC_BACKSLASH',
    Minus: 'KC_MINUS',
    Equal: 'KC_EQUAL',
    IntlRo: 'KC_INTERNATIONAL_1',
    IntlYen: 'KC_INTERNATIONAL_3',
    AltLeft: 'KC_LEFT_ALT',
    AltRight: 'KC_RIGHT_ALT',
    CapsLock: 'KC_CAPS_LOCK',
    ControlLeft: 'KC_LEFT_CTRL',
    ControlRight: 'KC_RIGHT_CTRL',
    MetaLeft: 'KC_LEFT_GUI',
    MetaRight: 'KC_RIGHT_GUI',
    OSLeft: 'KC_LEFT_GUI',
    OSRight: 'KC_RIGHT_GUI',
    ShiftLeft: 'KC_LEFT_SHIFT',
    ShiftRight: 'KC_RIGHT_SHIFT',
    ContextMenu: 'KC_APPLICATION',
    Apps: 'KC_APPLICATION',
    Enter: 'KC_ENTER',
    Space: 'KC_SPACE',
    Tab: 'KC_TAB',
    Delete: 'KC_DELETE',
    End: 'KC_END',
    Help: 'KC_HELP',
    Home: 'KC_HOME',
    Insert: 'KC_INSERT',
    PageDown: 'KC_PAGE_UP',
    PageUp: 'KC_PAGE_DOWN',
    ArrowDown: 'KC_DOWN',
    ArrowLeft: 'KC_LEFT',
    ArrowRight: 'KC_RIGHT',
    ArrowUp: 'KC_UP',
    Escape: 'KC_ESCAPE',
    PrintScreen: 'KC_PRINT_SCREEN',
    ScrollLock: 'KC_SCROLL_LOCK',
    Pause: 'KC_PAUSE',
    F1: 'KC_F1',
    F2: 'KC_F2',
    F3: 'KC_F3',
    F4: 'KC_F4',
    F5: 'KC_F5',
    F6: 'KC_F6',
    F7: 'KC_F7',
    F8: 'KC_F8',
    F9: 'KC_F9',
    F10: 'KC_F10',
    F11: 'KC_F11',
    F12: 'KC_F12',
    F13: 'KC_F13',
    F14: 'KC_F14',
    F15: 'KC_F15',
    F16: 'KC_F16',
    F17: 'KC_F17',
    F18: 'KC_F18',
    F19: 'KC_F19',
    F20: 'KC_F20',
    F21: 'KC_F21',
    F22: 'KC_F22',
    F23: 'KC_F23',
    F24: 'KC_F24',
    NumLock: 'KC_NUM_LOCK',
    Numpad0: 'KC_KP_0',
    Numpad1: 'KC_KP_1',
    Numpad2: 'KC_KP_2',
    Numpad3: 'KC_KP_3',
    Numpad4: 'KC_KP_4',
    Numpad5: 'KC_KP_5',
    Numpad6: 'KC_KP_6',
    Numpad7: 'KC_KP_7',
    Numpad8: 'KC_KP_8',
    Numpad9: 'KC_KP_9',
    NumpadAdd: 'KC_KP_PLUS',
    NumpadComma: 'KC_KP_COMMA',
    NumpadDecimal: 'KC_KP_DOT',
    NumpadDivide: 'KC_KP_SLASH',
    NumpadEnter: 'KC_KP_ENTER',
    NumpadEqual: 'KC_PEQL',
    NumpadMultiply: 'KC_KP_ASTERISK',
    NumpadSubtract: 'KC_KP_MINUS',
  };

  return map[evt.code];
}

export function getKeycodeForByte(byte: number, keycodeDict: KeycodeDict) {
  const keycode = keycodeDict.byteToKeycode[byte];
  // TODO: why are we checking keycodesList as well?
  // Is this how we choose a preferred keycode string if multiple?
  const basicKeycode = keycodesList.find(({code}) => code === keycode);
  const advancedString = advancedKeycodeToString(byte, keycodeDict);
  return (basicKeycode && basicKeycode.code) || advancedString || keycode;
}

export function getOtherMenu(keycodeDict: KeycodeDict): IKeycodeMenu {
  const keycodes = Object.keys(keycodeDict.keycodes)
    .filter((key) => !keycodesList.map(({code}) => code).includes(key))
    .map((code) => ({
      name: code.replace(/_/g, ' '),
      code: code,
    }));

  return {
    label: 'Other',
    keycodes,
  };
}

export function buildLayerMenu(): IKeycodeMenu {
  const hardCodedKeycodes: IKeycode[] = [
    {
      name: 'Fn1\n(Fn3)',
      code: 'QK_TRI_LAYER_1_3',
      title: 'Hold = Layer 1, Hold with Fn2 = Layer 3',
      shortName: 'Fn1(3)',
    },
    {
      name: 'Fn2\n(Fn3)',
      code: 'QK_TRI_LAYER_2_3',
      title: 'Hold = Layer 2, Hold with Fn1 = Layer 3',
      shortName: 'Fn2(3)',
    },
    {
      name: 'Space Fn1',
      code: 'LT(1,KC_SPC)',
      title: 'Hold = Layer 1, Tap = Space',
      shortName: 'Spc Fn1',
    },
    {
      name: 'Space Fn2',
      code: 'LT(2,KC_SPC)',
      title: 'Hold = Layer 2, Tap = Space',
      shortName: 'Spc Fn2',
    },
    {
      name: 'Space Fn3',
      code: 'LT(3,KC_SPC)',
      title: 'Hold = Layer 3, Tap = Space',
      shortName: 'Spc Fn3',
    },
  ];

  const menu: IKeycodeMenu = {
    label: 'Layers',
    width: 'label',
    keycodes: [
      {
        name: 'MO',
        code: 'MO(layer)',
        type: 'layer',
        layer: 0,
        title: 'Momentary turn layer on',
      },
      {
        name: 'TG',
        code: 'TG(layer)',
        type: 'layer',
        layer: 0,
        title: 'Toggle layer on/off',
      },
      {
        name: 'TT',
        code: 'TT(layer)',
        type: 'layer',
        layer: 0,
        title:
          "Normally acts like MO unless it's tapped multple times which toggles layer on",
      },
      {
        name: 'OSL',
        code: 'OSL(layer)',
        type: 'layer',
        layer: 0,
        title: 'Switch to layer for one keypress',
      },
      {
        name: 'TO',
        code: 'TO(layer)',
        type: 'layer',
        layer: 0,
        title: 'Turn on layer when pressed',
      },
      {
        name: 'DF',
        code: 'DF(layer)',
        type: 'layer',
        layer: 0,
        title: 'Sets the default layer',
      },
    ],
  };

  // Statically generate layer codes from 0-9 instead of making it an input
  return {
    ...menu,
    keycodes: [
      ...hardCodedKeycodes,
      ...menu.keycodes.flatMap((keycode) => {
        let res: IKeycode[] = [];
        for (let idx = 0; idx < 10; idx++) {
          const newTitle = (keycode.title || '').replace(
            'layer',
            `layer ${idx}`,
          );
          const newCode = keycode.code.replace('layer', `${idx}`);
          const newName = keycode.name + `(${idx})`;
          res = [
            ...res,
            {...keycode, name: newName, title: newTitle, code: newCode},
          ];
        }
        return res;
      }),
    ],
  };
}

export function getKeycodes(): IKeycodeMenu[] {
  return [
    {
      label: 'Basic',
      keycodes: [
        {name: '', code: 'KC_NO', title: 'Nothing'},
        {name: '▽', code: 'KC_TRANSPARENT', title: 'Pass-through'},
        // TODO: remove "shortName" when multiline keycap labels are working
        {name: 'Esc', code: 'KC_ESCAPE', keys: 'esc'},
        {name: 'A', code: 'KC_A', keys: 'a'},
        {name: 'B', code: 'KC_B', keys: 'b'},
        {name: 'C', code: 'KC_C', keys: 'c'},
        {name: 'D', code: 'KC_D', keys: 'd'},
        {name: 'E', code: 'KC_E', keys: 'e'},
        {name: 'F', code: 'KC_F', keys: 'f'},
        {name: 'G', code: 'KC_G', keys: 'g'},
        {name: 'H', code: 'KC_H', keys: 'h'},
        {name: 'I', code: 'KC_I', keys: 'i'},
        {name: 'J', code: 'KC_J', keys: 'j'},
        {name: 'K', code: 'KC_K', keys: 'k'},
        {name: 'L', code: 'KC_L', keys: 'l'},
        {name: 'M', code: 'KC_M', keys: 'm'},
        {name: 'N', code: 'KC_N', keys: 'n'},
        {name: 'O', code: 'KC_O', keys: 'o'},
        {name: 'P', code: 'KC_P', keys: 'p'},
        {name: 'Q', code: 'KC_Q', keys: 'q'},
        {name: 'R', code: 'KC_R', keys: 'r'},
        {name: 'S', code: 'KC_S', keys: 's'},
        {name: 'T', code: 'KC_T', keys: 't'},
        {name: 'U', code: 'KC_U', keys: 'u'},
        {name: 'V', code: 'KC_V', keys: 'v'},
        {name: 'W', code: 'KC_W', keys: 'w'},
        {name: 'X', code: 'KC_X', keys: 'x'},
        {name: 'Y', code: 'KC_Y', keys: 'y'},
        {name: 'Z', code: 'KC_Z', keys: 'z'},
        {name: '!\n1', code: 'KC_1', keys: '1'},
        {name: '@\n2', code: 'KC_2', keys: '2'},
        {name: '#\n3', code: 'KC_3', keys: '3'},
        {name: '$\n4', code: 'KC_4', keys: '4'},
        {name: '%\n5', code: 'KC_5', keys: '5'},
        {name: '^\n6', code: 'KC_6', keys: '6'},
        {name: '&\n7', code: 'KC_7', keys: '7'},
        {name: '*\n8', code: 'KC_8', keys: '8'},
        {name: '(\n9', code: 'KC_9', keys: '9'},
        {name: ')\n0', code: 'KC_0', keys: '0'},
        {name: '_\n-', code: 'KC_MINUS', keys: '-'},
        {name: '+\n=', code: 'KC_EQUAL', keys: '='},
        {name: '~\n`', code: 'KC_GRAVE', keys: '`'},
        {name: '{\n[', code: 'KC_LEFT_BRACKET', keys: '['},
        {name: '}\n]', code: 'KC_RIGHT_BRACKET', keys: ']'},
        {name: '|\n\\', code: 'KC_BACKSLASH', keys: '\\', width: 1500},
        {name: ':\n;', code: 'KC_SEMICOLON', keys: ';'},
        {name: '"\n\'', code: 'KC_QUOTE', keys: "'"},
        {name: '<\n,', code: 'KC_COMMA', keys: ','},
        {name: '>\n.', code: 'KC_DOT', keys: '.'},
        {name: '?\n/', code: 'KC_SLASH', keys: '/'},
        //{name: '=', code: 'KC_PEQL'},
        //{name: ',', code: 'KC_PCMM'},
        {name: 'F1', code: 'KC_F1'},
        {name: 'F2', code: 'KC_F2'},
        {name: 'F3', code: 'KC_F3'},
        {name: 'F4', code: 'KC_F4'},
        {name: 'F5', code: 'KC_F5'},
        {name: 'F6', code: 'KC_F6'},
        {name: 'F7', code: 'KC_F7'},
        {name: 'F8', code: 'KC_F8'},
        {name: 'F9', code: 'KC_F9'},
        {name: 'F10', code: 'KC_F10'},
        {name: 'F11', code: 'KC_F11'},
        {name: 'F12', code: 'KC_F12'},
        {name: 'Print Screen', code: 'KC_PRINT_SCREEN', shortName: 'Print'},
        {name: 'Scroll Lock', code: 'KC_SCROLL_LOCK', shortName: 'Scroll'},
        {name: 'Pause', code: 'KC_PAUSE'},
        {name: 'Tab', code: 'KC_TAB', keys: 'tab', width: 1500},
        {
          name: 'Backspace',
          code: 'KC_BACKSPACE',
          keys: 'backspace',
          width: 2000,
          shortName: 'Bksp',
        },
        {name: 'Insert', code: 'KC_INSERT', keys: 'insert', shortName: 'Ins'},
        {name: 'Del', code: 'KC_DELETE', keys: 'delete'},
        {name: 'Home', code: 'KC_HOME', keys: 'home'},
        {name: 'End', code: 'KC_END', keys: 'end'},
        {
          name: 'Page Up',
          code: 'KC_PAGE_UP',
          keys: 'pageup',
          shortName: 'PgUp',
        },
        {
          name: 'Page Down',
          code: 'KC_PAGE_DOWN',
          keys: 'pagedown',
          shortName: 'PgDn',
        },
        {
          name: 'Num\nLock',
          code: 'KC_NUM_LOCK',
          keys: 'num',
          shortName: 'N.Lck',
        },
        {
          name: 'Caps Lock',
          code: 'KC_CAPS_LOCK',
          keys: 'caps_lock',
          width: 1750,
        },
        {name: 'Enter', code: 'KC_ENTER', keys: 'enter', width: 2250},
        {name: '1', code: 'KC_KP_1', keys: 'num_1', title: 'Numpad 1'},
        {name: '2', code: 'KC_KP_2', keys: 'num_2', title: 'Numpad 2'},
        {name: '3', code: 'KC_KP_3', keys: 'num_3', title: 'Numpad 3'},
        {name: '4', code: 'KC_KP_4', keys: 'num_4', title: 'Numpad 4'},
        {name: '5', code: 'KC_KP_5', keys: 'num_5', title: 'Numpad 5'},
        {name: '6', code: 'KC_KP_6', keys: 'num_6', title: 'Numpad 6'},
        {name: '7', code: 'KC_KP_7', keys: 'num_7', title: 'Numpad 7'},
        {name: '8', code: 'KC_KP_8', keys: 'num_8', title: 'Numpad 8'},
        {name: '9', code: 'KC_KP_9', keys: 'num_9', title: 'Numpad 9'},
        {
          name: '0',
          code: 'KC_KP_0',
          width: 2000,
          keys: 'num_0',
          title: 'Numpad 0',
        },
        {name: '/', code: 'KC_KP_SLASH', keys: 'num_divide', title: 'Numpad /'},
        {
          name: '*',
          code: 'KC_KP_ASTERISK',
          keys: 'num_multiply',
          title: 'Numpad *',
        },
        {
          name: '-',
          code: 'KC_KP_MINUS',
          keys: 'num_subtract',
          title: 'Numpad -',
        },
        {name: '+', code: 'KC_KP_PLUS', keys: 'num_add', title: 'Numpad +'},
        {name: '.', code: 'KC_KP_DOT', keys: 'num_decimal', title: 'Numpad .'},
        {
          name: 'Num\nEnter',
          code: 'KC_KP_ENTER',
          shortName: 'N.Ent',
          title: 'Numpad Enter',
        },
        {
          name: 'Left Shift',
          code: 'KC_LEFT_SHIFT',
          keys: 'shift',
          width: 2250,
          shortName: 'LShft',
        },
        {
          name: 'Right Shift',
          code: 'KC_RIGHT_SHIFT',
          width: 2750,
          shortName: 'RShft',
        },
        {name: 'Left Ctrl', code: 'KC_LEFT_CTRL', keys: 'ctrl', width: 1250},
        {
          name: 'Right Ctrl',
          code: 'KC_RIGHT_CTRL',
          width: 1250,
          shortName: 'RCtl',
        },
        {
          name: 'Left Win',
          code: 'KC_LEFT_GUI',
          keys: 'cmd',
          width: 1250,
          shortName: 'LWin',
        },
        {
          name: 'Right Win',
          code: 'KC_RIGHT_GUI',
          width: 1250,
          shortName: 'RWin',
        },
        {
          name: 'Left Alt',
          code: 'KC_LEFT_ALT',
          keys: 'alt',
          width: 1250,
          shortName: 'LAlt',
        },
        {
          name: 'Right Alt',
          code: 'KC_RIGHT_ALT',
          width: 1250,
          shortName: 'RAlt',
        },
        {name: 'Space', code: 'KC_SPACE', keys: 'space', width: 6250},
        {name: 'Menu', code: 'KC_APPLICATION', width: 1250, shortName: 'RApp'},
        {name: 'Left', code: 'KC_LEFT', keys: 'left', shortName: '←'},
        {name: 'Down', code: 'KC_DOWN', keys: 'down', shortName: '↓'},
        {name: 'Up', code: 'KC_UP', keys: 'up', shortName: '↑'},
        {name: 'Right', code: 'KC_RIGHT', keys: 'right', shortName: '→'},
      ],
    },
    {
      label: 'Lighting',
      width: 'label',
      keycodes: [
        {name: 'BR -', code: 'BR_DEC', title: 'Brightness -'},
        {name: 'BR +', code: 'BR_INC', title: 'Brightness +'},
        {name: 'EF -', code: 'EF_DEC', title: 'Effect -'},
        {name: 'EF +', code: 'EF_INC', title: 'Effect +'},
        {name: 'ES -', code: 'ES_DEC', title: 'Effect Speed -'},
        {name: 'ES +', code: 'ES_INC', title: 'Effect Speed +'},
        {name: 'H1 -', code: 'H1_DEC', title: 'Color1 Hue -'},
        {name: 'H1 +', code: 'H1_INC', title: 'Color1 Hue +'},
        {name: 'H2 -', code: 'H2_DEC', title: 'Color2 Hue -'},
        {name: 'H2 +', code: 'H2_INC', title: 'Color2 Hue +'},
        {name: 'S1 -', code: 'S1_DEC', title: 'Color1 Sat -'},
        {name: 'S1 +', code: 'S1_INC', title: 'Color1 Sat +'},
        {name: 'S2 -', code: 'S2_DEC', title: 'Color2 Sat -'},
        {name: 'S2 +', code: 'S2_INC', title: 'Color2 Sat +'},
      ],
    },
    {
      label: 'Media',
      width: 'label',
      keycodes: [
        {name: 'Vol -', code: 'KC_AUDIO_VOL_DOWN', title: 'Volume Down'},
        {name: 'Vol +', code: 'KC_AUDIO_VOL_UP', title: 'Volume Up'},
        {name: 'Mute', code: 'KC_AUDIO_MUTE', title: 'Mute Audio'},
        {name: 'Play', code: 'KC_MEDIA_PLAY_PAUSE', title: 'Play/Pause'},
        {name: 'Media Stop', code: 'KC_MEDIA_STOP', title: 'Media Stop'},
        {
          name: 'Previous',
          code: 'KC_MEDIA_PREV_TRACK',
          title: 'Media Previous',
        },
        {name: 'Next', code: 'KC_MEDIA_NEXT_TRACK', title: 'Media Next'},
        {name: 'Rewind', code: 'KC_MEDIA_REWIND', title: 'Rewind'},
        {
          name: 'Fast Forward',
          code: 'KC_MEDIA_FAST_FORWARD',
          title: 'Fast Forward',
        },
        {name: 'Select', code: 'KC_MEDIA_SELECT', title: 'Media Select'},
        {name: 'Eject', code: 'KC_MEDIA_EJECT', title: 'Media Eject'},
      ],
    },
    {
      label: 'Macro',
      width: 'label',
      keycodes: [
        {name: 'M0', code: 'MACRO(0)', title: 'Macro 0'},
        {name: 'M1', code: 'MACRO(1)', title: 'Macro 1'},
        {name: 'M2', code: 'MACRO(2)', title: 'Macro 2'},
        {name: 'M3', code: 'MACRO(3)', title: 'Macro 3'},
        {name: 'M4', code: 'MACRO(4)', title: 'Macro 4'},
        {name: 'M5', code: 'MACRO(5)', title: 'Macro 5'},
        {name: 'M6', code: 'MACRO(6)', title: 'Macro 6'},
        {name: 'M7', code: 'MACRO(7)', title: 'Macro 7'},
        {name: 'M8', code: 'MACRO(8)', title: 'Macro 8'},
        {name: 'M9', code: 'MACRO(9)', title: 'Macro 9'},
        {name: 'M10', code: 'MACRO(10)', title: 'Macro 10'},
        {name: 'M11', code: 'MACRO(11)', title: 'Macro 11'},
        {name: 'M12', code: 'MACRO(12)', title: 'Macro 12'},
        {name: 'M13', code: 'MACRO(13)', title: 'Macro 13'},
        {name: 'M14', code: 'MACRO(14)', title: 'Macro 14'},
        {name: 'M15', code: 'MACRO(15)', title: 'Macro 15'},
      ],
    },
    buildLayerMenu(),
    {
      label: 'Mod+_',
      width: 'label',
      detailed: '(A = Alt, C = Control, G = Windows/Command, S = Shift)',
      keycodes: [
        {name: 'LSft', code: 'LSFT(kc)', type: 'container'},
        {name: 'LCtl', code: 'LCTL(kc)', type: 'container'},
        {name: 'LAlt', code: 'LALT(kc)', type: 'container'},
        {name: 'LGui', code: 'LGUI(kc)', type: 'container'},
        {name: 'RSft', code: 'RSFT(kc)', type: 'container'},
        {name: 'RCtl', code: 'RCTL(kc)', type: 'container'},
        {name: 'RAlt', code: 'RALT(kc)', type: 'container'},
        {name: 'RGui', code: 'RGUI(kc)', type: 'container'},
        {
          name: 'Hyper',
          code: 'HYPR(kc)',
          type: 'container',
          title: 'LCTL + LSFT + LALT + LGUI',
        },
        {
          name: 'Meh',
          code: 'MEH(kc)',
          type: 'container',
          title: 'LCTL + LSFT + LALT',
        },
        {
          name: 'LCAG',
          code: 'LCAG(kc)',
          type: 'container',
          title: 'LCTL + LALT + LGUI',
        },
        {
          name: 'ALTG',
          code: 'ALTG(kc)',
          type: 'container',
          title: 'RCTL + RALT',
        },
        {
          name: 'SGUI',
          code: 'SCMD(kc)',
          type: 'container',
          title: 'LGUI + LSFT',
        },
        {name: 'LCA', code: 'LCA(kc)', type: 'container', title: 'LCTL + LALT'},
        {
          name: 'LSft_T',
          code: 'LSFT_T(kc)',
          type: 'container',
          title: 'Shift when held, kc when tapped',
        },
        {
          name: 'LCtl_T',
          code: 'LCTL_T(kc)',
          type: 'container',
          title: 'Control when held, kc when tapped',
        },
        {
          name: 'LAlt_T',
          code: 'LALT_T(kc)',
          type: 'container',
          title: 'Alt when held, kc when tapped',
        },
        {
          name: 'LGui_T',
          code: 'LGUI_T(kc)',
          type: 'container',
          title: 'Gui when held, kc when tapped',
        },
        {
          name: 'RSft_T',
          code: 'RSFT_T(kc)',
          type: 'container',
          title: 'Shift when held, kc when tapped',
        },
        {
          name: 'RCtl_T',
          code: 'RCTL_T(kc)',
          type: 'container',
          title: 'Control when held, kc when tapped',
        },
        {
          name: 'RAlt_T',
          code: 'RALT_T(kc)',
          type: 'container',
          title: 'Alt when held, kc when tapped',
        },
        {
          name: 'RGui_T',
          code: 'RGUI_T(kc)',
          type: 'container',
          title: 'Gui when held, kc when tapped',
        },
        {
          name: 'CS_T',
          code: 'C_S_T(kc)',
          type: 'container',
          title: 'Control + Shift when held, kc when tapped',
        },
        {
          name: 'All_T',
          code: 'ALL_T(kc)',
          type: 'container',
          title: 'LCTL + LSFT + LALT + LGUI when held, kc when tapped',
        },
        {
          name: 'Meh_T',
          code: 'MEH_T(kc)',
          type: 'container',
          title: 'LCTL + LSFT + LALT when held, kc when tapped',
        },
        {
          name: 'LCAG_T',
          code: 'LCAG_T(kc)',
          type: 'container',
          title: 'LCTL + LALT + LGUI when held, kc when tapped',
        },
        {
          name: 'RCAG_T',
          code: 'RCAG_T(kc)',
          type: 'container',
          title: 'RCTL + RALT + RGUI when held, kc when tapped',
        },
        {
          name: 'SGUI_T',
          code: 'SCMD_T(kc)',
          type: 'container',
          title: 'LGUI + LSFT when held, kc when tapped',
        },
        {
          name: 'LCA_T',
          code: 'LCA_T(kc)',
          type: 'container',
          title: 'LCTL + LALT when held, kc when tapped',
        },
      ],
    },
    {
      label: 'Special',
      width: 'label',
      keycodes: [
        {name: '~', code: 'S(KC_GRV)', keys: '`', title: 'Shift + `'},
        {name: '!', code: 'S(KC_1)', keys: '!', title: 'Shift + 1'},
        {name: '@', code: 'S(KC_2)', keys: '@', title: 'Shift + 2'},
        {name: '#', code: 'S(KC_3)', keys: '#', title: 'Shift + 3'},
        {name: '$', code: 'S(KC_4)', keys: '$', title: 'Shift + 4'},
        {name: '%', code: 'S(KC_5)', keys: '%', title: 'Shift + 5'},
        {name: '^', code: 'S(KC_6)', keys: '^', title: 'Shift + 6'},
        {name: '&', code: 'S(KC_7)', keys: '&', title: 'Shift + 7'},
        {name: '*', code: 'S(KC_8)', keys: '*', title: 'Shift + 8'},
        {name: '(', code: 'S(KC_9)', keys: '(', title: 'Shift + 9'},
        {name: ')', code: 'S(KC_0)', keys: ')', title: 'Shift + 0'},
        {name: '_', code: 'S(KC_MINS)', keys: '_', title: 'Shift + -'},
        {name: '+', code: 'S(KC_EQL)', keys: '+', title: 'Shift + ='},
        {name: '{', code: 'S(KC_LBRC)', keys: '{', title: 'Shift + ['},
        {name: '}', code: 'S(KC_RBRC)', keys: '}', title: 'Shift + ]'},
        {name: '|', code: 'S(KC_BSLS)', keys: '|', title: 'Shift + \\'},
        {name: ':', code: 'S(KC_SCLN)', keys: ':', title: 'Shift + /'},
        {name: '"', code: 'S(KC_QUOT)', keys: '"', title: "Shift + '"},
        {name: '<', code: 'S(KC_COMM)', keys: '<', title: 'Shift + ,'},
        {name: '>', code: 'S(KC_DOT)', keys: '>', title: 'Shift + .'},
        {name: '?', code: 'S(KC_SLSH)', keys: '?', title: 'Shift + /'},
        {name: 'NUHS', code: 'KC_NONUS_HASH', title: 'Non-US # and ~'},
        {name: 'NUBS', code: 'KC_NONUS_BACKSLASH', title: 'Non-US \\ and |'},
        {name: 'Ro', code: 'KC_INTERNATIONAL_1', title: 'JIS \\ and |'},
        {name: '¥', code: 'KC_INTERNATIONAL_3', title: 'JPN Yen'},
        {name: '無変換', code: 'KC_INTERNATIONAL_5', title: 'JIS Muhenkan'},
        {name: '漢字', code: 'KC_LANGUAGE_2', title: 'Hanja'},
        {name: '한영', code: 'KC_LANGUAGE_1', title: 'HanYeong'},
        {name: '変換', code: 'KC_INTERNATIONAL_4', title: 'JIS Henkan'},
        {
          name: 'かな',
          code: 'KC_INTERNATIONAL_2',
          title: 'JIS Katakana/Hiragana',
        },
        {
          name: 'Esc `',
          code: 'QK_GRAVE_ESCAPE',
          title: 'Esc normally, but ` when Shift or Win is pressed',
        },
        {
          name: 'LS (',
          code: 'QK_SPACE_CADET_LEFT_CTRL_PARENTHESIS_OPEN',
          title: 'Left Shift when held, ( when tapped',
        },
        {
          name: 'RS )',
          code: 'QK_SPACE_CADET_RIGHT_CTRL_PARENTHESIS_CLOSE',
          title: 'Right Shift when held, ) when tapped',
        },
        {
          name: 'LC (',
          code: 'QK_SPACE_CADET_LEFT_SHIFT_PARENTHESIS_OPEN',
          title: 'Left Control when held, ( when tapped',
        },
        {
          name: 'RC )',
          code: 'QK_SPACE_CADET_RIGHT_SHIFT_PARENTHESIS_CLOSE',
          title: 'Right Control when held, ) when tapped',
        },
        {
          name: 'LA (',
          code: 'QK_SPACE_CADET_LEFT_ALT_PARENTHESIS_OPEN',
          title: 'Left Alt when held, ( when tapped',
        },
        {
          name: 'RA )',
          code: 'QK_SPACE_CADET_RIGHT_ALT_PARENTHESIS_CLOSE',
          title: 'Right Alt when held, ) when tapped',
        },
        {
          name: 'SftEnt',
          code: 'QK_SPACE_CADET_RIGHT_SHIFT_ENTER',
          title: 'Right Shift when held, Enter when tapped',
        },
        {name: 'Reset', code: 'QK_BOOTLOADER', title: 'Reset the keyboard'},
        {name: 'Debug', code: 'QK_DEBUG_TOGGLE', title: 'Toggle debug mode'},
        {
          name: 'Toggle NKRO',
          code: 'MAGIC_TOGGLE_NKRO',
          shortName: 'NKRO',
          title: 'Toggle NKRO',
        },
        // I don't even think the locking stuff is enabled...
        {name: 'Locking Num Lock', code: 'KC_LOCKING_NUM_LOCK'},
        {name: 'Locking Caps Lock', code: 'KC_LOCKING_CAPS_LOCK'},
        {name: 'Locking Scroll Lock', code: 'KC_LOCKING_SCROLL_LOCK'},
        {name: 'Power', code: 'KC_SYSTEM_POWER'},
        {name: 'Power OSX', code: 'KC_KB_POWER'},
        {name: 'Sleep', code: 'KC_SYSTEM_SLEEP'},
        {name: 'Wake', code: 'KC_SYSTEM_WAKE'},
        {name: 'Calc', code: 'KC_CALCULATOR'},
        {name: 'Mail', code: 'KC_MAIL'},
        {name: 'Help', code: 'KC_HELP'},
        {name: 'Stop', code: 'KC_STOP'},
        {name: 'Alt Erase', code: 'KC_ALTERNATE_ERASE'},
        {name: 'Again', code: 'KC_AGAIN'},
        {name: 'Menu', code: 'KC_MENU'},
        {name: 'Undo', code: 'KC_UNDO'},
        {name: 'Select', code: 'KC_SELECT'},
        {name: 'Exec', code: 'KC_EXECUTE'},
        {name: 'Cut', code: 'KC_CUT'},
        {name: 'Copy', code: 'KC_COPY'},
        {name: 'Paste', code: 'KC_PASTE'},
        {name: 'Find', code: 'KC_FIND'},
        {name: 'My Comp', code: 'KC_MY_COMPUTER'},
        {name: 'Home', code: 'KC_WWW_HOME'},
        {name: 'Back', code: 'KC_WWW_BACK'},
        {name: 'Forward', code: 'KC_WWW_FORWARD'},
        {name: 'Stop', code: 'KC_WWW_STOP'},
        {name: 'Refresh', code: 'KC_WWW_REFRESH'},
        {name: 'Favorites', code: 'KC_WWW_FAVORITES'},
        {name: 'Search', code: 'KC_WWW_SEARCH'},
        {
          name: 'Screen +',
          code: 'KC_BRIGHTNESS_UP',
          shortName: 'Scr +',
          title: 'Screen Brightness Up',
        },
        {
          name: 'Screen -',
          code: 'KC_BRIGHTNESS_DOWN',
          shortName: 'Scr -',
          title: 'Screen Brightness Down',
        },
        {name: 'F13', code: 'KC_F13'},
        {name: 'F14', code: 'KC_F14'},
        {name: 'F15', code: 'KC_F15'},
        {name: 'F16', code: 'KC_F16'},
        {name: 'F17', code: 'KC_F17'},
        {name: 'F18', code: 'KC_F18'},
        {name: 'F19', code: 'KC_F19'},
        {name: 'F20', code: 'KC_F20'},
        {name: 'F21', code: 'KC_F21'},
        {name: 'F22', code: 'KC_F22'},
        {name: 'F23', code: 'KC_F23'},
        {name: 'F24', code: 'KC_F24'},

        // TODO: move these to a new group
        {name: 'Mouse ↑', code: 'KC_MS_UP'},
        {name: 'Mouse ↓', code: 'KC_MS_DOWN'},
        {name: 'Mouse ←', code: 'KC_MS_LEFT'},
        {name: 'Mouse →', code: 'KC_MS_RIGHT'},
        {name: 'Mouse Btn1', code: 'KC_MS_BTN1'},
        {name: 'Mouse Btn2', code: 'KC_MS_BTN2'},
        {name: 'Mouse Btn3', code: 'KC_MS_BTN3'},
        {name: 'Mouse Btn4', code: 'KC_MS_BTN4'},
        {name: 'Mouse Btn5', code: 'KC_MS_BTN5'},
        {name: 'Mouse Btn6', code: 'KC_MS_BTN6'},
        {name: 'Mouse Btn7', code: 'KC_MS_BTN7'},
        {name: 'Mouse Btn8', code: 'KC_MS_BTN8'},
        {name: 'Mouse Wh ↑', code: 'KC_MS_WH_UP'},
        {name: 'Mouse Wh ↓', code: 'KC_MS_WH_DOWN'},
        {name: 'Mouse Wh ←', code: 'KC_MS_WH_LEFT'},
        {name: 'Mouse Wh →', code: 'KC_MS_WH_RIGHT'},
        {name: 'Mouse Acc0', code: 'KC_MS_ACCEL0'},
        {name: 'Mouse Acc1', code: 'KC_MS_ACCEL1'},
        {name: 'Mouse Acc2', code: 'KC_MS_ACCEL2'},

        // TODO: move these to a new group
        {name: 'Audio On', code: 'QK_AUDIO_ON'},
        {name: 'Audio Off', code: 'QK_AUDIO_OFF'},
        {name: 'Audio Toggle', code: 'QK_AUDIO_TOGGLE'},
        {name: 'Clicky Toggle', code: 'QK_AUDIO_CLICKY_TOGGLE'},
        {name: 'Clicky On', code: 'QK_AUDIO_CLICKY_ON'},
        {name: 'Clicky Off', code: 'QK_AUDIO_CLICKY_OFF'},
        {name: 'Clicky Up', code: 'QK_AUDIO_CLICKY_UP'},
        {name: 'Clicky Down', code: 'QK_AUDIO_CLICKY_DOWN'},
        {name: 'Clicky Reset', code: 'QK_AUDIO_CLICKY_RESET'},
        {name: 'Music On', code: 'QK_MUSIC_ON'},
        {name: 'Music Off', code: 'QK_MUSIC_OFF'},
        {name: 'Music Toggle', code: 'QK_MUSIC_TOGGLE'},
        {name: 'Music Mode', code: 'QK_MUSIC_MODE_NEXT'},
      ],
    },
    /* These are for controlling the original backlighting and bottom RGB. */
    {
      label: 'QMK Lighting',
      width: 'label',
      keycodes: [
        {name: 'BL Toggle', code: 'QK_BACKLIGHT_TOGGLE'},
        {name: 'BL On', code: 'QK_BACKLIGHT_ON'},
        {name: 'BL Off', code: 'QK_BACKLIGHT_OFF', shortName: 'BL Off'},
        {name: 'BL -', code: 'QK_BACKLIGHT_DOWN'},
        {name: 'BL +', code: 'QK_BACKLIGHT_UP'},
        {name: 'BL Cycle', code: 'QK_BACKLIGHT_STEP'},
        {name: 'BR Toggle', code: 'QK_BACKLIGHT_TOGGLE_BREATHING'},
        {name: 'RGB Toggle', code: 'RGB_TOG'},
        {name: 'RGB Mode -', code: 'RGB_MODE_REVERSE'},
        {name: 'RGB Mode +', code: 'RGB_MODE_FORWARD'},
        {name: 'Hue -', code: 'RGB_HUD'},
        {name: 'Hue +', code: 'RGB_HUI'},
        {name: 'Sat -', code: 'RGB_SAD'},
        {name: 'Sat +', code: 'RGB_SAI'},
        {name: 'Bright -', code: 'RGB_VAD'},
        {name: 'Bright +', code: 'RGB_VAI'},
        {name: 'Effect Speed-', code: 'RGB_SPD'},
        {name: 'Effect Speed+', code: 'RGB_SPI'},
        {name: 'RGB Mode P', code: 'RGB_MODE_PLAIN', title: 'Plain'},
        {name: 'RGB Mode B', code: 'RGB_MODE_BREATHE', title: 'Breathe'},
        {name: 'RGB Mode R', code: 'RGB_MODE_RAINBOW', title: 'Rainbow'},
        {name: 'RGB Mode SW', code: 'RGB_MODE_SWIRL', title: 'Swirl'},
        {name: 'RGB Mode SN', code: 'RGB_MODE_SNAKE', title: 'Snake'},
        {name: 'RGB Mode K', code: 'RGB_MODE_KNIGHT', title: 'Knight'},
        {name: 'RGB Mode X', code: 'RGB_MODE_XMAS', title: 'Xmas'},
        {name: 'RGB Mode G', code: 'RGB_MODE_GRADIENT', title: 'Gradient'},
      ],
    },
    /*
     These custom keycodes always exist and should be filtered out if necessary
     Name and Title should be replaced with the correct ones from the keyboard json
    */
    {
      label: 'Custom',
      width: 'label',
      keycodes: [
        {name: 'CUSTOM(0)', code: 'CUSTOM(0)', title: 'Custom Keycode 0'},
        {name: 'CUSTOM(1)', code: 'CUSTOM(1)', title: 'Custom Keycode 1'},
        {name: 'CUSTOM(2)', code: 'CUSTOM(2)', title: 'Custom Keycode 2'},
        {name: 'CUSTOM(3)', code: 'CUSTOM(3)', title: 'Custom Keycode 3'},
        {name: 'CUSTOM(4)', code: 'CUSTOM(4)', title: 'Custom Keycode 4'},
        {name: 'CUSTOM(5)', code: 'CUSTOM(5)', title: 'Custom Keycode 5'},
        {name: 'CUSTOM(6)', code: 'CUSTOM(6)', title: 'Custom Keycode 6'},
        {name: 'CUSTOM(7)', code: 'CUSTOM(7)', title: 'Custom Keycode 7'},
        {name: 'CUSTOM(8)', code: 'CUSTOM(8)', title: 'Custom Keycode 8'},
        {name: 'CUSTOM(9)', code: 'CUSTOM(9)', title: 'Custom Keycode 9'},
        {name: 'CUSTOM(10)', code: 'CUSTOM(10)', title: 'Custom Keycode 10'},
        {name: 'CUSTOM(11)', code: 'CUSTOM(11)', title: 'Custom Keycode 11'},
        {name: 'CUSTOM(12)', code: 'CUSTOM(12)', title: 'Custom Keycode 12'},
        {name: 'CUSTOM(13)', code: 'CUSTOM(13)', title: 'Custom Keycode 13'},
        {name: 'CUSTOM(14)', code: 'CUSTOM(14)', title: 'Custom Keycode 14'},
        {name: 'CUSTOM(15)', code: 'CUSTOM(15)', title: 'Custom Keycode 15'},
      ],
    },
  ];
}

export const categoriesForKeycodeModule = (
  keycodeModule: BuiltInKeycodeModule | 'default',
) =>
  ({
    default: ['Basic', 'Media', 'Macro', 'Layers', 'Special'],
    [BuiltInKeycodeModule.WTLighting]: ['Lighting'],
    [BuiltInKeycodeModule.QMKLighting]: ['QMK Lighting'],
  }[keycodeModule]);

export const getKeycodesForKeyboard = (
  definition: VIADefinitionV3 | VIADefinitionV2,
) => {
  // v2
  let includeList: string[] = [];
  if ('lighting' in definition) {
    const {keycodes} = getLightingDefinition(definition.lighting);
    includeList = categoriesForKeycodeModule('default').concat(
      keycodes === KeycodeType.None
        ? []
        : keycodes === KeycodeType.QMK
        ? categoriesForKeycodeModule(BuiltInKeycodeModule.QMKLighting)
        : categoriesForKeycodeModule(BuiltInKeycodeModule.WTLighting),
    );
  } else {
    const {keycodes} = definition;
    includeList = keycodes.flatMap(categoriesForKeycodeModule);
  }
  return getKeycodes()
    .flatMap((keycodeMenu) =>
      includeList.includes(keycodeMenu.label) ? keycodeMenu.keycodes : [],
    )
    .sort((a, b) => {
      if (a.code <= b.code) {
        return -1;
      } else {
        return 1;
      }
    });
};
