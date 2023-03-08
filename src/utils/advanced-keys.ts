import type {KeycodeDict} from './keycode-dict';

const quantumRangesKeys = [
  'QK_MODS',
  'QK_MODS_MAX',
  'QK_MOD_TAP',
  'QK_MOD_TAP_MAX',
  'QK_LAYER_TAP',
  'QK_LAYER_TAP_MAX',
  'QK_LAYER_MOD',
  'QK_LAYER_MOD_MAX',
  'QK_TO',
  'QK_TO_MAX',
  'QK_MOMENTARY',
  'QK_MOMENTARY_MAX',
  'QK_DEF_LAYER',
  'QK_DEF_LAYER_MAX',
  'QK_TOGGLE_LAYER',
  'QK_TOGGLE_LAYER_MAX',
  'QK_ONE_SHOT_LAYER',
  'QK_ONE_SHOT_LAYER_MAX',
  'QK_ONE_SHOT_MOD',
  'QK_ONE_SHOT_MOD_MAX',
  'QK_LAYER_TAP_TOGGLE',
  'QK_LAYER_TAP_TOGGLE_MAX',
  'QK_CUSTOM',
  'QK_CUSTOM_MAX',
  'QK_MACRO',
  'QK_MACRO_MAX',
];

// TODO: REFACTOR MOAR HERE
const quantumRanges = (keycodeDict: KeycodeDict): Record<string, number> => {
  return Object.keys(keycodeDict.ranges).reduce(
    (acc, key) =>
      quantumRangesKeys.includes(key)
        ? {...acc, [key]: keycodeDict.ranges[key]}
        : acc,
    {},
  );
};

const modCodes = {
  QK_LCTL: 0x0100,
  QK_LSFT: 0x0200,
  QK_LALT: 0x0400,
  QK_LGUI: 0x0800,
  QK_RMODS_MIN: 0x1000,
  QK_RCTL: 0x1100,
  QK_RSFT: 0x1200,
  QK_RALT: 0x1400,
  QK_RGUI: 0x1800,
};

const modMasks = {
  MOD_LCTL: 0x0001,
  MOD_LSFT: 0x0002,
  MOD_LALT: 0x0004,
  MOD_LGUI: 0x0008,
  MOD_RCTL: 0x0011,
  MOD_RSFT: 0x0012,
  MOD_RALT: 0x0014,
  MOD_RGUI: 0x0018,
  MOD_HYPR: 0x000f,
  MOD_MEH: 0x0007,
};

const topLevelMacroToValue = {
  MT: 'QK_MOD_TAP', // MT(mod, kc)
  LT: 'QK_LAYER_TAP', // LT(layer, kc)
  LM: 'QK_LAYER_MOD', // LM(layer, mod)
  TO: 'QK_TO', // TO(layer)
  MO: 'QK_MOMENTARY', // MO(layer)
  DF: 'QK_DEF_LAYER', //DF(layer)
  TG: 'QK_TOGGLE_LAYER', //  TG(layer)
  OSL: 'QK_ONE_SHOT_LAYER', // OSL(layer)
  OSM: 'QK_ONE_SHOT_MOD', //OSM(mod)
  TT: 'QK_LAYER_TAP_TOGGLE', // TT(layer)
  CUSTOM: 'QK_CUSTOM', // CUSTOM(n)
  MACRO: 'QK_MACRO', // MACRO(n)
};

