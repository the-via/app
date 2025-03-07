import {keycodesList} from './key';
const autocompleteKeycodes = {
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
  KC_PMNS: true,
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
  KC_CPNL: true,
  KC_ASST: true,
  KC_MCTL: true,
  KC_LPAD: true,
};

export const getAutocompleteKeycodes = () =>
  keycodesList.filter(
    (keycode) =>
      !!autocompleteKeycodes[keycode.code as keyof typeof autocompleteKeycodes],
  );
export function isAutocompleteKeycode(keycode: string): boolean {
  const key = keycode.toUpperCase();
  return !!autocompleteKeycodes[key as keyof typeof autocompleteKeycodes];
}
