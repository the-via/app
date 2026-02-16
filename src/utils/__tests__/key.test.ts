import {describe, it, expect} from 'vitest';
import {
  isAlpha,
  isNumpadNumber,
  isArrowKey,
  isNumpadSymbol,
  isMultiLegend,
  isNumericOrShiftedSymbol,
  isNumericSymbol,
  isCustomKeycodeByte,
  isMacroKeycodeByte,
  getCustomKeycodeIndex,
  getMacroKeycodeIndex,
  getShortNameForKeycode,
} from '../key';
import type {IKeycode} from '../key';
import defaultKeyToByte from '../key-to-byte/default';

describe('isAlpha', () => {
  it('returns true for single uppercase letter', () => {
    expect(isAlpha('A')).toBe(true);
    expect(isAlpha('Z')).toBe(true);
  });

  it('returns true for single lowercase letter', () => {
    expect(isAlpha('a')).toBe(true);
    expect(isAlpha('z')).toBe(true);
  });

  it('returns false for digits', () => {
    expect(isAlpha('1')).toBe(false);
  });

  it('returns false for multi-char strings', () => {
    expect(isAlpha('AB')).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(isAlpha('')).toBe(false);
  });
});

describe('isNumpadNumber', () => {
  it('returns true for single digits', () => {
    expect(isNumpadNumber('0')).toBe(true);
    expect(isNumpadNumber('9')).toBe(true);
  });

  it('returns false for letters', () => {
    expect(isNumpadNumber('a')).toBe(false);
  });

  it('returns false for multi-char', () => {
    expect(isNumpadNumber('12')).toBe(false);
  });
});

describe('isArrowKey', () => {
  it('returns true for standard arrows', () => {
    expect(isArrowKey('←')).toBe(true);
    expect(isArrowKey('↑')).toBe(true);
    expect(isArrowKey('→')).toBe(true);
    expect(isArrowKey('↓')).toBe(true);
  });

  it('returns true for unicode arrow variants', () => {
    expect(isArrowKey('🠗')).toBe(true);
    expect(isArrowKey('🠕')).toBe(true);
    expect(isArrowKey('🠖')).toBe(true);
    expect(isArrowKey('🠔')).toBe(true);
  });

  it('returns false for non-arrow characters', () => {
    expect(isArrowKey('x')).toBe(false);
    expect(isArrowKey('')).toBe(false);
  });
});

describe('isNumpadSymbol', () => {
  it('returns true for numpad symbols', () => {
    expect(isNumpadSymbol('-')).toBe(true);
    expect(isNumpadSymbol('+')).toBe(true);
    expect(isNumpadSymbol('.')).toBe(true);
    expect(isNumpadSymbol('÷')).toBe(true);
    expect(isNumpadSymbol('×')).toBe(true);
  });

  it('returns false for non-numpad chars', () => {
    expect(isNumpadSymbol('a')).toBe(false);
    expect(isNumpadSymbol('*')).toBe(false);
  });
});

describe('isMultiLegend', () => {
  it('returns true for shifted key labels like "!\\n1"', () => {
    expect(isMultiLegend('!\n1')).toBe(true);
    expect(isMultiLegend('@\n2')).toBe(true);
  });

  it('returns false for single characters', () => {
    expect(isMultiLegend('A')).toBe(false);
    expect(isMultiLegend('1')).toBe(false);
  });

  it('returns false for multi-char not starting with shifted symbol', () => {
    expect(isMultiLegend('AB')).toBe(false);
  });
});

describe('isNumericOrShiftedSymbol', () => {
  it('returns true for digits', () => {
    expect(isNumericOrShiftedSymbol('1')).toBe(true);
    expect(isNumericOrShiftedSymbol('0')).toBe(true);
  });

  it('returns true for shifted symbols', () => {
    expect(isNumericOrShiftedSymbol('!')).toBe(true);
    expect(isNumericOrShiftedSymbol('@')).toBe(true);
    expect(isNumericOrShiftedSymbol('#')).toBe(true);
  });

  it('returns false for letters', () => {
    expect(isNumericOrShiftedSymbol('a')).toBe(false);
  });

  it('returns false for multi-char strings', () => {
    expect(isNumericOrShiftedSymbol('12')).toBe(false);
  });
});

describe('isNumericSymbol', () => {
  it('returns true for multi-char starting with shifted symbol', () => {
    expect(isNumericSymbol('!\n1')).toBe(true);
  });

  it('returns false for single shifted symbol', () => {
    expect(isNumericSymbol('!')).toBe(false);
  });

  it('returns false for plain text', () => {
    expect(isNumericSymbol('AB')).toBe(false);
  });
});

describe('isCustomKeycodeByte / getCustomKeycodeIndex', () => {
  it('returns true for byte in custom range', () => {
    expect(isCustomKeycodeByte(defaultKeyToByte._QK_KB, defaultKeyToByte)).toBe(
      true,
    );
    expect(
      isCustomKeycodeByte(defaultKeyToByte._QK_KB_MAX, defaultKeyToByte),
    ).toBe(true);
  });

  it('returns false for byte outside custom range', () => {
    expect(
      isCustomKeycodeByte(defaultKeyToByte._QK_KB - 1, defaultKeyToByte),
    ).toBe(false);
    expect(
      isCustomKeycodeByte(defaultKeyToByte._QK_KB_MAX + 1, defaultKeyToByte),
    ).toBe(false);
  });

  it('returns correct custom index', () => {
    expect(
      getCustomKeycodeIndex(defaultKeyToByte._QK_KB, defaultKeyToByte),
    ).toBe(0);
    expect(
      getCustomKeycodeIndex(defaultKeyToByte._QK_KB + 5, defaultKeyToByte),
    ).toBe(5);
  });
});

describe('isMacroKeycodeByte / getMacroKeycodeIndex', () => {
  it('returns true for byte in macro range', () => {
    expect(
      isMacroKeycodeByte(defaultKeyToByte._QK_MACRO, defaultKeyToByte),
    ).toBe(true);
    expect(
      isMacroKeycodeByte(defaultKeyToByte._QK_MACRO_MAX, defaultKeyToByte),
    ).toBe(true);
  });

  it('returns false for byte outside macro range', () => {
    expect(
      isMacroKeycodeByte(defaultKeyToByte._QK_MACRO - 1, defaultKeyToByte),
    ).toBe(false);
  });

  it('returns correct macro index', () => {
    expect(
      getMacroKeycodeIndex(defaultKeyToByte._QK_MACRO, defaultKeyToByte),
    ).toBe(0);
    expect(
      getMacroKeycodeIndex(defaultKeyToByte._QK_MACRO + 3, defaultKeyToByte),
    ).toBe(3);
  });
});

describe('getShortNameForKeycode', () => {
  const backspace: IKeycode = {
    name: 'Backspace',
    code: 'KC_BSPC',
    shortName: 'Bksp',
  };

  it('returns shortName at size <= 150', () => {
    expect(getShortNameForKeycode(backspace, 150)).toBe('Bksp');
    expect(getShortNameForKeycode(backspace, 100)).toBe('Bksp');
  });

  it('returns full name at size > 150 when name is short', () => {
    const esc: IKeycode = {name: 'Esc', code: 'KC_ESC'};
    expect(getShortNameForKeycode(esc, 200)).toBe('Esc');
  });

  it('returns full name at size > 150', () => {
    expect(getShortNameForKeycode(backspace, 200)).toBe('Backspace');
  });
});
