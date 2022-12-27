import {THEMES} from '@the-via/reader';

export const updateCSSVariables = (themeName: string) => {
  const selectedTheme = THEMES[themeName] || THEMES['OLIVIA_DARK'];

  document.documentElement.style.setProperty(
    '--color_accent',
    selectedTheme.accent.c,
  );
  document.documentElement.style.setProperty(
    '--color_inside-accent',
    selectedTheme.accent.t,
  );
};

export const getRandomColor = () =>
  Array(3)
    .fill(0)
    .reduce(
      (a) => `${a}${(~~(Math.random() * 255)).toString(16).padStart(2, '0')}`,
      '#',
    );

export function getRGBPrime(
  hue: number,
  c: number,
  x: number,
): [number, number, number] {
  if (hue >= 0 && hue < 60) {
    return [c, x, 0];
  } else if (hue >= 60 && hue < 120) {
    return [x, c, 0];
  } else if (hue >= 120 && hue < 180) {
    return [0, c, x];
  } else if (hue >= 180 && hue < 240) {
    return [0, x, c];
  } else if (hue >= 240 && hue < 300) {
    return [x, 0, c];
  } else if (hue >= 300 && hue < 360) {
    return [c, 0, x];
  } else if (hue === 360) {
    return [c, x, 0];
  }
  throw new Error('Invalid hue');
}

export const getBrightenedColor = (color: string, multiplier = 0.8) => {
  const cleanedColor = color.replace('#', '');
  const r = parseInt(cleanedColor[0], 16) * 16 + parseInt(cleanedColor[1], 16);
  const g = parseInt(cleanedColor[2], 16) * 16 + parseInt(cleanedColor[3], 16);
  const b = parseInt(cleanedColor[4], 16) * 16 + parseInt(cleanedColor[5], 16);
  const hr = Math.min(Math.round(r / multiplier), 256).toString(16);
  const hg = Math.min(Math.round(g / multiplier), 256).toString(16);
  const hb = Math.min(Math.round(b / multiplier), 256).toString(16);
  const res = `#${hr.padStart(2, '0')}${hg.padStart(2, '0')}${hb.padStart(
    2,
    '0',
  )}`;
  return res;
};

export const getDarkenedColor = (color: string, multiplier = 0.8) => {
  const cleanedColor = color.replace('#', '');
  const r = parseInt(cleanedColor[0], 16) * 16 + parseInt(cleanedColor[1], 16);
  const g = parseInt(cleanedColor[2], 16) * 16 + parseInt(cleanedColor[3], 16);
  const b = parseInt(cleanedColor[4], 16) * 16 + parseInt(cleanedColor[5], 16);
  const hr = Math.round(r * multiplier).toString(16);
  const hg = Math.round(g * multiplier).toString(16);
  const hb = Math.round(b * multiplier).toString(16);
  const res = `#${hr.padStart(2, '0')}${hg.padStart(2, '0')}${hb.padStart(
    2,
    '0',
  )}`;
  return res;
};

export function getRGB({hue, sat}: {hue: number; sat: number}): string {
  sat = sat / 255;
  hue = Math.round(360 * hue) / 255;
  const c = sat;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = 1 - c;
  const [r, g, b] = getRGBPrime(hue, c, x).map((n) =>
    Math.round(255 * (m + n)),
  );
  return `rgba(${r},${g},${b},1)`;
}

export function toDegrees(rad: number): number {
  return rad * (180 / Math.PI);
}

export function calcRadialHue(x: number, y: number) {
  if (x < 200 && y < 200) {
    const nX = 200 - x;
    const nY = 200 - y;
    return 2 * Math.PI - Math.atan(nX / nY);
  } else if (x > 200 && y < 200) {
    const nX = x - 200;
    const nY = 200 - y;
    return Math.atan(nX / nY);
  } else if (x < 200 && y > 200) {
    const nX = 200 - x;
    const nY = y - 200;
    return Math.PI + Math.atan(nX / nY);
  } else if (x > 200 && y > 200) {
    const nX = x - 200;
    const nY = y - 200;
    return 0.5 * Math.PI + Math.atan(nY / nX);
  } else if (x === 200) {
    return y > 200 ? Math.PI : 0;
  } else if (y === 200) {
    return x >= 200 ? 0.5 * Math.PI : 1.5 * Math.PI;
  }
}

export function calcRadialMagnitude(x: number, y: number) {
  if (x < 200 && y < 200) {
    const nX = 200 - x;
    const nY = 200 - y;
    return Math.sqrt(nX * nX + nY * nY) / 200;
  } else if (x > 200 && y < 200) {
    const nX = x - 200;
    const nY = 200 - y;
    return Math.sqrt(nX * nX + nY * nY) / 200;
  } else if (x < 200 && y > 200) {
    const nX = 200 - x;
    const nY = y - 200;
    return Math.sqrt(nX * nX + nY * nY) / 200;
  } else if (x > 200 && y > 200) {
    const nX = x - 200;
    const nY = y - 200;
    return Math.sqrt(nX * nX + nY * nY) / 200;
  } else if (x === 200) {
    return y > 200 ? (y - 200) / 200 : (200 - y) / 200;
  } else if (y === 200) {
    return x > 200 ? (x - 200) / 200 : (200 - x) / 200;
  }
}