const modifierKeyToValue = {
  LCTL: modCodes.QK_LCTL,
  C: modCodes.QK_LCTL,
  LSFT: modCodes.QK_LSFT,
  S: modCodes.QK_LSFT,
  LALT: modCodes.QK_LALT,
  A: modCodes.QK_LALT,
  LGUI: modCodes.QK_LGUI,
  LCMD: modCodes.QK_LGUI,
  LWIN: modCodes.QK_LGUI,
  G: modCodes.QK_LGUI,
  RCTL: modCodes.QK_RCTL,
  RSFT: modCodes.QK_RSFT,
  ALGR: modCodes.QK_RALT,
  RALT: modCodes.QK_RALT,
  RCMD: modCodes.QK_RGUI,
  RWIN: modCodes.QK_RGUI,
  RGUI: modCodes.QK_RGUI,
  SCMD: modCodes.QK_LSFT | modCodes.QK_LGUI,
  SWIN: modCodes.QK_LSFT | modCodes.QK_LGUI,
  SGUI: modCodes.QK_LSFT | modCodes.QK_LGUI,
  LSG: modCodes.QK_LSFT | modCodes.QK_LGUI,
  LAG: modCodes.QK_LALT | modCodes.QK_LGUI,
  RSG: modCodes.QK_RSFT | modCodes.QK_RGUI,
  RAG: modCodes.QK_RALT | modCodes.QK_RGUI,
  LCA: modCodes.QK_LCTL | modCodes.QK_LALT,
  LSA: modCodes.QK_LSFT | modCodes.QK_LALT,
  SAGR: modCodes.QK_RSFT | modCodes.QK_RALT,
  RSA: modCodes.QK_RSFT | modCodes.QK_RALT,
  RCS: modCodes.QK_RCTL | modCodes.QK_RSFT,
  LCAG: modCodes.QK_LCTL | modCodes.QK_LALT | modCodes.QK_LGUI,
  MEH: modCodes.QK_LCTL | modCodes.QK_LALT | modCodes.QK_LSFT,
  HYPR:
    modCodes.QK_LCTL | modCodes.QK_LALT | modCodes.QK_LSFT | modCodes.QK_LGUI,
};

// All modifier combos
const modifierValueToKey: Record<number, string> = Object.entries(
  modifierKeyToValue,
).reduce((acc, [key, value]) => ({...acc, [value]: key}), {});

// Single left modifiers (as opposed to combos)
const leftModifierValueToKey: Record<number, string> = Object.entries(
  modifierKeyToValue,
)
  .filter(
    ([_, value]) =>
      Object.values(modCodes).includes(value) && value < modCodes.QK_RMODS_MIN,
  )
  .reduce((acc, [key, value]) => ({...acc, [value]: key}), {});

// Single right modifiers (as opposed to combos)
const rightModifierValueToKey: Record<number, string> = Object.entries(
  modifierKeyToValue,
)
  .filter(
    ([_, value]) =>
      Object.values(modCodes).includes(value) && value >= modCodes.QK_RMODS_MIN,
  )
  .reduce((acc, [key, value]) => ({...acc, [value]: key}), {});

const topLevelValueToMacro = (
  keycodeDict: KeycodeDict,
): Record<number, string> => {
  return Object.entries(topLevelMacroToValue).reduce(
    (acc, [key, value]) => ({...acc, [keycodeDict.ranges[value]]: key}),
    {},
  );
};

// MT, OSM, LM only take MOD
// Everything else can use the KC mods
// This is some brute forcey stuff, but it works.
// If it returns 0, it means validation failed
export const advancedStringToKeycode = (
  inputString: string,
  keycodeDict: KeycodeDict,
): number => {
  const upperString = inputString.toUpperCase();
  const parts = upperString.split(/\(|\)/).map((part) => part.trim());
  if (Object.keys(topLevelMacroToValue).includes(parts[0])) {
    return parseTopLevelMacro(parts, keycodeDict);
  } else if (Object.keys(modifierKeyToValue).includes(parts[0])) {
    return parseModifierCode(parts, keycodeDict);
  }
  return 0;
};

