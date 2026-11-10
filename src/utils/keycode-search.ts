import type {IKeycode} from './key';

/**
 * Extra search keywords, keyed by keycode `code`.
 *
 * Only list terms that can't be derived automatically: the index already
 * uses each keycode's name, shortName, title and code (without `KC_`).
 * Keys without an entry here are still searchable.
 */
const numpadAliases: Record<string, string[]> = Object.fromEntries(
  Array.from({length: 10}, (_, n) => [
    `KC_P${n}`,
    [`numpad ${n}`, `keypad ${n}`, `num ${n}`],
  ]),
);

export const KEYCODE_ALIASES: Record<string, string[]> = {
  KC_ESC: ['escape'],
  KC_GRV: ['backtick', 'grave', 'tilde'],
  KC_MINS: ['minus', 'dash', 'hyphen', 'underscore'],
  KC_EQL: ['equals', 'equal', 'plus'],
  KC_LBRC: ['left bracket', 'open bracket', 'brace'],
  KC_RBRC: ['right bracket', 'close bracket', 'brace'],
  KC_BSLS: ['backslash', 'back slash', 'pipe'],
  KC_SCLN: ['semicolon', 'colon'],
  KC_QUOT: ['quote', 'apostrophe', 'single quote', 'double quote'],
  KC_COMM: ['comma', 'less than'],
  KC_DOT: ['period', 'full stop', 'greater than'],
  KC_SLSH: ['slash', 'forward slash', 'question mark'],
  KC_PSCR: ['print screen', 'printscreen', 'screenshot', 'prtsc', 'prtscn'],
  KC_SLCK: ['scroll lock', 'scrolllock'],
  KC_PAUS: ['pause break', 'break'],
  KC_BSPC: ['backspace', 'back space'],
  KC_DEL: ['delete'],
  KC_INS: ['insert'],
  KC_PGUP: ['page up', 'pageup', 'pgup'],
  KC_PGDN: ['page down', 'pagedown', 'pgdn'],
  KC_ENT: ['return', 'enter'],
  KC_SPC: ['spacebar', 'space bar'],
  KC_CAPS: ['caps lock', 'capslock'],
  KC_NLCK: ['num lock', 'numlock'],
  KC_APP: ['menu', 'context menu', 'application'],
  KC_LSFT: ['shift', 'left shift'],
  KC_RSFT: ['shift', 'right shift'],
  KC_LCTL: ['control', 'ctrl', 'left control'],
  KC_RCTL: ['control', 'ctrl', 'right control'],
  KC_LALT: ['alt', 'option', 'opt', 'left alt'],
  KC_RALT: ['alt', 'option', 'opt', 'altgr', 'right alt'],
  KC_LGUI: ['gui', 'win', 'windows', 'cmd', 'command', 'super', 'meta'],
  KC_RGUI: ['gui', 'win', 'windows', 'cmd', 'command', 'super', 'meta'],
  KC_LEFT: ['left arrow', 'arrow left'],
  KC_RGHT: ['right arrow', 'arrow right'],
  KC_UP: ['up arrow', 'arrow up'],
  KC_DOWN: ['down arrow', 'arrow down'],
  KC_PSLS: ['numpad divide', 'keypad divide', 'divide', 'slash'],
  KC_PAST: ['numpad multiply', 'keypad multiply', 'multiply', 'asterisk'],
  KC_PMNS: ['numpad minus', 'keypad minus', 'subtract'],
  KC_PPLS: ['numpad plus', 'keypad plus', 'add'],
  KC_PDOT: ['numpad dot', 'keypad decimal', 'decimal'],
  KC_PEQL: ['numpad equals', 'keypad equals'],
  KC_PCMM: ['numpad comma', 'keypad comma'],
  KC_VOLD: ['volume down', 'quieter'],
  KC_VOLU: ['volume up', 'louder'],
  KC_MUTE: ['mute', 'volume mute'],
  KC_MPLY: ['play', 'pause', 'play pause', 'media play'],
  KC_MSTP: ['stop', 'media stop'],
  KC_MPRV: ['previous track', 'prev track', 'previous', 'back'],
  KC_MNXT: ['next track', 'skip', 'next'],
  KC_MRWD: ['rewind'],
  KC_MFFD: ['fast forward'],
  KC_EJCT: ['eject'],
  KC_TRNS: ['transparent', 'trans', 'passthrough'],
  KC_NO: ['none', 'nothing', 'blank', 'no key'],
  ...numpadAliases,
};

/**
 * Spoken names for symbol keys, keyed by the base keycode (without `KC_`).
 * Applied to both the plain key (`KC_1`, labelled "!\n1") and its shifted
 * variant (`S(KC_1)`, labelled "!").
 */
