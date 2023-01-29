import React from 'react';
import {AccentSlider} from './accent-slider';
import {mapEvtToKeycode} from 'src/utils/key';
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
  'KC_ESC',
  'KC_F1',
  'KC_F2',
  'KC_F3',
  'KC_F4',
  'KC_F5',
  'KC_F6',
  'KC_F7',
  'KC_F8',
  'KC_F9',
  'KC_F10',
  'KC_F11',
  'KC_F12',
  'KC_PSCR',
  'KC_SLCK',
  'KC_PAUS',
  'KC_SLEP',
  'KC_MUTE',
  'KC_VOLD',
  'KC_VOLU',
  // Row 1
  'KC_GRV',
  'KC_1',
  'KC_2',
  'KC_3',
  'KC_4',
  'KC_5',
  'KC_6',
  'KC_7',
  'KC_8',
  'KC_9',
  'KC_0',
  'KC_MINS',
  'KC_EQL',
  'KC_BSPC',
  'KC_INS',
  'KC_HOME',
  'KC_PGUP',
  'KC_NLCK',
  'KC_PSLS',
  'KC_PAST',
  'KC_PMNS',
  // Row 2
  'KC_TAB',
  'KC_Q',
  'KC_W',
  'KC_E',
  'KC_R',
  'KC_T',
  'KC_Y',
  'KC_U',
  'KC_I',
  'KC_O',
  'KC_P',
  'KC_LBRC',
  'KC_RBRC',
  'KC_BSLS',
  'KC_DEL',
  'KC_END',
  'KC_PGDN',
  'KC_P7',
  'KC_P8',
  'KC_P9',
  'KC_PPLS',
  // Row 3
  'KC_CAPS',
  'KC_A',
  'KC_S',
  'KC_D',
  'KC_F',
  'KC_G',
  'KC_H',
  'KC_J',
  'KC_K',
  'KC_L',
  'KC_SCLN',
  'KC_QUOT',
  'KC_ENT',
  'KC_P4',
  'KC_P5',
  'KC_P6',
  // Row 4
  'KC_LSFT',
  'KC_Z',
  'KC_X',
  'KC_C',
  'KC_V',
  'KC_B',
  'KC_N',
  'KC_M',
  'KC_COMM',
  'KC_DOT',
  'KC_SLSH',
  'KC_RSFT',
  'KC_UP',
  'KC_P1',
  'KC_P2',
  'KC_P3',
  'KC_PENT',
  // Row 5
  'KC_LCTL',
  'KC_LGUI',
  'KC_LALT',
  'KC_SPC',
  'KC_RALT',
  'KC_RGUI',
  'KC_MENU',
  'KC_RCTL',
  'KC_LEFT',
  'KC_DOWN',
  'KC_RGHT',
  'KC_P0',
  'KC_PDOT',
];

export function getIndexByEvent(evt: KeyboardEvent): number {
  const keycode = mapEvtToKeycode(evt);
  if (keycode) {
    return matrixKeycodes.indexOf(keycode);
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
