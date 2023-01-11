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

// Tests if label is a macro
export function isMacro(label: string) {
  return /^M\d+$/.test(label);
}

// Maps the byte value to the keycode
export function getByteForCode(
  code: string,
  basicKeyToByte: Record<string, number>,
) {
  const byte: number | undefined = basicKeyToByte[code];
  if (byte !== undefined) {
    return byte;
  } else if (isLayerCode(code)) {
    return getByteForLayerCode(code, basicKeyToByte);
  } else if (advancedStringToKeycode(code, basicKeyToByte) !== null) {
    return advancedStringToKeycode(code, basicKeyToByte);
  }
  throw `Could not find byte for ${code}`;
}

function isLayerCode(code: string) {
  return /([A-Za-z]+)\((\d+)\)/.test(code);
}

function getByteForLayerCode(
  keycode: string,
  basicKeyToByte: Record<string, number>,
): number {
  const keycodeMatch = keycode.match(/([A-Za-z]+)\((\d+)\)/);
  if (keycodeMatch) {
    const [, code, layer] = keycodeMatch;
    const numLayer = parseInt(layer);
    switch (code) {
      case 'TO': {
        return Math.min(
          basicKeyToByte._QK_TO + numLayer,
          basicKeyToByte._QK_TO_MAX,
        );
      }
      case 'MO': {
        return Math.min(
          basicKeyToByte._QK_MOMENTARY + numLayer,
          basicKeyToByte._QK_MOMENTARY_MAX,
        );
      }
      case 'DF': {
        return Math.min(
          basicKeyToByte._QK_DEF_LAYER + numLayer,
          basicKeyToByte._QK_DEF_LAYER_MAX,
        );
      }
      case 'TG': {
        return Math.min(
          basicKeyToByte._QK_TOGGLE_LAYER + numLayer,
          basicKeyToByte._QK_TOGGLE_LAYER_MAX,
        );
      }
      case 'OSL': {
        return Math.min(
          basicKeyToByte._QK_ONE_SHOT_LAYER + numLayer,
          basicKeyToByte._QK_ONE_SHOT_LAYER_MAX,
        );
      }
      case 'TT': {
        return Math.min(
          basicKeyToByte._QK_LAYER_TAP_TOGGLE + numLayer,
          basicKeyToByte._QK_LAYER_TAP_TOGGLE_MAX,
        );
      }
      default: {
        throw new Error('Incorrect code');
      }
    }
  }
  throw new Error('No match found');
}

function getCodeForLayerByte(
  byte: number,
  basicKeyToByte: Record<string, number>,
) {
  if (basicKeyToByte._QK_TO <= byte && basicKeyToByte._QK_TO_MAX >= byte) {
    const layer = byte - basicKeyToByte._QK_TO;
    return `TO(${layer})`;
  } else if (
    basicKeyToByte._QK_MOMENTARY <= byte &&
    basicKeyToByte._QK_MOMENTARY_MAX >= byte
  ) {
    const layer = byte - basicKeyToByte._QK_MOMENTARY;
    return `MO(${layer})`;
  } else if (
    basicKeyToByte._QK_DEF_LAYER <= byte &&
    basicKeyToByte._QK_DEF_LAYER_MAX >= byte
  ) {
    const layer = byte - basicKeyToByte._QK_DEF_LAYER;
    return `DF(${layer})`;
  } else if (
    basicKeyToByte._QK_TOGGLE_LAYER <= byte &&
    basicKeyToByte._QK_TOGGLE_LAYER_MAX >= byte
  ) {
    const layer = byte - basicKeyToByte._QK_TOGGLE_LAYER;
    return `TG(${layer})`;
  } else if (
    basicKeyToByte._QK_ONE_SHOT_LAYER <= byte &&
    basicKeyToByte._QK_ONE_SHOT_LAYER_MAX >= byte
  ) {
    const layer = byte - basicKeyToByte._QK_ONE_SHOT_LAYER;
    return `OSL(${layer})`;
  } else if (
    basicKeyToByte._QK_LAYER_TAP_TOGGLE <= byte &&
    basicKeyToByte._QK_LAYER_TAP_TOGGLE_MAX >= byte
  ) {
    const layer = byte - basicKeyToByte._QK_LAYER_TAP_TOGGLE;
    return `TT(${layer})`;
  }
}