export const advancedKeycodeToString = (
  inputKeycode: number,
  keycodeDict: KeycodeDict,
): string | null => {
  // TODO: REFACTOR MOAR HERE
  let valueToRange = Object.entries(quantumRanges(keycodeDict))
    .map(([key, value]) => [value, key])
    .sort((a, b) => (a[0] as number) - (b[0] as number));

  /* Find the range we are in first */
  let lastRange = null;
  let lastValue: number = -1;
  for (let i = 0; i < valueToRange.length; i += 2) {
    if (
      inputKeycode >= valueToRange[i][0] &&
      inputKeycode <= valueToRange[i + 1][0]
    ) {
      lastRange = valueToRange[i][1];
      lastValue = +valueToRange[i][0];
    }
  }
  const topLevelModKeys = ['QK_MODS'];
  if (topLevelModKeys.includes(lastRange as string)) {
    return topLevelModToString(inputKeycode, keycodeDict);
  }
  let humanReadable: string | null =
    (topLevelValueToMacro(keycodeDict) as any)[lastValue] + '(';
  let remainder = inputKeycode & ~lastValue;
  let layer = 0;
  let keycode = '';
  let modValue = 0;
  switch (lastRange) {
    case 'QK_KB':
    case 'QK_MACRO':
      humanReadable += inputKeycode - lastValue + ')';
      break;
    case 'QK_MOMENTARY':
    case 'QK_DEF_LAYER':
    case 'QK_TOGGLE_LAYER':
    case 'QK_ONE_SHOT_LAYER':
    case 'QK_LAYER_TAP_TOGGLE':
    case 'QK_TO':
      humanReadable += remainder + ')';
      break;
    case 'QK_LAYER_TAP':
      layer = remainder >> 8;
      keycode = keycodeDict.byteToKeycode[remainder & 0xff];
      humanReadable += layer + ',' + keycode + ')';
      break;
    case 'QK_ONE_SHOT_MOD':
      humanReadable += modValueToString(remainder) + ')';
      break;
    case 'QK_LAYER_MOD':
      let mask = keycodeDict.ranges.QK_LAYER_MOD_MASK;
      let shift = Math.log2(mask + 1);
      layer = remainder >> shift;
      modValue = remainder & mask;
      humanReadable += layer + ',' + modValueToString(modValue) + ')';
      break;
    case 'QK_MOD_TAP':
      modValue = (remainder >> 8) & 0x1f;
      keycode = keycodeDict.byteToKeycode[remainder & 0xff];
      humanReadable += modValueToString(modValue) + ',' + keycode + ')';
      break;
    default:
      humanReadable = null;
  }
  return humanReadable;
};

const modValueToString = (modMask: number): string => {
  const excluded = ['MOD_HYPR', 'MOD_MEH'];
  const qualifyingStrings = Object.entries(modMasks)
    .filter(
      (part) => !excluded.includes(part[0]) && (part[1] & modMask) === part[1],
    )
    .map((part) => part[0]);
  return qualifyingStrings.join(' | ');
};

const topLevelModToString = (
  keycode: number,
  keycodeDict: KeycodeDict,
): string => {
  const containedKeycode = keycodeDict.byteToKeycode[keycode & 0x00ff];
  const modifierValue = keycode & 0x1f00;
  // if we find an exact match (like HYPR or MEH or LAG), use that
  const modifierKey = modifierValueToKey[modifierValue];
  if (modifierKey != undefined) {
    return modifierKey + '(' + containedKeycode + ')';
  }

  // Left and right mods are mutually exclusive.
  // Test the bit which is common to all right mods,
  // and generate the string from one of two lookups.
  const enabledMods = Object.entries(
    modifierValue & modCodes.QK_RMODS_MIN
      ? rightModifierValueToKey
      : leftModifierValueToKey,
  )
    .filter((part) => {
      const current = Number.parseInt(part[0]);
      return (current & modifierValue) === current;
    })
    .map((part) => part[1]);
  return (
    enabledMods.join('(') +
    '(' +
    containedKeycode +
    ')'.repeat(enabledMods.length)
  );
};

