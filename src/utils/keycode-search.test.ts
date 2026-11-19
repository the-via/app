import {describe, expect, it} from 'vitest';
import {getKeycodes, getOtherMenu, type IKeycode} from './key';
import {getBasicKeyDict} from './key-to-byte/dictionary-store';
import {
  buildSearchIndex,
  MIN_SEARCH_SCORE,
  scoreTerm,
  searchKeycodes,
} from './keycode-search';

const kc = (name: string, code: string, extra: Partial<IKeycode> = {}) => ({
  name,
  code,
  ...extra,
});

describe('keycode search', () => {
  // The pool VIA builds for a protocol 12 board: every category plus "Other".
  const realIndex = buildSearchIndex([
    ...getKeycodes().flatMap((menu) => menu.keycodes),
    ...getOtherMenu(getBasicKeyDict(12)).keycodes,
  ]);

  type Case = {
    query: string;
    /** Codes that must all be found. */
    has?: string[];
    /** Code that must rank first. */
    first?: string;
    /** Codes that must not be found. */
    not?: string[];
  };

  // Every search input we care about, run against the real keycode data so
  // changes to the keycode lists or alias tables are caught too.
  const cases: Case[] = [
    // Ranking and normalisation
    {query: 'a', has: ['KC_A', 'KC_LALT'], first: 'KC_A'},
    {query: 'esc', first: 'KC_ESC'},
    {query: '  ESC ', first: 'KC_ESC'},
    {query: '1', has: ['KC_1', 'KC_P1'], first: 'KC_1'},
    {query: '!', has: ['KC_1', 'S(KC_1)']},
    {query: 'win', has: ['KC_LGUI', 'KC_RGUI'], first: 'KC_LGUI'},
    // Name, short name, title and code
    {query: 'pgup', first: 'KC_PGUP'},
    {query: 'nothing', first: 'KC_NO'},
    {query: 'print screen', first: 'KC_PSCR'},
    {query: 'printscreen', first: 'KC_PSCR'},
    // Aliases
    {query: 'escape', first: 'KC_ESC'},
    {query: 'screenshot', first: 'KC_PSCR'},
    {query: 'exclamation', has: ['KC_1', 'S(KC_1)']},
    {query: 'hash', has: ['KC_3', 'S(KC_3)']},
    {query: 'dollar', has: ['KC_4', 'S(KC_4)']},
    {query: 'tilde', has: ['KC_GRV', 'S(KC_GRV)']},
    {query: 'pipe', has: ['KC_BSLS', 'S(KC_BSLS)']},
    {query: 'underscore', has: ['KC_MINS', 'S(KC_MINS)']},
    {query: 'bootloader', has: ['RESET']},
    {query: 'calculator', has: ['KC_CALC']},
    {query: 'clipboard', has: ['KC_CUT', 'KC_COPY', 'KC_PASTE']},
    {query: 'function', has: ['KC_F1', 'KC_F12']},
    {query: 'browser', has: ['KC_WWW_HOME', 'KC_WWW_BACK']},
    {query: 'japanese', has: ['KC_KANA', 'KC_MHEN']},
    {query: 'korean', has: ['KC_HANJ', 'KC_HAEN']},
    // Families matched by code prefix
    {query: 'midi', has: ['MI_C', 'MI_OCTU']},
    {query: 'haptic', has: ['HPT_ON', 'HPT_TOG']},
    {query: 'auto shift', has: ['KC_ASUP', 'KC_ASTG']},
    {query: 'layer', has: ['MO(1)', 'TG(1)', 'OSL(1)', 'TO(1)']},
    // Fuzzy: characters in order
    {query: 'bkspc', has: ['KC_BSPC']},
    {query: 'pscr', has: ['KC_PSCR']},
    {query: 'rwnd', has: ['KC_MRWD']},
    // No match
    {query: 'zzz', not: ['KC_A', 'KC_ESC']},
  ];

  it('finds and ranks keys for each query', () => {
    const failures: string[] = [];
    for (const {query, has = [], first, not = []} of cases) {
      const found = searchKeycodes(realIndex, query).map((r) => r.keycode.code);
      const missing = has.filter((code) => !found.includes(code));
      if (missing.length) failures.push(`"${query}" is missing ${missing}`);
      if (first && found[0] !== first) {
        failures.push(`"${query}" ranks ${found[0]} first, not ${first}`);
      }
      const unexpected = not.filter((code) => found.includes(code));
      if (unexpected.length) failures.push(`"${query}" found ${unexpected}`);
    }
    expect(failures).toEqual([]);
  });

  describe('mechanics', () => {
    const index = buildSearchIndex([
      kc('Esc', 'KC_ESC'),
      kc('Caps Lock', 'KC_CAPS'),
      kc('B', 'KC_B'),
      kc('A', 'KC_A'),
      kc('Left Alt', 'KC_LALT'),
    ]);

    it('scores exact > prefix > word start > substring > subsequence', () => {
      const scores = [
        scoreTerm('tab', 'tab'),
        scoreTerm('table', 'tab'),
        scoreTerm('left tab', 'tab'),
        scoreTerm('stab', 'tab'),
        scoreTerm('t a b', 'tab'),
      ];
      expect(scores[0]).toBe(100);
      expect([...scores].sort((a, b) => b - a)).toEqual(scores);
      expect(scores[4]).toBeGreaterThan(0);
      expect(scoreTerm('escape', 'zzz')).toBe(0);
    });

    it('gives an exact match a score of 100 and sorts best first', () => {
      const results = searchKeycodes(index, 'a');
      expect(results[0]).toMatchObject({score: 100});
      expect(results[0].keycode.code).toBe('KC_A');
      expect(results.length).toBeGreaterThan(1);
      const scores = results.map((r) => r.score);
      expect([...scores].sort((a, b) => b - a)).toEqual(scores);
    });

    it('drops results below the minimum score', () => {
      for (const {score} of searchKeycodes(index, 'a')) {
        expect(score).toBeGreaterThanOrEqual(MIN_SEARCH_SCORE);
      }
      expect(searchKeycodes(index, 'a', 101)).toEqual([]);
    });

    it('keeps index order for equal scores', () => {
      const tie = buildSearchIndex([kc('X', 'KC_X1'), kc('X', 'KC_X2')]);
      expect(searchKeycodes(tie, 'x').map((r) => r.keycode.code)).toEqual([
        'KC_X1',
        'KC_X2',
      ]);
    });

    it('returns every key, in index order, for an empty or blank query', () => {
      const all = ['KC_ESC', 'KC_CAPS', 'KC_B', 'KC_A', 'KC_LALT'];
      for (const query of ['', '   ']) {
        const found = searchKeycodes(index, query).map((r) => r.keycode.code);
        expect(found).toEqual(all);
      }
    });

    it('collapses duplicate codes', () => {
      const dup = buildSearchIndex([kc('A', 'KC_A'), kc('A again', 'KC_A')]);
      expect(dup).toHaveLength(1);
    });

    it('uses extra terms, e.g. layout-specific names', () => {
      const withExtra = buildSearchIndex([kc('Q', 'KC_Q')], ({code}) =>
        code === 'KC_Q' ? ['ä'] : [],
      );
      expect(searchKeycodes(withExtra, 'ä')[0].keycode.code).toBe('KC_Q');
    });
  });
});
