import {basicKeyToByte, byteToKey} from './key';

const quantumRanges = {
  QK_MODS: 0x0100,
  QK_RMODS_MIN: 0x1000,
  QK_MODS_MAX: 0x1fff,
  QK_FUNCTION: 0x2000,
  QK_FUNCTION_MAX: 0x2fff,
  QK_MACRO: 0x3000,
  QK_MACRO_MAX: 0x3fff,
  QK_LAYER_TAP: 0x4000,
  QK_LAYER_TAP_MAX: 0x4fff,
  QK_TO: 0x5000,
  QK_TO_MAX: 0x50ff,
  QK_MOMENTARY: 0x5100,
  QK_MOMENTARY_MAX: 0x51ff,
  QK_DEF_LAYER: 0x5200,
  QK_DEF_LAYER_MAX: 0x52ff,
  QK_TOGGLE_LAYER: 0x5300,
  QK_TOGGLE_LAYER_MAX: 0x53ff,
  QK_ONE_SHOT_LAYER: 0x5400,
  QK_ONE_SHOT_LAYER_MAX: 0x54ff,
  QK_ONE_SHOT_MOD: 0x5500,
  QK_ONE_SHOT_MOD_MAX: 0x55ff,
  QK_TAP_DANCE: 0x5700,
  QK_TAP_DANCE_MAX: 0x57ff,
  QK_LAYER_TAP_TOGGLE: 0x5800,
  QK_LAYER_TAP_TOGGLE_MAX: 0x58ff,
  QK_LAYER_MOD: 0x5900,
  QK_LAYER_MOD_MAX: 0x59ff,
  QK_MOD_TAP: 0x6000,
  QK_MOD_TAP_MAX: 0x7fff
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
  QK_RGUI: 0x1800
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
  MOD_MEH: 0x0007
};

const ON_PRESS = 1;

const topLevelMacroToValue = {
  DF: quantumRanges.QK_DEF_LAYER, //DF(layer)
  MO: quantumRanges.QK_MOMENTARY, // MO(layer)
  LM: quantumRanges.QK_LAYER_MOD, // LM(layer, mod)
  LT: quantumRanges.QK_LAYER_TAP, // LT(layer, kc)
  OSL: quantumRanges.QK_ONE_SHOT_LAYER, // OSL(layer)
  TG: quantumRanges.QK_TOGGLE_LAYER, //  TG(layer)
  TO: quantumRanges.QK_TO, // TO(layer)
  TT: quantumRanges.QK_LAYER_TAP_TOGGLE, // TT(layer)
  MT: quantumRanges.QK_MOD_TAP, // MT(mod, kc)
  OSM: quantumRanges.QK_ONE_SHOT_MOD //OSM(mod)
};

const modifierKeyToValue = {
  LCTL: modCodes.QK_LCTL,
  C: modCodes.QK_LCTL,
  LSFT: modCodes.QK_LSFT,
  S: modCodes.QK_LSFT,
  LALT: modCodes.QK_LALT,
  A: modCodes.QK_LALT,
  LGUI: modCodes.QK_LGUI,
  G: modCodes.QK_LGUI,
  LCMD: modCodes.QK_LGUI,
  LWIN: modCodes.QK_LGUI,
  RCTL: modCodes.QK_RCTL,
  RSFT: modCodes.QK_RSFT,
  RALT: modCodes.QK_RALT,
  ALGR: modCodes.QK_RALT,
  RGUI: modCodes.QK_RGUI,
  RCMD: modCodes.QK_RGUI,
  RWIN: modCodes.QK_RGUI,
  SGUI: modCodes.QK_LGUI | modCodes.QK_LSFT,
  SCMD: modCodes.QK_LGUI | modCodes.QK_LSFT,
  SWIN: modCodes.QK_LGUI | modCodes.QK_LSFT,
  LCA: modCodes.QK_LCTL | modCodes.QK_LALT,
  LCAG: modCodes.QK_LCTL | modCodes.QK_LALT | modCodes.QK_LGUI,
  MEH: modCodes.QK_LCTL | modCodes.QK_LALT | modCodes.QK_LSFT,
  HYPR:
    modCodes.QK_LCTL | modCodes.QK_LALT | modCodes.QK_LSFT | modCodes.QK_LGUI
};

