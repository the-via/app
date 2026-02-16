import {describe, it, expect} from 'vitest';
import {
  getRGBPrime,
  getColorByte,
  getBrightenedColor,
  getDarkenedColor,
  getHSV,
  get256HSV,
  getHSVFrom256,
  toDegrees,
  calcRadialHue,
  calcRadialMagnitude,
} from '../color-math';

describe('getRGBPrime', () => {
  it('returns [c, x, 0] for hue 0-59', () => {
    expect(getRGBPrime(30, 1, 0.5)).toEqual([1, 0.5, 0]);
  });

  it('returns [x, c, 0] for hue 60-119', () => {
    expect(getRGBPrime(90, 1, 0.5)).toEqual([0.5, 1, 0]);
  });

  it('returns [0, c, x] for hue 120-179', () => {
    expect(getRGBPrime(150, 1, 0.5)).toEqual([0, 1, 0.5]);
  });

  it('returns [0, x, c] for hue 180-239', () => {
    expect(getRGBPrime(210, 1, 0.5)).toEqual([0, 0.5, 1]);
  });

  it('returns [x, 0, c] for hue 240-299', () => {
    expect(getRGBPrime(270, 1, 0.5)).toEqual([0.5, 0, 1]);
  });

  it('returns [c, 0, x] for hue 300-359', () => {
    expect(getRGBPrime(330, 1, 0.5)).toEqual([1, 0, 0.5]);
  });

  it('treats hue 360 same as hue 0', () => {
    expect(getRGBPrime(360, 1, 0.5)).toEqual([1, 0.5, 0]);
  });

  it('throws for invalid hue', () => {
    expect(() => getRGBPrime(-1, 1, 0.5)).toThrow('Invalid hue');
    expect(() => getRGBPrime(361, 1, 0.5)).toThrow('Invalid hue');
  });
});

describe('getColorByte', () => {
  it('parses red', () => {
    expect(getColorByte('#FF0000')).toEqual([255, 0, 0]);
  });

  it('parses green', () => {
    expect(getColorByte('#00FF00')).toEqual([0, 255, 0]);
  });

  it('parses blue', () => {
    expect(getColorByte('#0000FF')).toEqual([0, 0, 255]);
  });

  it('parses black', () => {
    expect(getColorByte('#000000')).toEqual([0, 0, 0]);
  });

  it('parses white', () => {
    expect(getColorByte('#FFFFFF')).toEqual([255, 255, 255]);
  });

  it('works without # prefix', () => {
    expect(getColorByte('FF0000')).toEqual([255, 0, 0]);
  });
});

describe('getBrightenedColor / getDarkenedColor', () => {
  it('brightens a color with default multiplier', () => {
    const result = getBrightenedColor('#808080');
    // 128 / 0.8 = 160 = 0xa0
    expect(result).toBe('#a0a0a0');
  });

  it('darkens a color with default multiplier', () => {
    const result = getDarkenedColor('#808080');
    // 128 * 0.8 = 102.4 ≈ 102 = 0x66
    expect(result).toBe('#666666');
  });

  it('darkens black to black', () => {
    expect(getDarkenedColor('#000000')).toBe('#000000');
  });
});

describe('getHSV', () => {
  it('returns [0, 1, 1] for pure red', () => {
    const [h, s, v] = getHSV('#FF0000');
    expect(h).toBeCloseTo(0, 0);
    expect(s).toBeCloseTo(1, 2);
    expect(v).toBeCloseTo(1, 2);
  });

  it('returns [120, 1, 1] for pure green', () => {
    const [h, s, v] = getHSV('#00FF00');
    expect(h).toBeCloseTo(120, 0);
    expect(s).toBeCloseTo(1, 2);
    expect(v).toBeCloseTo(1, 2);
  });

  it('returns [0, 0, 0] for black (grayscale, delta=0)', () => {
    const [h, s, v] = getHSV('#000000');
    expect(h).toBe(0);
    expect(s).toBe(0);
    expect(v).toBe(0);
  });

  it('returns [0, 0, 1] for white (grayscale, delta=0)', () => {
    const [h, s, v] = getHSV('#FFFFFF');
    expect(h).toBe(0);
    expect(s).toBe(0);
    expect(v).toBeCloseTo(1, 2);
  });
});

describe('get256HSV', () => {
  it('scales HSV to 0-255 range', () => {
    const [h, s, v] = get256HSV('#FF0000');
    expect(h).toBe(0);
    expect(s).toBe(255);
    expect(v).toBe(255);
  });
});

describe('getHSVFrom256', () => {
  it('converts 256-scale back to standard HSV', () => {
    const [h, s, v] = getHSVFrom256([0, 255, 255]);
    expect(h).toBe(0);
    expect(s).toBe(1);
    expect(v).toBe(1);
  });

  it('converts mid-range values', () => {
    const [h, s, v] = getHSVFrom256([128, 128, 128]);
    expect(h).toBe(181); // Math.round(360 * 128 / 255)
    expect(s).toBe(1); // Math.round(128 / 255)
    expect(v).toBe(1);
  });
});

describe('toDegrees', () => {
  it('converts 0 radians to 0 degrees', () => {
    expect(toDegrees(0)).toBe(0);
  });

  it('converts PI radians to 180 degrees', () => {
    expect(toDegrees(Math.PI)).toBeCloseTo(180, 5);
  });

  it('converts 2*PI radians to 360 degrees', () => {
    expect(toDegrees(2 * Math.PI)).toBeCloseTo(360, 5);
  });
});

describe('calcRadialHue', () => {
  it('returns 0 for top center (x=200, y<200)', () => {
    expect(calcRadialHue(200, 100)).toBe(0);
  });

  it('returns PI for bottom center (x=200, y>200)', () => {
    expect(calcRadialHue(200, 300)).toBe(Math.PI);
  });

  it('returns PI/2 for right center (x>200, y=200)', () => {
    expect(calcRadialHue(300, 200)).toBe(0.5 * Math.PI);
  });

  it('returns 1.5*PI for left center (x<200, y=200)', () => {
    expect(calcRadialHue(100, 200)).toBe(1.5 * Math.PI);
  });

  it('returns a value in Q1 (x>200, y<200)', () => {
    const result = calcRadialHue(300, 100);
    expect(result).toBeGreaterThan(0);
    expect(result).toBeLessThan(0.5 * Math.PI);
  });
});

describe('calcRadialMagnitude', () => {
  it('returns 0.5 for point halfway to edge (x=200, y=100)', () => {
    expect(calcRadialMagnitude(200, 100)).toBeCloseTo(0.5, 5);
  });

  it('returns 1 for point at edge (x=200, y=0)', () => {
    expect(calcRadialMagnitude(200, 0)).toBeCloseTo(1, 5);
  });

  it('returns 0.5 for point halfway right (x=300, y=200)', () => {
    expect(calcRadialMagnitude(300, 200)).toBeCloseTo(0.5, 5);
  });

  it('computes distance for diagonal point', () => {
    // (300, 100) -> nX=100, nY=100 -> sqrt(20000)/200 ≈ 0.707
    expect(calcRadialMagnitude(300, 100)).toBeCloseTo(Math.sqrt(2) / 2, 3);
  });
});
