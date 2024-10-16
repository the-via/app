import {THEMES} from 'src/utils/themes';

export const updateCSSVariables = (themeName: keyof typeof THEMES) => {
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

export const getColorByte = (color: string) => {
  const cleanedColor = color.replace('#', '');
  const r = parseInt(cleanedColor[0], 16) * 16 + parseInt(cleanedColor[1], 16);
  const g = parseInt(cleanedColor[2], 16) * 16 + parseInt(cleanedColor[3], 16);
  const b = parseInt(cleanedColor[4], 16) * 16 + parseInt(cleanedColor[5], 16);
  return [r, g, b];
};

export const getDarkenedColor = (color: string, multiplier = 0.8) => {
  const [r, g, b] = getColorByte(color);
  const hr = Math.round(r * multiplier).toString(16);
  const hg = Math.round(g * multiplier).toString(16);
  const hb = Math.round(b * multiplier).toString(16);
  const res = `#${hr.padStart(2, '0')}${hg.padStart(2, '0')}${hb.padStart(
    2,
    '0',
  )}`;
  return res;
};

export const getHSV = (color: string) => {
  const [rPrime, gPrime, bPrime] = getColorByte(color).map((c) => c / 255);
  const [cmax, cmin] = [
    Math.max(rPrime, gPrime, bPrime),
    Math.min(rPrime, gPrime, bPrime),
  ];
  const delta = cmax - cmin;
  let h = 60;
  let s = 0;
  let v = cmax;
  if (delta === 0) {
    h = h * 0;
  } else if (cmax === rPrime) {
    h = h * (((gPrime - bPrime) / delta) % 6);
  } else if (cmax === gPrime) {
    h = h * ((bPrime - rPrime) / delta + 2);
  } else if (cmax === bPrime) {
    h = h * ((rPrime - gPrime) / delta + 4);
  }
  if (cmax !== 0) {
    s = delta / cmax;
  }
  return [(h + 360) % 360, s, v];
};
export const getHSVFrom256 = (color: number[]) => {
  return [Math.round((360 * color[0]) / 255), Math.round(color[1] / 255), 1];
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

export function hsToRgb({hue, sat}: {hue: number; sat: number}) {
  sat = sat / 255;
  hue = Math.round(360 * hue) / 255;
  const c = sat;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = 1 - c;
  const [r, g, b] = getRGBPrime(hue, c, x).map((n) =>
    Math.round(255 * (m + n)),
  );

  return [r, g, b];
}

export function getHex({hue, sat}: {hue: number; sat: number}) {
  let [r, g, b] = hsToRgb({hue, sat}).map((x) => x.toString(16));
  if (r.length == 1) r = '0' + r;
  if (g.length == 1) g = '0' + g;
  if (b.length == 1) b = '0' + b;
  return '#' + r + g + b;
}