const modifierValuetoKey = Object.entries(modifierKeyToValue).reduce(
  (acc, [key, value]) => ({...acc, [value]: key}),
  {}
);

const topLevelValueToMacro = Object.entries(topLevelMacroToValue).reduce(
  (acc, [key, value]) => ({...acc, [value]: key}),
  {}
);

const valueToRange = Object.entries(quantumRanges)
  .map(([key, value]) => [value, key])
  .sort((a, b) => (a[0] as number) - (b[0] as number));

// MT, OSM, LM only take MOD
// Everything else can use the KC mods
// This is some brute forcey stuff, but it works.
// If it returns 0, it means validation failed
export const advancedStringToKeycode = (inputString: string): number => {
  const upperString = inputString.toUpperCase();
  const parts = upperString.split(/\(|\)/).map(part => part.trim());
  if (Object.keys(topLevelMacroToValue).includes(parts[0])) {
    return parseTopLevelMacro(parts);
  } else if (Object.keys(modifierKeyToValue).includes(parts[0])) {
    return parseModifierCode(parts);
  }
  return 0;
};

export const advancedKeycodeToString = (inputKeycode: number): string => {
  /* Find the range we are in first */
  let lastRange = null;
  let lastValue;
  for (let [value, rangeName] of valueToRange) {
    if (inputKeycode < value) {
      break;
    }
    lastRange = rangeName;
    lastValue = value;
  }
  const topLevelModKeys = ['QK_MODS', 'QK_RMODS_MIN'];
  if (topLevelModKeys.includes(lastRange)) {
    return topLevelModToString(inputKeycode);
  }
  let humanReadable = topLevelValueToMacro[lastValue] + '(';
  let remainder = inputKeycode & ~lastValue;
  let layer = 0;
  let keycode = '';
  let modValue = 0;
  switch (lastRange) {
    case 'QK_MOMENTARY':
    case 'QK_DEF_LAYER':
    case 'QK_TOGGLE_LAYER':
    case 'QK_ONE_SHOT_LAYER':
    case 'QK_LAYER_TAP_TOGGLE':
      humanReadable += remainder + ')';
      break;
    case 'QK_LAYER_TAP':
      layer = remainder >> 8;
      keycode = byteToKey[remainder & 0xff];
      humanReadable += layer + ',' + keycode + ')';
      break;
    case 'QK_TO':
      layer = ~(ON_PRESS << 4) & remainder;
      humanReadable += layer + ')';
      break;
    case 'QK_ONE_SHOT_MOD':
      humanReadable += modValueToString(remainder) + ')';
      break;
    case 'QK_LAYER_MOD':
      layer = remainder >> 4;
      modValue = remainder & 0xf;
      humanReadable += layer + ',' + modValueToString(modValue) + ')';
      break;
    case 'QK_MOD_TAP':
      modValue = (remainder >> 8) & 0x1f;
      keycode = byteToKey[remainder & 0xff];
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
      part => !excluded.includes(part[0]) && (part[1] & modMask) === part[1]
    )
    .map(part => part[0]);
  return qualifyingStrings.join(' | ');
};

const topLevelModToString = (modNumber: number): string => {
  const keycode = byteToKey[modNumber & 0x00ff];
  const enabledMods = Object.entries(modifierValuetoKey)
    .filter(part => {
      const current = Number.parseInt(part[0]);
      return (current & modNumber) === current;
    })
    .map(part => part[1]);
  return enabledMods.join('(') + '(' + keycode + ')'.repeat(enabledMods.length);
};

