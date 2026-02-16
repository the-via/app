import {describe, it, expect} from 'vitest';
import {getBasicKeyDict} from '../key-to-byte/dictionary-store';

describe('getBasicKeyDict', () => {
  it('returns v12 dictionary for version 13', () => {
    const dict = getBasicKeyDict(13);
    expect(dict._QK_MOD_TAP).toBe(0x2000);
  });

  it('returns v12 dictionary for version 12', () => {
    const dict = getBasicKeyDict(12);
    expect(dict._QK_MOD_TAP).toBe(0x2000);
  });

  it('returns v11 dictionary for version 11', () => {
    const dict = getBasicKeyDict(11);
    expect(dict._QK_MOD_TAP).toBe(0x2000);
    expect(dict._QK_LAYER_MOD_MASK).toBe(0x1f);
  });

  it('returns v10 dictionary for version 10', () => {
    const dict = getBasicKeyDict(10);
    expect(dict._QK_MOD_TAP).toBe(0x6000);
  });

  it('returns default dictionary for unknown version', () => {
    const dict = getBasicKeyDict(9);
    expect(dict._QK_MOD_TAP).toBe(0x6000);
    expect(dict._QK_LAYER_MOD_MASK).toBe(0x0f);
  });

  it('v12 and default have different _QK_MOD_TAP ranges', () => {
    const v12 = getBasicKeyDict(12);
    const def = getBasicKeyDict(9);
    expect(v12._QK_MOD_TAP).not.toBe(def._QK_MOD_TAP);
  });

  it('v11 and v12 have different _QK_MACRO ranges', () => {
    const v12 = getBasicKeyDict(12);
    const v11 = getBasicKeyDict(11);
    expect(v12._QK_MACRO).not.toBe(v11._QK_MACRO);
  });

  it('all versions have required quantum range keys', () => {
    for (const version of [9, 10, 11, 12, 13]) {
      const dict = getBasicKeyDict(version);
      expect(dict._QK_MODS).toBeDefined();
      expect(dict._QK_MOD_TAP).toBeDefined();
      expect(dict._QK_LAYER_TAP).toBeDefined();
      expect(dict._QK_MOMENTARY).toBeDefined();
      expect(dict._QK_KB).toBeDefined();
      expect(dict._QK_MACRO).toBeDefined();
    }
  });
});