export const keycodesList = getKeycodes().reduce<IKeycode[]>(
  (p, n) => p.concat(n.keycodes),
  [],
);

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

function isLayerKey(byte: number, basicKeyToByte: Record<string, number>) {
  return [
    [basicKeyToByte._QK_TO, basicKeyToByte._QK_TO_MAX],
    [basicKeyToByte._QK_MOMENTARY, basicKeyToByte._QK_MOMENTARY_MAX],
    [basicKeyToByte._QK_DEF_LAYER, basicKeyToByte._QK_DEF_LAYER_MAX],
    [basicKeyToByte._QK_TOGGLE_LAYER, basicKeyToByte._QK_TOGGLE_LAYER_MAX],
    [basicKeyToByte._QK_ONE_SHOT_LAYER, basicKeyToByte._QK_ONE_SHOT_LAYER_MAX],
    [
      basicKeyToByte._QK_LAYER_TAP_TOGGLE,
      basicKeyToByte._QK_LAYER_TAP_TOGGLE_MAX,
    ],
  ].some((code) => byte >= code[0] && byte <= code[1]);
}

export function getCodeForByte(
  byte: number,
  basicKeyToByte: Record<string, number>,
  byteToKey: Record<number, string>,
) {
  const keycode = byteToKey[byte];
  if (keycode) {
    return keycode;
  } else if (isLayerKey(byte, basicKeyToByte)) {
    return getCodeForLayerByte(byte, basicKeyToByte);
  } else if (
    advancedKeycodeToString(byte, basicKeyToByte, byteToKey) !== null
  ) {
    return advancedKeycodeToString(byte, basicKeyToByte, byteToKey);
  } else {
    return '0x' + Number(byte).toString(16);
  }
}

export function keycodeInMaster(
  keycode: string,
  basicKeyToByte: Record<string, number>,
) {
  return keycode in basicKeyToByte || isLayerCode(keycode);
}

function shorten(str: string) {
  return str
    .split(' ')
    .map((word) => word.slice(0, 1) + word.slice(1).replace(/[aeiou ]/gi, ''))
    .join('');
}

export function isUserKeycodeByte(
  byte: number,
  basicKeyToByte: Record<string, number>,
) {
  return byte >= basicKeyToByte.USER00 && byte <= basicKeyToByte.USER15;
}

export function getUserKeycodeIndex(
  byte: number,
  basicKeyToByte: Record<string, number>,
) {
  return byte - basicKeyToByte.USER00;
}