const parseTopLevelMacro = (
  inputParts: string[],
  keycodeDict: KeycodeDict,
): number => {
  const topLevelKey = inputParts[0];
  const parameter = inputParts[1] ?? '';
  let [param1, param2] = ['', ''];
  let layer = 0;
  let mods = 0;
  switch (topLevelKey) {
    case 'MO':
    case 'DF':
    case 'TG':
    case 'OSL':
    case 'TT':
    case 'TO':
      layer = Number.parseInt(parameter);
      if (layer < 0) {
        return 0;
      }
      return (
        keycodeDict.ranges[topLevelMacroToValue[topLevelKey]] | (layer & 0xff)
      );
    case 'OSM': //#define OSM(mod) (QK_ONE_SHOT_MOD | ((mod)&0xFF))
      mods = parseMods(parameter);
      if (mods === 0) {
        return 0;
      }
      return (
        keycodeDict.ranges[topLevelMacroToValue[topLevelKey]] | (mods & 0xff)
      );
    case 'LM': //#define LM(layer, mod) (QK_LAYER_MOD | (((layer)&0xF) << 4) | ((mod)&0xF))
      [param1, param2] = parameter.split(',').map((s) => s.trim());
      let mask = keycodeDict.ranges.QK_LAYER_MOD_MASK;
      let shift = Math.log2(mask + 1);
      layer = Number.parseInt(param1);
      mods = parseMods(param2);
      if (layer < 0 || mods === 0) {
        return 0;
      }
      return (
        keycodeDict.ranges[topLevelMacroToValue[topLevelKey]] |
        ((layer & 0xf) << shift) |
        (mods & mask)
      );
    case 'LT': //#define LT(layer, kc) (QK_LAYER_TAP | (((layer)&0xF) << 8) | ((kc)&0xFF))
      // TODO: handle keycode > 0xff
      [param1, param2] = parameter.split(',').map((s) => s.trim());
      layer = Number.parseInt(param1);
      if (layer < 0 || keycodeDict.keycodes[param2] === undefined) {
        return 0;
      }
      return (
        keycodeDict.keycodes[topLevelMacroToValue[topLevelKey]].byte |
        ((layer & 0xf) << 8) |
        keycodeDict.keycodes[param2].byte
      );
    case 'MT': // #define MT(mod, kc) (QK_MOD_TAP | (((mod)&0x1F) << 8) | ((kc)&0xFF))
      // TODO: handle keycode > 0xff
      [param1, param2] = parameter.split(',').map((s) => s.trim());
      mods = parseMods(param1);
      if (mods === 0 || keycodeDict.keycodes[param2] === undefined) {
        return 0;
      }
      return (
        keycodeDict.ranges[topLevelMacroToValue[topLevelKey]] |
        ((mods & 0x1f) << 8) |
        (keycodeDict.keycodes[param2].byte & 0xff)
      );
    case 'CUSTOM': {
      const n = Number.parseInt(parameter);
      const nMax =
        keycodeDict.ranges.QK_CUSTOM_MAX - keycodeDict.ranges.QK_CUSTOM;
      if (n >= 0 && n <= nMax) {
        return keycodeDict.ranges[topLevelMacroToValue[topLevelKey]] + n;
      }
      return 0;
    }
    case 'MACRO': {
      const n = Number.parseInt(parameter);
      const nMax =
        keycodeDict.ranges.QK_MACRO_MAX - keycodeDict.ranges.QK_MACRO;
      if (n >= 0 && n <= nMax) {
        return keycodeDict.ranges[topLevelMacroToValue[topLevelKey]] + n;
      }
      return 0;
    }
    default:
      return 0;
  }
};

const parseMods = (input: string = ''): number => {
  const parts = input.split('|').map((s) => s.trim());
  if (
    !parts.reduce((acc, part) => acc && modMasks.hasOwnProperty(part), true)
  ) {
    return 0;
  }
  return parts.reduce(
    (acc, part) => acc | modMasks[part as keyof typeof modMasks],
    0,
  );
};

const parseModifierCode = (
  inputParts: string[],
  keycodeDict: KeycodeDict,
): number => {
  const realParts = inputParts.filter((nonce) => nonce.length !== 0);
  const bytes = realParts.map((part, idx) => {
    if (idx === realParts.length - 1) {
      /* this must be a KC code */
      return keycodeDict.keycodes[part]?.byte ?? null;
    } else {
      /* This must be a top level modifier */
      return modifierKeyToValue.hasOwnProperty(part)
        ? modifierKeyToValue[part as keyof typeof modifierKeyToValue]
        : null;
    }
  });
  if (bytes.find((e) => e === null)) {
    return 0;
  }
  return (bytes as number[]).reduce((acc, byte) => acc | byte, 0);
};

// TODO: RENAME THIS! Keycode = string rep, Byte = numeric rep
export const anyKeycodeToString = (input: number, keycodeDict: KeycodeDict) => {
  const keycode = keycodeDict.byteToKeycode[input];
  if (keycode !== undefined) {
    return keycode;
  }
  // TODO: make it return undefined
  // then change whole fn to
  // return keycodeDict.byteToKeycode[input] ?? advancedKeycodeToString(input, keycodeDict) ?? '';
  const advancedKeycode = advancedKeycodeToString(input, keycodeDict);
  if (advancedKeycode !== null) {
    return advancedKeycode;
  }
  return '';
};
