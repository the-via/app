import basicKeyToByte from './key-to-byte/default';
export const matrixKeycodes = [
  // Row 0
  basicKeyToByte.KC_ESC,
  basicKeyToByte.KC_F1,
  basicKeyToByte.KC_F2,
  basicKeyToByte.KC_F3,
  basicKeyToByte.KC_F4,
  basicKeyToByte.KC_F5,
  basicKeyToByte.KC_F6,
  basicKeyToByte.KC_F7,
  basicKeyToByte.KC_F8,
  basicKeyToByte.KC_F9,
  basicKeyToByte.KC_F10,
  basicKeyToByte.KC_F11,
  basicKeyToByte.KC_F12,
  basicKeyToByte.KC_PSCR,
  basicKeyToByte.KC_SLCK,
  basicKeyToByte.KC_PAUS,
  basicKeyToByte.KC_SLEP,
  basicKeyToByte.KC_MUTE,
  basicKeyToByte.KC_VOLD,
  basicKeyToByte.KC_VOLU,
  // Row 1
  basicKeyToByte.KC_GRV,
  basicKeyToByte.KC_1,
  basicKeyToByte.KC_2,
  basicKeyToByte.KC_3,
  basicKeyToByte.KC_4,
  basicKeyToByte.KC_5,
  basicKeyToByte.KC_6,
  basicKeyToByte.KC_7,
  basicKeyToByte.KC_8,
  basicKeyToByte.KC_9,
  basicKeyToByte.KC_0,
  basicKeyToByte.KC_MINS,
  basicKeyToByte.KC_EQL,
  basicKeyToByte.KC_BSPC,
  basicKeyToByte.KC_INS,
  basicKeyToByte.KC_HOME,
  basicKeyToByte.KC_PGUP,
  basicKeyToByte.KC_NLCK,
  basicKeyToByte.KC_PSLS,
  basicKeyToByte.KC_PAST,
  basicKeyToByte.KC_PMNS,
  // Row 2
  basicKeyToByte.KC_TAB,
  basicKeyToByte.KC_Q,
  basicKeyToByte.KC_W,
  basicKeyToByte.KC_E,
  basicKeyToByte.KC_R,
  basicKeyToByte.KC_T,
  basicKeyToByte.KC_Y,
  basicKeyToByte.KC_U,
  basicKeyToByte.KC_I,
  basicKeyToByte.KC_O,
  basicKeyToByte.KC_P,
  basicKeyToByte.KC_LBRC,
  basicKeyToByte.KC_RBRC,
  basicKeyToByte.KC_BSLS,
  basicKeyToByte.KC_DEL,
  basicKeyToByte.KC_END,
  basicKeyToByte.KC_PGDN,
  basicKeyToByte.KC_P7,
  basicKeyToByte.KC_P8,
  basicKeyToByte.KC_P9,
  basicKeyToByte.KC_PPLS,
  // Row 3
  basicKeyToByte.KC_CAPS,
  basicKeyToByte.KC_A,
  basicKeyToByte.KC_S,
  basicKeyToByte.KC_D,
  basicKeyToByte.KC_F,
  basicKeyToByte.KC_G,
  basicKeyToByte.KC_H,
  basicKeyToByte.KC_J,
  basicKeyToByte.KC_K,
  basicKeyToByte.KC_L,
  basicKeyToByte.KC_SCLN,
  basicKeyToByte.KC_QUOT,
  basicKeyToByte.KC_ENT,
  basicKeyToByte.KC_P4,
  basicKeyToByte.KC_P5,
  basicKeyToByte.KC_P6,
  // Row 4
  basicKeyToByte.KC_LSFT,
  basicKeyToByte.KC_Z,
  basicKeyToByte.KC_X,
  basicKeyToByte.KC_C,
  basicKeyToByte.KC_V,
  basicKeyToByte.KC_B,
  basicKeyToByte.KC_N,
  basicKeyToByte.KC_M,
  basicKeyToByte.KC_COMM,
  basicKeyToByte.KC_DOT,
  basicKeyToByte.KC_SLSH,
  basicKeyToByte.KC_RSFT,
  basicKeyToByte.KC_UP,
  basicKeyToByte.KC_P1,
  basicKeyToByte.KC_P2,
  basicKeyToByte.KC_P3,
  basicKeyToByte.KC_PENT,
  // Row 5
  basicKeyToByte.KC_LCTL,
  basicKeyToByte.KC_LGUI,
  basicKeyToByte.KC_LALT,
  basicKeyToByte.KC_SPC,
  basicKeyToByte.KC_RALT,
  basicKeyToByte.KC_RGUI,
  basicKeyToByte.KC_MENU,
  basicKeyToByte.KC_RCTL,
  basicKeyToByte.KC_LEFT,
  basicKeyToByte.KC_DOWN,
  basicKeyToByte.KC_RGHT,
  basicKeyToByte.KC_P0,
  basicKeyToByte.KC_PDOT,
];

