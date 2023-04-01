import {THEMES as REMOTETHEMES} from '@the-via/reader';
import {KeyColorPair} from 'src/types/keyboard-rendering';

export type Theme = {
  alpha: KeyColorPair;
  mod: KeyColorPair;
  accent: KeyColorPair;
};

export const THEMES = {
  ...{
    OLIVIA_DARK: {
      alpha: {
        c: '#363434',
        t: '#E8C4B8',
      },
      mod: {
        c: '#363434',
        t: '#E8C4B8',
      },
      accent: {
        c: '#E8C4B8',
        t: '#363434',
      },
    },
    OLIVE: {
      alpha: {
        t: '#66665A',
        c: '#D9D7C4',
      },
      mod: {
        c: '#66665A',
        t: '#9DA183',
      },
      accent: {
        c: '#9DA183',
        t: '#66665A',
      },
    },
    OLIVE_DARK: {
      alpha: {
        c: '#66665A',
        t: '#9DA183',
      },
      mod: {
        c: '#66665A',
        t: '#9DA183',
      },
      accent: {
        c: '#9DA183',
        t: '#66665A',
      },
    },
    OLNY: {
      alpha: {
        c: '#c20018',
        t: '#cfa174',
      },
      mod: {
        c: '#c20018',
        t: '#cfa174',
      },
      accent: {
        t: '#c20018',
        c: '#cfa174',
      },
    },
    GREG: {
      alpha: {
        c: '#f8c200',
        t: '#393b3b',
      },
      mod: {
        c: '#f7f2ea',
        t: '#393b3b',
      },
      accent: {
        c: '#171718',
        t: '#393b3b',
      },
    },
    CARBON_BLACK_A: {
      alpha: {
        c: '#8c93a3',
        t: '#f3f3f3',
      },
      mod: {
        c: '#3b3b3e',
        t: '#f3f3f3',
      },
      accent: {
        c: '#e66b67',
        t: '#f3f3f3',
      },
    },    
  },
  ...REMOTETHEMES,
};