export function getLabelForByte(
  byte: number,
  size = 100,
  basicKeyToByte: Record<string, number>,
  byteToKey: Record<number, string>,
) {
  const keycode = getCodeForByte(byte, basicKeyToByte, byteToKey);
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

export function mapEvtToKeycode(evt: KeyboardEvent) {
  switch (evt.code) {
    case 'Digit1': {
      return 'KC_1';
    }
    case 'Digit2': {
      return 'KC_2';
    }
    case 'Digit3': {
      return 'KC_3';
    }
    case 'Digit4': {
      return 'KC_4';
    }
    case 'Digit5': {
      return 'KC_5';
    }
    case 'Digit6': {
      return 'KC_6';
    }
    case 'Digit7': {
      return 'KC_7';
    }
    case 'Digit8': {
      return 'KC_8';
    }
    case 'Digit9': {
      return 'KC_9';
    }
    case 'Digit0': {
      return 'KC_0';
    }
    case 'KeyA': {
      return 'KC_A';
    }
    case 'KeyB': {
      return 'KC_B';
    }
    case 'KeyC': {
      return 'KC_C';
    }
    case 'KeyD': {
      return 'KC_D';
    }
    case 'KeyE': {
      return 'KC_E';
    }
    case 'KeyF': {
      return 'KC_F';
    }
    case 'KeyG': {
      return 'KC_G';
    }
    case 'KeyH': {
      return 'KC_H';
    }
    case 'KeyI': {
      return 'KC_I';
    }
    case 'KeyJ': {
      return 'KC_J';
    }
    case 'KeyK': {
      return 'KC_K';
    }
    case 'KeyL': {
      return 'KC_L';
    }
    case 'KeyM': {
      return 'KC_M';
    }
    case 'KeyN': {
      return 'KC_N';
    }
    case 'KeyO': {
      return 'KC_O';
    }
    case 'KeyP': {
      return 'KC_P';
    }
    case 'KeyQ': {
      return 'KC_Q';
    }
    case 'KeyR': {
      return 'KC_R';
    }
    case 'KeyS': {
      return 'KC_S';
    }
    case 'KeyT': {
      return 'KC_T';
    }
    case 'KeyU': {
      return 'KC_U';
    }
    case 'KeyV': {
      return 'KC_V';
    }
    case 'KeyW': {
      return 'KC_W';
    }
    case 'KeyX': {
      return 'KC_X';
    }
    case 'KeyY': {
      return 'KC_Y';
    }
    case 'KeyZ': {
      return 'KC_Z';
    }
    case 'Comma': {
      return 'KC_COMM';
    }
    case 'Period': {
      return 'KC_DOT';
    }
    case 'Semicolon': {
      return 'KC_SCLN';
    }
    case 'Quote': {
      return 'KC_QUOT';
    }
    case 'BracketLeft': {
      return 'KC_LBRC';
    }
    case 'BracketRight': {
      return 'KC_RBRC';
    }
    case 'Backquote': {
      return 'KC_GRV';
    }
    case 'Slash': {
      return 'KC_SLSH';
    }
    case 'Backspace': {
      return 'KC_BSPC';
    }
    case 'Backslash': {
      return 'KC_BSLS';
    }
    case 'Minus': {
      return 'KC_MINS';
    }
    case 'Equal': {
      return 'KC_EQL';
    }
    case 'IntlRo': {
      return 'KC_RO';
    }
    case 'IntlYen': {
      return 'KC_JYEN';
    }
    case 'AltLeft': {
      return 'KC_LALT';
    }
    case 'AltRight': {
      return 'KC_RALT';
    }
    case 'CapsLock': {
      return 'KC_CAPS';
    }
    case 'ControlLeft': {
      return 'KC_LCTL';
    }
    case 'ControlRight': {
      return 'KC_RCTL';
    }
    case 'MetaLeft': {
      return 'KC_LGUI';
    }
    case 'MetaRight': {
      return 'KC_RGUI';
    }
    case 'OSLeft': {
      return 'KC_LGUI';
    }
    case 'OSRight': {
      return 'KC_RGUI';
    }
    case 'ShiftLeft': {
      return 'KC_LSFT';
    }
    case 'ShiftRight': {
      return 'KC_RSFT';
    }
    case 'ContextMenu': {
      return 'KC_APP';
    }
    case 'Apps': {
      return 'KC_APP';
    }
    case 'Enter': {
      return 'KC_ENT';
    }
    case 'Space': {
      return 'KC_SPC';
    }
    case 'Tab': {
      return 'KC_TAB';
    }
    case 'Delete': {
      return 'KC_DEL';
    }
    case 'End': {
      return 'KC_END';
    }
    case 'Help': {
      return 'KC_HELP';
    }
    case 'Home': {
      return 'KC_HOME';
    }
    case 'Insert': {
      return 'KC_INS';
    }
    case 'PageDown': {
      return 'KC_PGDN';
    }
    case 'PageUp': {
      return 'KC_PGUP';
    }
    case 'ArrowDown': {
      return 'KC_DOWN';
    }
    case 'ArrowLeft': {
      return 'KC_LEFT';
    }
    case 'ArrowRight': {
      return 'KC_RGHT';
    }
    case 'ArrowUp': {
      return 'KC_UP';
    }
    case 'Escape': {
      return 'KC_ESC';
    }
    case 'PrintScreen': {
      return 'KC_PSCR';
    }
    case 'ScrollLock': {
      return 'KC_SLCK';
    }
    case 'Pause': {
      return 'KC_PAUS';
    }
    case 'F1': {
      return 'KC_F1';
    }
    case 'F2': {
      return 'KC_F2';
    }
    case 'F3': {
      return 'KC_F3';
    }
    case 'F4': {
      return 'KC_F4';
    }
    case 'F5': {
      return 'KC_F5';
    }
    case 'F6': {
      return 'KC_F6';
    }
    case 'F7': {
      return 'KC_F7';
    }
    case 'F8': {
      return 'KC_F8';
    }
    case 'F9': {
      return 'KC_F9';
    }
    case 'F10': {
      return 'KC_F10';
    }
    case 'F11': {
      return 'KC_F11';
    }
    case 'F12': {
      return 'KC_F12';
    }
    case 'F13': {
      return 'KC_F13';
    }
    case 'F14': {
      return 'KC_F14';
    }
    case 'F15': {
      return 'KC_F15';
    }
    case 'F16': {
      return 'KC_F16';
    }
    case 'F17': {
      return 'KC_F17';
    }
    case 'F18': {
      return 'KC_F18';
    }
    case 'F19': {
      return 'KC_F19';
    }
    case 'F20': {
      return 'KC_F20';
    }
    case 'F21': {
      return 'KC_F21';
    }
    case 'F22': {
      return 'KC_F22';
    }
    case 'F23': {
      return 'KC_F23';
    }
    case 'F24': {
      return 'KC_F24';
    }
    case 'NumLock': {
      return 'KC_NLCK';
    }
    case 'Numpad0': {
      return 'KC_P0';
    }
    case 'Numpad1': {
      return 'KC_P1';
    }
    case 'Numpad2': {
      return 'KC_P2';
    }
    case 'Numpad3': {
      return 'KC_P3';
    }
    case 'Numpad4': {
      return 'KC_P4';
    }
    case 'Numpad5': {
      return 'KC_P5';
    }
    case 'Numpad6': {
      return 'KC_P6';
    }
    case 'Numpad7': {
      return 'KC_P7';
    }
    case 'Numpad8': {
      return 'KC_P8';
    }
    case 'Numpad9': {
      return 'KC_P9';
    }
    case 'NumpadAdd': {
      return 'KC_PPLS';
    }
    case 'NumpadComma': {
      return 'KC_COMM';
    }
    case 'NumpadDecimal': {
      return 'KC_PDOT';
    }
    case 'NumpadDivide': {
      return 'KC_PSLS';
    }
    case 'NumpadEnter': {
      return 'KC_PENT';
    }
    case 'NumpadEqual': {
      return 'KC_PEQL';
    }
    case 'NumpadMultiply': {
      return 'KC_PAST';
    }
    case 'NumpadSubtract': {
      return 'KC_PMNS';
    }
    default:
      console.error('Unreacheable keydown code', evt);
  }
}

export function getKeycodeForByte(
  byte: number,
  basicKeyToByte: Record<string, number>,
  byteToKey: Record<number, string>,
) {
  const keycode = byteToKey[byte];
  const basicKeycode = keycodesList.find(({code}) => code === keycode);
  const advancedString = advancedKeycodeToString(
    byte,
    basicKeyToByte,
    byteToKey,
  );
  return (basicKeycode && basicKeycode.code) || advancedString || keycode;
}

export function getOtherMenu(
  basicKeyToByte: Record<string, number>,
): IKeycodeMenu {
  const keycodes = Object.keys(basicKeyToByte)
    .filter((key) => !key.startsWith('QK_'))
    .filter((key) => !keycodesList.map(({code}) => code).includes(key))
    .map((code) => ({
      name: code.replace('KC_', '').replace(/_/g, ' '),
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
      code: 'FN_MO13',
      title: 'Hold = Layer 1, Hold with Fn2 = Layer 3',
      shortName: 'Fn1(3)',
    },
    {
      name: 'Fn2\n(Fn3)',
      code: 'FN_MO23',
      title: 'Hold = Layer 2, Hold with Fn1 = Layer 3',
      shortName: 'Fn2(3)',
    },
    {
      name: 'Space Fn1',
      code: 'SPC_FN1',
      title: 'Hold = Layer 1, Tap = Space',
      shortName: 'Spc Fn1',
    },
    {
      name: 'Space Fn2',
      code: 'SPC_FN2',
      title: 'Hold = Layer 2, Tap = Space',
      shortName: 'Spc Fn2',
    },
    {
      name: 'Space Fn3',
      code: 'SPC_FN3',
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
        {name: '▽', code: 'KC_TRNS', title: 'Pass-through'},
        // TODO: remove "shortName" when multiline keycap labels are working
        {name: 'Esc', code: 'KC_ESC', keys: 'esc'},
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
        {name: '_\n-', code: 'KC_MINS', keys: '-'},
        {name: '+\n=', code: 'KC_EQL', keys: '='},
        {name: '~\n`', code: 'KC_GRV', keys: '`'},
        {name: '{\n[', code: 'KC_LBRC', keys: '['},
        {name: '}\n]', code: 'KC_RBRC', keys: ']'},
        {name: '|\n\\', code: 'KC_BSLS', keys: '\\', width: 1500},
        {name: ':\n;', code: 'KC_SCLN', keys: ';'},
        {name: '"\n\'', code: 'KC_QUOT', keys: "'"},
        {name: '<\n,', code: 'KC_COMM', keys: ','},
        {name: '>\n.', code: 'KC_DOT', keys: '.'},
        {name: '?\n/', code: 'KC_SLSH', keys: '/'},
        {name: '=', code: 'KC_PEQL'},
        {name: ',', code: 'KC_PCMM'},
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
        {name: 'Print Screen', code: 'KC_PSCR', shortName: 'Print'},
        {name: 'Scroll Lock', code: 'KC_SLCK', shortName: 'Scroll'},
        {name: 'Pause', code: 'KC_PAUS'},
        {name: 'Tab', code: 'KC_TAB', keys: 'tab', width: 1500},
        {
          name: 'Backspace',
          code: 'KC_BSPC',
          keys: 'backspace',
          width: 2000,
          shortName: 'Bksp',
        },
        {name: 'Insert', code: 'KC_INS', keys: 'insert', shortName: 'Ins'},
        {name: 'Del', code: 'KC_DEL', keys: 'delete'},
        {name: 'Home', code: 'KC_HOME', keys: 'home'},
        {name: 'End', code: 'KC_END', keys: 'end'},
        {name: 'Page Up', code: 'KC_PGUP', keys: 'pageup', shortName: 'PgUp'},
        {
          name: 'Page Down',
          code: 'KC_PGDN',
          keys: 'pagedown',
          shortName: 'PgDn',
        },
        {name: 'Num\nLock', code: 'KC_NLCK', keys: 'num', shortName: 'N.Lck'},
        {name: 'Caps Lock', code: 'KC_CAPS', keys: 'caps_lock', width: 1750},
        {name: 'Enter', code: 'KC_ENT', keys: 'enter', width: 2250},
        {name: '1', code: 'KC_P1', keys: 'num_1', title: 'Numpad 1'},
        {name: '2', code: 'KC_P2', keys: 'num_2', title: 'Numpad 2'},
        {name: '3', code: 'KC_P3', keys: 'num_3', title: 'Numpad 3'},
        {name: '4', code: 'KC_P4', keys: 'num_4', title: 'Numpad 4'},
        {name: '5', code: 'KC_P5', keys: 'num_5', title: 'Numpad 5'},
        {name: '6', code: 'KC_P6', keys: 'num_6', title: 'Numpad 6'},
        {name: '7', code: 'KC_P7', keys: 'num_7', title: 'Numpad 7'},
        {name: '8', code: 'KC_P8', keys: 'num_8', title: 'Numpad 8'},
        {name: '9', code: 'KC_P9', keys: 'num_9', title: 'Numpad 9'},
        {
          name: '0',
          code: 'KC_P0',
          width: 2000,
          keys: 'num_0',
          title: 'Numpad 0',
        },
        {name: '/', code: 'KC_PSLS', keys: 'num_divide', title: 'Numpad /'},
        {name: '*', code: 'KC_PAST', keys: 'num_multiply', title: 'Numpad *'},
        {name: '-', code: 'KC_PMNS', keys: 'num_subtract', title: 'Numpad -'},
        {name: '+', code: 'KC_PPLS', keys: 'num_add', title: 'Numpad +'},
        {name: '.', code: 'KC_PDOT', keys: 'num_decimal', title: 'Numpad .'},
        {
          name: 'Num\nEnter',
          code: 'KC_PENT',
          shortName: 'N.Ent',
          title: 'Numpad Enter',
        },
        {
          name: 'Left Shift',
          code: 'KC_LSFT',
          keys: 'shift',
          width: 2250,
          shortName: 'LShft',
        },
        {name: 'Right Shift', code: 'KC_RSFT', width: 2750, shortName: 'RShft'},
        {name: 'Left Ctrl', code: 'KC_LCTL', keys: 'ctrl', width: 1250},
        {name: 'Right Ctrl', code: 'KC_RCTL', width: 1250, shortName: 'RCtl'},
        {
          name: 'Left Win',
          code: 'KC_LGUI',
          keys: 'cmd',
          width: 1250,
          shortName: 'LWin',
        },
        {name: 'Right Win', code: 'KC_RGUI', width: 1250, shortName: 'RWin'},
        {
          name: 'Left Alt',
          code: 'KC_LALT',
          keys: 'alt',
          width: 1250,
          shortName: 'LAlt',
        },
        {name: 'Right Alt', code: 'KC_RALT', width: 1250, shortName: 'RAlt'},
        {name: 'Space', code: 'KC_SPC', keys: 'space', width: 6250},
        {name: 'Menu', code: 'KC_APP', width: 1250, shortName: 'RApp'},
        {name: 'Left', code: 'KC_LEFT', keys: 'left', shortName: '←'},
        {name: 'Down', code: 'KC_DOWN', keys: 'down', shortName: '↓'},
        {name: 'Up', code: 'KC_UP', keys: 'up', shortName: '↑'},
        {name: 'Right', code: 'KC_RGHT', keys: 'right', shortName: '→'},
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
        {name: 'Vol -', code: 'KC_VOLD', title: 'Volume Down'},
        {name: 'Vol +', code: 'KC_VOLU', title: 'Volume Up'},
        {name: 'Mute', code: 'KC_MUTE', title: 'Mute Audio'},
        {name: 'Play', code: 'KC_MPLY', title: 'Play/Pause'},
        {name: 'Media Stop', code: 'KC_MSTP', title: 'Media Stop'},
        {name: 'Previous', code: 'KC_MPRV', title: 'Media Previous'},
        {name: 'Next', code: 'KC_MNXT', title: 'Media Next'},
        {name: 'Rewind', code: 'KC_MRWD', title: 'Rewind'},
        {name: 'Fast Forward', code: 'KC_MFFD', title: 'Fast Forward'},
        {name: 'Select', code: 'KC_MSEL', title: 'Media Select'},
        {name: 'Eject', code: 'KC_EJCT', title: 'Media Eject'},
      ],
    },
    {
      label: 'Macro',
      width: 'label',
      keycodes: [
        {name: 'M0', code: 'MACRO00', title: 'Macro 0'},
        {name: 'M1', code: 'MACRO01', title: 'Macro 1'},
        {name: 'M2', code: 'MACRO02', title: 'Macro 2'},
        {name: 'M3', code: 'MACRO03', title: 'Macro 3'},
        {name: 'M4', code: 'MACRO04', title: 'Macro 4'},
        {name: 'M5', code: 'MACRO05', title: 'Macro 5'},
        {name: 'M6', code: 'MACRO06', title: 'Macro 6'},
        {name: 'M7', code: 'MACRO07', title: 'Macro 7'},
        {name: 'M8', code: 'MACRO08', title: 'Macro 8'},
        {name: 'M9', code: 'MACRO09', title: 'Macro 9'},
        {name: 'M10', code: 'MACRO10', title: 'Macro 10'},
        {name: 'M11', code: 'MACRO11', title: 'Macro 11'},
        {name: 'M12', code: 'MACRO12', title: 'Macro 12'},
        {name: 'M13', code: 'MACRO13', title: 'Macro 13'},
        {name: 'M14', code: 'MACRO14', title: 'Macro 14'},
        {name: 'M15', code: 'MACRO15', title: 'Macro 15'},
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
        {name: '~', code: 'KC_TILD', keys: '`'},
        {name: '!', code: 'KC_EXLM', keys: '!'},
        {name: '@', code: 'KC_AT', keys: '@'},
        {name: '#', code: 'KC_HASH', keys: '#'},
        {name: '$', code: 'KC_DLR', keys: '$'},
        {name: '%', code: 'KC_PERC', keys: '%'},
        {name: '^', code: 'KC_CIRC', keys: '^'},
        {name: '&', code: 'KC_AMPR', keys: '&'},
        {name: '*', code: 'KC_ASTR', keys: '*'},
        {name: '(', code: 'KC_LPRN', keys: '('},
        {name: ')', code: 'KC_RPRN', keys: ')'},
        {name: '_', code: 'KC_UNDS', keys: '_'},
        {name: '+', code: 'KC_PLUS', keys: '+'},
        {name: '{', code: 'KC_LCBR', keys: '{'},
        {name: '}', code: 'KC_RCBR', keys: '}'},
        {name: '<', code: 'KC_LT', keys: '<'},
        {name: '>', code: 'KC_GT', keys: '>'},
        {name: ':', code: 'KC_COLN', keys: ':'},
        {name: '|', code: 'KC_PIPE', keys: '|'},
        {name: '?', code: 'KC_QUES', keys: '?'},
        {name: '"', code: 'KC_DQUO', keys: '"'},
        {name: 'NUHS', code: 'KC_NUHS', title: 'Non-US # and ~'},
        {name: 'NUBS', code: 'KC_NUBS', title: 'Non-US \\ and |'},
        {name: 'Ro', code: 'KC_RO', title: 'JIS \\ and |'},
        {name: '¥', code: 'KC_JYEN', title: 'JPN Yen'},
        {name: '無変換', code: 'KC_MHEN', title: 'JIS Muhenkan'},
        {name: '漢字', code: 'KC_HANJ', title: 'Hanja'},
        {name: '한영', code: 'KC_HAEN', title: 'HanYeong'},
        {name: '変換', code: 'KC_HENK', title: 'JIS Henkan'},
        {name: 'かな', code: 'KC_KANA', title: 'JIS Katakana/Hiragana'},
        {
          name: 'Esc `',
          code: 'KC_GESC',
          title: 'Esc normally, but ` when Shift or Win is pressed',
        },
        {
          name: 'LS (',
          code: 'KC_LSPO',
          title: 'Left Shift when held, ( when tapped',
        },
        {
          name: 'RS )',
          code: 'KC_RSPC',
          title: 'Right Shift when held, ) when tapped',
        },
        {
          name: 'LC (',
          code: 'KC_LCPO',
          title: 'Left Control when held, ( when tapped',
        },
        {
          name: 'RC )',
          code: 'KC_RCPC',
          title: 'Right Control when held, ) when tapped',
        },
        {
          name: 'LA (',
          code: 'KC_LAPO',
          title: 'Left Alt when held, ( when tapped',
        },
        {
          name: 'RA )',
          code: 'KC_RAPC',
          title: 'Right Alt when held, ) when tapped',
        },
        {
          name: 'SftEnt',
          code: 'KC_SFTENT',
          title: 'Right Shift when held, Enter when tapped',
        },
        {name: 'Reset', code: 'RESET', title: 'Reset the keyboard'},
        {name: 'Debug', code: 'DEBUG', title: 'Toggle debug mode'},
        {
          name: 'Toggle NKRO',
          code: 'MAGIC_TOGGLE_NKRO',
          shortName: 'NKRO',
          title: 'Toggle NKRO',
        },
        // I don't even think the locking stuff is enabled...
        {name: 'Locking Num Lock', code: 'KC_LNUM'},
        {name: 'Locking Caps Lock', code: 'KC_LCAP'},
        {name: 'Locking Scroll Lock', code: 'KC_LSCR'},
        {name: 'Power', code: 'KC_PWR'},
        {name: 'Power OSX', code: 'KC_POWER'},
        {name: 'Sleep', code: 'KC_SLEP'},
        {name: 'Wake', code: 'KC_WAKE'},
        {name: 'Calc', code: 'KC_CALC'},
        {name: 'Mail', code: 'KC_MAIL'},
        {name: 'Help', code: 'KC_HELP'},
        {name: 'Stop', code: 'KC_STOP'},
        {name: 'Alt Erase', code: 'KC_ERAS'},
        {name: 'Again', code: 'KC_AGAIN'},
        {name: 'Menu', code: 'KC_MENU'},
        {name: 'Undo', code: 'KC_UNDO'},
        {name: 'Select', code: 'KC_SELECT'},
        {name: 'Exec', code: 'KC_EXECUTE'},
        {name: 'Cut', code: 'KC_CUT'},
        {name: 'Copy', code: 'KC_COPY'},
        {name: 'Paste', code: 'KC_PASTE'},
        {name: 'Find', code: 'KC_FIND'},
        {name: 'My Comp', code: 'KC_MYCM'},
        {name: 'Home', code: 'KC_WWW_HOME'},
        {name: 'Back', code: 'KC_WWW_BACK'},
        {name: 'Forward', code: 'KC_WWW_FORWARD'},
        {name: 'Stop', code: 'KC_WWW_STOP'},
        {name: 'Refresh', code: 'KC_WWW_REFRESH'},
        {name: 'Favorites', code: 'KC_WWW_FAVORITES'},
        {name: 'Search', code: 'KC_WWW_SEARCH'},
        {
          name: 'Screen +',
          code: 'KC_BRIU',
          shortName: 'Scr +',
          title: 'Screen Brightness Up',
        },
        {
          name: 'Screen -',
          code: 'KC_BRID',
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
        {name: 'Audio On', code: 'AU_ON'},
        {name: 'Audio Off', code: 'AU_OFF'},
        {name: 'Audio Toggle', code: 'AU_TOG'},
        {name: 'Clicky Toggle', code: 'CLICKY_TOGGLE'},
        {name: 'Clicky Enable', code: 'CLICKY_ENABLE'},
        {name: 'Clicky Disable', code: 'CLICKY_DISABLE'},
        {name: 'Clicky Up', code: 'CLICKY_UP'},
        {name: 'Clicky Down', code: 'CLICKY_DOWN'},
        {name: 'Clicky Reset', code: 'CLICKY_RESET'},
        {name: 'Music On', code: 'MU_ON'},
        {name: 'Music Off', code: 'MU_OFF'},
        {name: 'Music Toggle', code: 'MU_TOG'},
        {name: 'Music Mode', code: 'MU_MOD'},
      ],
    },
    /* These are for controlling the original backlighting and bottom RGB. */
    {
      label: 'QMK Lighting',
      width: 'label',
      keycodes: [
        {name: 'BL Toggle', code: 'BL_TOGG'},
        {name: 'BL On', code: 'BL_ON'},
        {name: 'BL Off', code: 'BL_OFF', shortName: 'BL Off'},
        {name: 'BL -', code: 'BL_DEC'},
        {name: 'BL +', code: 'BL_INC'},
        {name: 'BL Cycle', code: 'BL_STEP'},
        {name: 'BR Toggle', code: 'BL_BRTG'},
        {name: 'RGB Toggle', code: 'RGB_TOG'},
        {name: 'RGB Mode -', code: 'RGB_RMOD'},
        {name: 'RGB Mode +', code: 'RGB_MOD'},
        {name: 'Hue -', code: 'RGB_HUD'},
        {name: 'Hue +', code: 'RGB_HUI'},
        {name: 'Sat -', code: 'RGB_SAD'},
        {name: 'Sat +', code: 'RGB_SAI'},
        {name: 'Bright -', code: 'RGB_VAD'},
        {name: 'Bright +', code: 'RGB_VAI'},
        {name: 'Effect Speed-', code: 'RGB_SPD'},
        {name: 'Effect Speed+', code: 'RGB_SPI'},
        {name: 'RGB Mode P', code: 'RGB_M_P', title: 'Plain'},
        {name: 'RGB Mode B', code: 'RGB_M_B', title: 'Breathe'},
        {name: 'RGB Mode R', code: 'RGB_M_R', title: 'Rainbow'},
        {name: 'RGB Mode SW', code: 'RGB_M_SW', title: 'Swirl'},
        {name: 'RGB Mode SN', code: 'RGB_M_SN', title: 'Snake'},
        {name: 'RGB Mode K', code: 'RGB_M_K', title: 'Knight'},
        {name: 'RGB Mode X', code: 'RGB_M_X', title: 'Xmas'},
        {name: 'RGB Mode G', code: 'RGB_M_G', title: 'Gradient'},
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
        {name: 'User00', code: 'USER00', title: 'Custom Keycode 00'},
        {name: 'User01', code: 'USER01', title: 'Custom Keycode 01'},
        {name: 'User02', code: 'USER02', title: 'Custom Keycode 02'},
        {name: 'User03', code: 'USER03', title: 'Custom Keycode 03'},
        {name: 'User04', code: 'USER04', title: 'Custom Keycode 04'},
        {name: 'User05', code: 'USER05', title: 'Custom Keycode 05'},
        {name: 'User06', code: 'USER06', title: 'Custom Keycode 06'},
        {name: 'User07', code: 'USER07', title: 'Custom Keycode 07'},
        {name: 'User08', code: 'USER08', title: 'Custom Keycode 08'},
        {name: 'User09', code: 'USER09', title: 'Custom Keycode 09'},
        {name: 'User10', code: 'USER10', title: 'Custom Keycode 10'},
        {name: 'User11', code: 'USER11', title: 'Custom Keycode 11'},
        {name: 'User12', code: 'USER12', title: 'Custom Keycode 12'},
        {name: 'User13', code: 'USER13', title: 'Custom Keycode 13'},
        {name: 'User14', code: 'USER14', title: 'Custom Keycode 14'},
        {name: 'User15', code: 'USER15', title: 'Custom Keycode 15'},
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