const SYMBOL_WORDS: Record<string, string[]> = {
  GRV: ['tilde', 'backtick', 'grave'],
  '1': ['exclamation', 'exclamation mark', 'bang'],
  '2': ['at', 'at sign'],
  '3': ['hash', 'pound', 'number sign', 'octothorpe'],
  '4': ['dollar', 'dollar sign'],
  '5': ['percent', 'percent sign'],
  '6': ['caret', 'circumflex'],
  '7': ['ampersand', 'and'],
  '8': ['asterisk', 'star'],
  '9': ['left parenthesis', 'open parenthesis', 'paren'],
  '0': ['right parenthesis', 'close parenthesis', 'paren'],
  MINS: ['underscore'],
  EQL: ['plus'],
  LBRC: ['left curly brace', 'open brace', 'curly'],
  RBRC: ['right curly brace', 'close brace', 'curly'],
  BSLS: ['pipe', 'vertical bar'],
  SCLN: ['colon'],
  QUOT: ['double quote', 'quotation mark'],
  COMM: ['less than', 'left angle bracket'],
  DOT: ['greater than', 'right angle bracket'],
  SLSH: ['question mark'],
};

/**
 * Aliases shared by a whole family of keycodes, matched on the code prefix.
 * Saves listing hundreds of MIDI/haptic/etc. keys one by one.
 */
const FAMILY_ALIASES: [RegExp, string[]][] = [
  [/^MI_/, ['midi']],
  [/^HPT_/, ['haptic', 'haptics', 'vibration']],
  [/^KC_AS(UP|DN|RP|TG|ON|OFF)$/, ['auto shift', 'autoshift']],
  [/^CMB_/, ['combo', 'combos']],
  [/^DYN_/, ['dynamic macro']],
  [/^CLICKY_/, ['clicky', 'click sound']],
  [/^(AU|MU)_/, ['audio', 'music', 'sound']],
  [/^KC_MS_/, ['mouse']],
  [/^KC_WWW_/, ['browser', 'web']],
  [/^KC_INT\d/, ['international']],
  [/^KC_LANG\d/, ['language', 'input method']],
  [/^(RGB_|RM_|UG_)/, ['rgb', 'light', 'lighting']],
  [/^BL_/, ['backlight', 'light', 'lighting']],
  [/^VLK_/, ['volume lock']],
  [/^OUT_/, ['output']],
  [/^(OSL|TT|TO|DF|MO|TG|LT)\(/, ['layer']],
];

/** One-off synonyms for keys whose names don't say what they do. */
const EXTRA_ALIASES: Record<string, string[]> = {
  RESET: ['bootloader', 'flash', 'dfu'],
  QK_BOOT: ['bootloader', 'flash', 'dfu', 'reset'],
  QK_REBOOT: ['reboot', 'restart'],
  QK_CLEAR_EEPROM: ['clear eeprom', 'factory reset'],
  KC_CALC: ['calculator'],
  KC_MYCM: ['my computer', 'computer'],
  KC_MAIL: ['email', 'e-mail'],
  KC_PWR: ['power'],
  KC_SLEP: ['sleep', 'suspend'],
  KC_CUT: ['clipboard'],
  KC_COPY: ['clipboard'],
  KC_PASTE: ['clipboard'],
  KC_HYPR: ['hyper'],
  KC_MEH: ['meh'],
  KC_GESC: ['grave escape', 'escape', 'backtick'],
  KC_MHEN: ['muhenkan', 'japanese'],
  KC_HENK: ['henkan', 'japanese'],
  KC_KANA: ['kana', 'hiragana', 'katakana', 'japanese'],
  KC_HANJ: ['hanja', 'korean'],
  KC_HAEN: ['hangul', 'korean'],
  KC_JYEN: ['yen', 'japanese'],
  KC_RO: ['ro', 'japanese', 'backslash'],
  KC_F1: ['function'],
  KC_F2: ['function'],
  KC_F3: ['function'],
  KC_F4: ['function'],
  KC_F5: ['function'],
  KC_F6: ['function'],
  KC_F7: ['function'],
  KC_F8: ['function'],
  KC_F9: ['function'],
  KC_F10: ['function'],
  KC_F11: ['function'],
  KC_F12: ['function'],
};

/** All aliases for a keycode: explicit, symbol names and family synonyms. */
export function getAliases(code: string): string[] {
  const base = code.match(/^(?:S\()?KC_([^)]+)\)?$/)?.[1];
  return [
    ...(KEYCODE_ALIASES[code] ?? []),
    ...(EXTRA_ALIASES[code] ?? []),
    ...(base ? (SYMBOL_WORDS[base] ?? []) : []),
    ...FAMILY_ALIASES.filter(([re]) => re.test(code)).flatMap(([, a]) => a),
  ];
}

export type SearchTermKind = 'name' | 'alias' | 'shortName' | 'title' | 'code';