const evtToKeyByte = {
  Digit1: basicKeyToByte.KC_1,
  Digit2: basicKeyToByte.KC_2,
  Digit3: basicKeyToByte.KC_3,
  Digit4: basicKeyToByte.KC_4,
  Digit5: basicKeyToByte.KC_5,
  Digit6: basicKeyToByte.KC_6,
  Digit7: basicKeyToByte.KC_7,
  Digit8: basicKeyToByte.KC_8,
  Digit9: basicKeyToByte.KC_9,
  Digit0: basicKeyToByte.KC_0,
  KeyA: basicKeyToByte.KC_A,
  KeyB: basicKeyToByte.KC_B,
  KeyC: basicKeyToByte.KC_C,
  KeyD: basicKeyToByte.KC_D,
  KeyE: basicKeyToByte.KC_E,
  KeyF: basicKeyToByte.KC_F,
  KeyG: basicKeyToByte.KC_G,
  KeyH: basicKeyToByte.KC_H,
  KeyI: basicKeyToByte.KC_I,
  KeyJ: basicKeyToByte.KC_J,
  KeyK: basicKeyToByte.KC_K,
  KeyL: basicKeyToByte.KC_L,
  KeyM: basicKeyToByte.KC_M,
  KeyN: basicKeyToByte.KC_N,
  KeyO: basicKeyToByte.KC_O,
  KeyP: basicKeyToByte.KC_P,
  KeyQ: basicKeyToByte.KC_Q,
  KeyR: basicKeyToByte.KC_R,
  KeyS: basicKeyToByte.KC_S,
  KeyT: basicKeyToByte.KC_T,
  KeyU: basicKeyToByte.KC_U,
  KeyV: basicKeyToByte.KC_V,
  KeyW: basicKeyToByte.KC_W,
  KeyX: basicKeyToByte.KC_X,
  KeyY: basicKeyToByte.KC_Y,
  KeyZ: basicKeyToByte.KC_Z,
  Comma: basicKeyToByte.KC_COMM,
  Period: basicKeyToByte.KC_DOT,
  Semicolon: basicKeyToByte.KC_SCLN,
  Quote: basicKeyToByte.KC_QUOT,
  BracketLeft: basicKeyToByte.KC_LBRC,
  BracketRight: basicKeyToByte.KC_RBRC,
  Backspace: basicKeyToByte.KC_BSPC,
  Backquote: basicKeyToByte.KC_GRV,
  Slash: basicKeyToByte.KC_SLSH,
  Backslash: basicKeyToByte.KC_BSLS,
  Minus: basicKeyToByte.KC_MINS,
  Equal: basicKeyToByte.KC_EQL,
  IntlRo: basicKeyToByte.KC_RO,
  IntlYen: basicKeyToByte.KC_JYEN,
  AltLeft: basicKeyToByte.KC_LALT,
  AltRight: basicKeyToByte.KC_RALT,
  CapsLock: basicKeyToByte.KC_CAPS,
  ControlLeft: basicKeyToByte.KC_LCTL,
  ControlRight: basicKeyToByte.KC_RCTL,
  MetaLeft: basicKeyToByte.KC_LGUI,
  MetaRight: basicKeyToByte.KC_RGUI,
  OSLeft: basicKeyToByte.KC_LGUI,
  OSRight: basicKeyToByte.KC_RGUI,
  ShiftLeft: basicKeyToByte.KC_LSFT,
  ShiftRight: basicKeyToByte.KC_RSFT,
  ContextMenu: basicKeyToByte.KC_APP,
  Enter: basicKeyToByte.KC_ENT,
  Space: basicKeyToByte.KC_SPC,
  Tab: basicKeyToByte.KC_TAB,
  Delete: basicKeyToByte.KC_DEL,
  End: basicKeyToByte.KC_END,
  Help: basicKeyToByte.KC_HELP,
  Home: basicKeyToByte.KC_HOME,
  Insert: basicKeyToByte.KC_INS,
  PageDown: basicKeyToByte.KC_PGDN,
  PageUp: basicKeyToByte.KC_PGUP,
  ArrowDown: basicKeyToByte.KC_DOWN,
  ArrowLeft: basicKeyToByte.KC_LEFT,
  ArrowRight: basicKeyToByte.KC_RGHT,
  ArrowUp: basicKeyToByte.KC_UP,
  Escape: basicKeyToByte.KC_ESC,
  PrintScreen: basicKeyToByte.KC_PSCR,
  ScrollLock: basicKeyToByte.KC_SLCK,
  AudioVolumeUp: basicKeyToByte.KC_VOLU,
  AudioVolumeDown: basicKeyToByte.KC_VOLD,
  AudioVolumeMute: basicKeyToByte.KC_MUTE,
  Pause: basicKeyToByte.KC_PAUS,
  F1: basicKeyToByte.KC_F1,
  F2: basicKeyToByte.KC_F2,
  F3: basicKeyToByte.KC_F3,
  F4: basicKeyToByte.KC_F4,
  F5: basicKeyToByte.KC_F5,
  F6: basicKeyToByte.KC_F6,
  F7: basicKeyToByte.KC_F7,
  F8: basicKeyToByte.KC_F8,
  F9: basicKeyToByte.KC_F9,
  F10: basicKeyToByte.KC_F10,
  F11: basicKeyToByte.KC_F11,
  F12: basicKeyToByte.KC_F12,
  F13: basicKeyToByte.KC_F13,
  F14: basicKeyToByte.KC_F14,
  F15: basicKeyToByte.KC_F15,
  F16: basicKeyToByte.KC_F16,
  F17: basicKeyToByte.KC_F17,
  F18: basicKeyToByte.KC_F18,
  F19: basicKeyToByte.KC_F19,
  F20: basicKeyToByte.KC_F20,
  F21: basicKeyToByte.KC_F21,
  F22: basicKeyToByte.KC_F22,
  F23: basicKeyToByte.KC_F23,
  F24: basicKeyToByte.KC_F24,
  NumLock: basicKeyToByte.KC_NLCK,
  Numpad0: basicKeyToByte.KC_P0,
  Numpad1: basicKeyToByte.KC_P1,
  Numpad2: basicKeyToByte.KC_P2,
  Numpad3: basicKeyToByte.KC_P3,
  Numpad4: basicKeyToByte.KC_P4,
  Numpad5: basicKeyToByte.KC_P5,
  Numpad6: basicKeyToByte.KC_P6,
  Numpad7: basicKeyToByte.KC_P7,
  Numpad8: basicKeyToByte.KC_P8,
  Numpad9: basicKeyToByte.KC_P9,
  NumpadAdd: basicKeyToByte.KC_PPLS,
  NumpadComma: basicKeyToByte.KC_COMM,
  NumpadDecimal: basicKeyToByte.KC_PDOT,
  NumpadDivide: basicKeyToByte.KC_PSLS,
  NumpadEnter: basicKeyToByte.KC_PENT,
  NumpadEqual: basicKeyToByte.KC_PEQL,
  NumpadMultiply: basicKeyToByte.KC_PAST,
  NumpadSubtract: basicKeyToByte.KC_PMNS,
};

export function getIndexByEvent(evt: KeyboardEvent): number {
  const code = evt.code;
  const byte =
    evtToKeyByte[code as keyof typeof evtToKeyByte] ||
    evtToKeyByte[evt.key as keyof typeof evtToKeyByte];
  if (byte) {
    return matrixKeycodes.indexOf(byte);
  }
  return -1;
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
    case 'AudioVolumeUp': {
      return 'KC_VOLU';
    }
    case 'AudioVolumeDown': {
      return 'KC_VOLD';
    }
    case 'AudioVolumeMute': {
      return 'KC_MUTE';
    }
    default:
      console.error('Unreacheable keydown code', evt);
  }
}