const parseTopLevelMacro = (inputParts: string[]): number => {
  const topLevelKey = inputParts[0];
  const parameter = inputParts[1];
  let [param1, param2] = ['', ''];
  let layer = 0;
  let mods = 0;
  switch (topLevelKey) {
    case 'MO':
    case 'DF':
    case 'TG':
    case 'OSL':
    case 'TT':
      layer = Number.parseInt(parameter);
      if (layer === NaN || layer < 0) {
        return 0;
      }
      return topLevelMacroToValue[topLevelKey] | (layer & 0xff);
    case 'TO': //#define TO(layer) (QK_TO | (ON_PRESS << 0x4) | ((layer)&0xFF))
      layer = Number.parseInt(parameter);
      if (layer === NaN || layer < 0) {
        return 0;
      }
      return (
        topLevelMacroToValue[topLevelKey] | (ON_PRESS << 0x4) | (layer & 0xff)
      );
    case 'OSM': //#define OSM(mod) (QK_ONE_SHOT_MOD | ((mod)&0xFF))
      mods = parseMods(parameter);
      if (mods === 0) {
        return 0;
      }
      return topLevelMacroToValue[topLevelKey] | (mods & 0xff);
    case 'LM': //#define LM(layer, mod) (QK_LAYER_MOD | (((layer)&0xF) << 4) | ((mod)&0xF))
      [param1, param2] = parameter.split(',').map(s => s.trim());
      layer = Number.parseInt(param1);
      mods = parseMods(param2);
      if (layer === NaN || layer < 0 || mods === 0) {
        return 0;
      }
      return (
        topLevelMacroToValue[topLevelKey] | ((layer & 0xf) << 4) | (mods & 0xff)
      );
    case 'LT': //#define LT(layer, kc) (QK_LAYER_TAP | (((layer)&0xF) << 8) | ((kc)&0xFF))
      [param1, param2] = parameter.split(',').map(s => s.trim());
      layer = Number.parseInt(param1);
      if (
        layer === NaN ||
        layer < 0 ||
        !basicKeyToByte.hasOwnProperty(param2)
      ) {
        return 0;
      }
      return (
        topLevelMacroToValue[topLevelKey] |
        ((layer & 0xf) << 8) |
        basicKeyToByte[param2]
      );
    case 'MT': // #define MT(mod, kc) (QK_MOD_TAP | (((mod)&0x1F) << 8) | ((kc)&0xFF))
      [param1, param2] = parameter.split(',').map(s => s.trim());
      mods = parseMods(param1);
      if (mods === 0 || !basicKeyToByte.hasOwnProperty(param2)) {
        return 0;
      }
      return (
        topLevelMacroToValue[topLevelKey] |
        ((mods & 0x1f) << 8) |
        (basicKeyToByte[param2] & 0xff)
      );
    default:
      return 0;
  }
};

const parseMods = (input: string): number => {
  const parts = input.split('|').map(s => s.trim());
  if (
    !parts.reduce((acc, part) => acc && modMasks.hasOwnProperty(part), true)
  ) {
    return 0;
  }
  return parts.reduce((acc, part) => acc | modMasks[part], 0);
};

const parseModifierCode = (inputParts: string[]): number => {
  const realParts = inputParts.filter(nonce => nonce.length !== 0);
  const bytes = realParts.map((part, idx) => {
    if (idx === realParts.length - 1) {
      /* this must be a KC code */
      return basicKeyToByte.hasOwnProperty(part) ? basicKeyToByte[part] : null;
    } else {
      /* This must be a top level modifier */
      return modifierKeyToValue.hasOwnProperty(part)
        ? modifierKeyToValue[part]
        : null;
    }
  });
  if (bytes.find(e => e === null)) {
    return 0;
  }
  return bytes.reduce((acc, byte) => acc | byte, 0);
};

export const anyKeycodeToString = (input: number) => {
  let currentValue = '';
  const advancedParsed = advancedKeycodeToString(input);
  if (byteToKey[input]) {
    currentValue = byteToKey[input];
  } else if (advancedParsed !== null) {
    currentValue = advancedParsed;
  }
  return currentValue;
};
