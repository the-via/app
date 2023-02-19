import {EncoderBehavior} from 'src/types/types';
import type {KeyboardAPI} from '../../../../../utils/keyboard-api';

const GET_KEYBOARD_VALUE = 0x02;
const SET_KEYBOARD_VALUE = 0x03;

const KB_VALUES = {
  ENABLED_ENCODER_MODES: 0x80,
  OLED_DEFAULT_MODE: 0x81,
  ENCODER_CUSTOM: 0x82,
  OLED_MODE: 0x83,
};

export const getEncoderModes = async (api: KeyboardAPI) => {
  const bytes = [KB_VALUES.ENABLED_ENCODER_MODES];
  const [, , enabledModes] = await api.hidCommand(GET_KEYBOARD_VALUE, bytes);
  return enabledModes;
};

export const setEncoderModes = async (
  api: KeyboardAPI,
  newEncoderModes: number,
) => {
  const bytes = [KB_VALUES.ENABLED_ENCODER_MODES, newEncoderModes];
  await api.hidCommand(SET_KEYBOARD_VALUE, bytes);
};

export const getDefaultOLED = async (api: KeyboardAPI) => {
  const bytes = [KB_VALUES.OLED_DEFAULT_MODE];
  const [, , defaultMode] = await api.hidCommand(GET_KEYBOARD_VALUE, bytes);
  return defaultMode;
};

export const setDefaultOLED = async (
  api: KeyboardAPI,
  newDefaultMode: number,
) => {
  const bytes = [KB_VALUES.OLED_DEFAULT_MODE, newDefaultMode];
  await api.hidCommand(SET_KEYBOARD_VALUE, bytes);
};

export const getOLEDMode = async (api: KeyboardAPI) => {
  const bytes = [KB_VALUES.OLED_MODE];
  const [, , defaultMode] = await api.hidCommand(GET_KEYBOARD_VALUE, bytes);
  return defaultMode;
};

export const setOLEDMode = async (api: KeyboardAPI, newDefaultMode: number) => {
  const bytes = [KB_VALUES.OLED_MODE, newDefaultMode];
  await api.hidCommand(SET_KEYBOARD_VALUE, bytes);
};

export const getCustomEncoderConfig = async (
  api: KeyboardAPI,
  encoderIdx: number,
): Promise<EncoderBehavior> => {
  const bytes = [KB_VALUES.ENCODER_CUSTOM, encoderIdx];
  const raw = await api.hidCommand(GET_KEYBOARD_VALUE, bytes);
  const [, , , cw1, cw2, ccw1, ccw2, press1, press2] = raw;
  return [(cw1 << 8) | cw2, (ccw1 << 8) | ccw2, (press1 << 8) | press2];
};

export const setCustomEncoderConfig = async (
  api: KeyboardAPI,
  encoderIdx: number,
  behavior: number,
  keycode: number,
) => {
  const hi = (keycode & 0xff00) >> 8;
  const lo = keycode & 0xff;
  const bytes = [KB_VALUES.ENCODER_CUSTOM, encoderIdx, behavior, hi, lo];
  await api.hidCommand(SET_KEYBOARD_VALUE, bytes);
};
