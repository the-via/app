import React from 'react';
import {AccentSlider} from './accent-slider';
import basicKeyToByte from '../../utils/key-to-byte.json5';
let drums: any;
let square: any;
let pipe: any;
let ac: any;

// TODO: get this working in browser

//const SoundFont = require('soundfont-player');
//const callOnce = fn => {
//  let called = false;
//  return (...args: any[]) => {
//    if (!called) {
//      called = true;
//      fn(...args);
//    }
//  };
//};
//
//const loadInstruments = callOnce(() => {
//  ac = new AudioContext();
//  SoundFont.instrument(
//    new AudioContext(),
//    require('../../soundfont/acoustic_grand_piano-mp3.sfjs'),
//    {isSoundfontURL: () => true}
//  ).then(i => (drums = i));
//  SoundFont.instrument(
//    new AudioContext(),
//    require('../../soundfont/bright_acoustic_piano-mp3.sfjs'),
//    {isSoundfontURL: () => true}
//  ).then(i => (square = i));
//  SoundFont.instrument(
//    new AudioContext(),
//    require('../../soundfont/church_organ-mp3.sfjs'),
//    {isSoundfontURL: () => true}
//  ).then(i => (pipe = i));
//  console.info('Loading instruments');
//});

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

const codes = [
  17, 18, 91, 32, 93, 18, 37, 40, 39, 16, 90, 88, 67, 86, 66, 78, 77, 188, 190,
  191, 38, 17, 65, 83, 68, 70, 71, 72, 74, 75, 76, 186, 222, 13, 9, 81, 87, 69,
  82, 84, 89, 85, 73, 79, 80, 219, 221, 220, 192, 49, 50, 51, 52, 53, 54, 55,
  56, 57, 48, 189, 187, 8, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121,
  123,
];

const keyHandler: (e: KeyboardEvent) => void = (e) => {
  e.preventDefault();
  const index = codes.indexOf(e.keyCode);
  if (index < 10 && index > -1) {
    (drums as any).play(38 + index);
  } else if (index >= 10) {
    square.play(25 + index, ac.currentTime, {duration: 0.25});
  } else {
    pipe.play(25 + ~~(35 * Math.random()), ac.currentTime, {duration: 0.25});
  }
};

export function MusicalKeySlider(props: any) {
  React.useEffect(() => {
    //loadInstruments();
    return () => {
      window.removeEventListener('keydown', keyHandler);
    };
  }, []);

  return (
    <>
      <AccentSlider
        {...props}
        isChecked={false}
        onChange={(arg) =>
          arg
            ? window.addEventListener('keydown', keyHandler)
            : window.removeEventListener('keydown', keyHandler)
        }
      />
    </>
  );
}
