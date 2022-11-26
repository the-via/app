export type KeyColor = {
  c: string;
  t: string;
};

export type Theme = {
  alphas: KeyColor;
  mods: KeyColor;
  accents: KeyColor;
};

export const THEMES = {
  PBT_HEAVY_INDUSTRY: {
    alphas: {
      c: '#f7f2ea',
      t: '#000000'
    },
    mods: {
      c: '#C2C7CA',
      t: '#000000'
    },
    accents: {
      c: '#FFC700',
      t: '#000000'
    }
  },
  OLIVIA: {
    alphas: {
      c: '#f0f0f0',
      t: '#363434'
    },
    mods: {
      c: '#363434',
      t: '#E8C4B8'
    },
    accents: {
      c: '#E8C4B8',
      t: '#363434'
    }
  },
  OLIVIA_DARK: {
    alphas: {
      c: '#363434',
      t: '#E8C4B8'
    },
    mods: {
      c: '#363434',
      t: '#E8C4B8'
    },
    accents: {
      c: '#E8C4B8',
      t: '#363434'
    }
  }
};

export const RANDOM_THEME =
  Math.random() < 1 ? THEMES.OLIVIA_DARK : THEMES.OLIVIA;
