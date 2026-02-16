import {describe, it, expect} from 'vitest';
import {
  advancedStringToKeycode,
  advancedKeycodeToString,
  anyKeycodeToString,
} from '../advanced-keys';
import defaultKeyToByte from '../key-to-byte/default';

const basicKeyToByte: Record<string, number> = {
  ...defaultKeyToByte,
  KC_A: 0x0004,
  KC_B: 0x0005,
  KC_SPC: 0x002c,
};

const byteToKey: Record<number, string> = Object.entries(basicKeyToByte).reduce(
  (acc, [key, value]) => ({...acc, [value]: key}),
  {} as Record<number, string>,
);

describe('advancedStringToKeycode', () => {
  it('parses MO(layer)', () => {
    const result = advancedStringToKeycode('MO(1)', basicKeyToByte);
    expect(result).toBe(basicKeyToByte._QK_MOMENTARY | 1);
  });

  it('parses TG(layer)', () => {
    const result = advancedStringToKeycode('TG(2)', basicKeyToByte);
    expect(result).toBe(basicKeyToByte._QK_TOGGLE_LAYER | 2);
  });

  it('parses TO(layer)', () => {
    const result = advancedStringToKeycode('TO(0)', basicKeyToByte);
    expect(result).toBe(basicKeyToByte._QK_TO | 0);
  });

  it('parses DF(layer)', () => {
    const result = advancedStringToKeycode('DF(3)', basicKeyToByte);
    expect(result).toBe(basicKeyToByte._QK_DEF_LAYER | 3);
  });

  it('parses OSL(layer)', () => {
    const result = advancedStringToKeycode('OSL(1)', basicKeyToByte);
    expect(result).toBe(basicKeyToByte._QK_ONE_SHOT_LAYER | 1);
  });

  it('parses TT(layer)', () => {
    const result = advancedStringToKeycode('TT(2)', basicKeyToByte);
    expect(result).toBe(basicKeyToByte._QK_LAYER_TAP_TOGGLE | 2);
  });

  it('parses LT(layer, kc)', () => {
    const result = advancedStringToKeycode('LT(1,KC_SPC)', basicKeyToByte);
    expect(result).toBe(basicKeyToByte._QK_LAYER_TAP | (1 << 8) | 0x002c);
  });

  it('parses CUSTOM(n)', () => {
    const result = advancedStringToKeycode('CUSTOM(0)', basicKeyToByte);
    expect(result).toBe(basicKeyToByte._QK_KB);
  });

  it('parses MACRO(n)', () => {
    const result = advancedStringToKeycode('MACRO(0)', basicKeyToByte);
    expect(result).toBe(basicKeyToByte._QK_MACRO);
  });

  it('parses OSM(mod)', () => {
    const result = advancedStringToKeycode('OSM(MOD_LCTL)', basicKeyToByte);
    expect(result).toBe(basicKeyToByte._QK_ONE_SHOT_MOD | 0x0001);
  });

  it('parses MT(mod, kc)', () => {
    const result = advancedStringToKeycode('MT(MOD_LSFT,KC_A)', basicKeyToByte);
    expect(result).toBe(basicKeyToByte._QK_MOD_TAP | (0x0002 << 8) | 0x0004);
  });

  it('parses modifier combinations with |', () => {
    const result = advancedStringToKeycode(
      'OSM(MOD_LCTL|MOD_LSFT)',
      basicKeyToByte,
    );
    expect(result).toBe(basicKeyToByte._QK_ONE_SHOT_MOD | 0x0003);
  });

  it('parses modifier key wrapping (e.g. C(KC_A))', () => {
    const result = advancedStringToKeycode('C(KC_A)', basicKeyToByte);
    expect(result).toBe(0x0100 | 0x0004); // QK_LCTL | KC_A
  });

  it('returns 0 for invalid input', () => {
    expect(advancedStringToKeycode('INVALID', basicKeyToByte)).toBe(0);
  });

  it('returns 0 for negative layer', () => {
    expect(advancedStringToKeycode('MO(-1)', basicKeyToByte)).toBe(0);
  });

  it('is case-insensitive', () => {
    const upper = advancedStringToKeycode('MO(1)', basicKeyToByte);
    const lower = advancedStringToKeycode('mo(1)', basicKeyToByte);
    expect(upper).toBe(lower);
  });
});

describe('advancedKeycodeToString', () => {
  it('converts MO keycode back to string', () => {
    const keycode = basicKeyToByte._QK_MOMENTARY | 1;
    const result = advancedKeycodeToString(keycode, basicKeyToByte, byteToKey);
    expect(result).toBe('MO(1)');
  });

  it('converts TG keycode back to string', () => {
    const keycode = basicKeyToByte._QK_TOGGLE_LAYER | 3;
    const result = advancedKeycodeToString(keycode, basicKeyToByte, byteToKey);
    expect(result).toBe('TG(3)');
  });

  it('converts CUSTOM keycode back to string', () => {
    const keycode = basicKeyToByte._QK_KB + 5;
    const result = advancedKeycodeToString(keycode, basicKeyToByte, byteToKey);
    expect(result).toBe('CUSTOM(5)');
  });

  it('converts LT keycode back to string', () => {
    const keycode = basicKeyToByte._QK_LAYER_TAP | (2 << 8) | 0x002c;
    const result = advancedKeycodeToString(keycode, basicKeyToByte, byteToKey);
    expect(result).toBe('LT(2,KC_SPC)');
  });

  it('returns null for unrecognized keycode', () => {
    const result = advancedKeycodeToString(0x0001, basicKeyToByte, byteToKey);
    expect(result).toBeNull();
  });
});

describe('anyKeycodeToString', () => {
  it('returns basic key name for simple keycodes', () => {
    const result = anyKeycodeToString(0x0004, basicKeyToByte, byteToKey);
    expect(result).toBe('KC_A');
  });

  it('returns advanced string for advanced keycodes', () => {
    const keycode = basicKeyToByte._QK_MOMENTARY | 1;
    const result = anyKeycodeToString(keycode, basicKeyToByte, byteToKey);
    expect(result).toBe('MO(1)');
  });
});