interface SearchTerm {
  text: string;
  /** Score multiplier: names/aliases rank above codes and titles. */
  weight: number;
}

export interface SearchIndexEntry {
  keycode: IKeycode;
  terms: SearchTerm[];
}

export type SearchIndex = SearchIndexEntry[];

/** `score` is 0–100: 100 is an exact match. */
export interface SearchResult {
  keycode: IKeycode;
  score: number;
}

const TERM_WEIGHTS: Record<SearchTermKind, number> = {
  name: 1,
  alias: 1,
  shortName: 1,
  title: 0.9,
  code: 0.9,
};

/** Results scoring below this are not shown. */
export const MIN_SEARCH_SCORE = 20;

const normalize = (s: string) => s.toLowerCase().replace(/\s+/g, ' ').trim();

/** Optional hook to add terms not on the keycode, e.g. layout-specific names. */
export type ExtraTerms = (keycode: IKeycode) => string[];

function termsForKeycode(keycode: IKeycode, extra?: ExtraTerms): SearchTerm[] {
  const raw: [SearchTermKind, string][] = [];
  const name = keycode.name ?? '';

  // Multi-legend names like "!\n1" match on the whole label and each legend.
  raw.push(['name', name.replace(/\n/g, ' ')]);
  if (name.includes('\n')) {
    name.split('\n').forEach((part) => raw.push(['name', part]));
  }
  if (keycode.shortName) raw.push(['shortName', keycode.shortName]);
  if (keycode.title) raw.push(['title', keycode.title]);
  getAliases(keycode.code).forEach((a) => raw.push(['alias', a]));
  (extra?.(keycode) ?? []).forEach((e) => raw.push(['name', e]));

  raw.push(['code', keycode.code]);
  const stripped = keycode.code.replace(/^KC_/, '').replace(/_/g, ' ');
  if (stripped !== keycode.code) raw.push(['code', stripped]);

  const seen = new Set<string>();
  const terms: SearchTerm[] = [];
  const add = (text: string, weight: number) => {
    const key = `${weight}|${text}`;
    if (text && !seen.has(key)) {
      seen.add(key);
      terms.push({text, weight});
    }
  };
  raw.forEach(([kind, value]) => {
    const text = normalize(value);
    add(text, TERM_WEIGHTS[kind]);
    // "print screen" should also be found by "printscreen".
    add(text.replace(/ /g, ''), TERM_WEIGHTS[kind]);
  });
  return terms;
}

/** Builds the index once per keycode set. Duplicate codes are collapsed. */
export function buildSearchIndex(
  keycodes: IKeycode[],
  extra?: ExtraTerms,
): SearchIndex {
  const seen = new Set<string>();
  const index: SearchIndex = [];
  for (const keycode of keycodes) {
    if (!keycode.code || seen.has(keycode.code)) continue;
    seen.add(keycode.code);
    index.push({keycode, terms: termsForKeycode(keycode, extra)});
  }
  return index;
}

function isSubsequence(query: string, text: string) {
  let i = 0;
  for (let j = 0; j < text.length && i < query.length; j++) {
    if (text[j] === query[i]) i++;
  }
  return i === query.length;
}

/** Scores one term against the query, 0–100. */
export function scoreTerm(text: string, query: string): number {
  if (text === query) return 100;
  const ratio = query.length / text.length;
  if (text.startsWith(query)) return 70 + 20 * ratio;
  if (text.split(/[ \-+]/).some((word) => word.startsWith(query))) {
    return 55 + 20 * ratio;
  }
  if (text.includes(query)) return 40 + 15 * ratio;
  // Fuzzy: characters in order ("bkspc" -> "backspace"). Skip for 1-char
  // queries, where it would match nearly everything.
  if (query.length >= 2 && isSubsequence(query, text)) return 10 + 25 * ratio;
  return 0;
}

/**
 * Returns matching keycodes ranked by score, best first. Equal scores keep
 * their index order. An empty query returns the whole index.
 */
export function searchKeycodes(
  index: SearchIndex,
  rawQuery: string,
  minScore = MIN_SEARCH_SCORE,
): SearchResult[] {
  const query = normalize(rawQuery);
  // No query means no filter: every keycode, in index order.
  if (!query) {
    return index.map(({keycode}) => ({keycode, score: 100}));
  }

  const results: (SearchResult & {order: number})[] = [];
  index.forEach(({keycode, terms}, order) => {
    let best = 0;
    for (const {text, weight} of terms) {
      const score = scoreTerm(text, query) * weight;
      if (score > best) best = score;
    }
    if (best >= minScore) results.push({keycode, score: best, order});
  });

  return results
    .sort((a, b) => b.score - a.score || a.order - b.order)
    .map(({keycode, score}) => ({keycode, score}));
}
