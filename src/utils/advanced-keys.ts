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
];

const quantumRanges = (
  basicKeyToByte: Record<string, number>
) : Record<string, number> => {
  return Object.keys(basicKeyToByte).reduce((acc, key) =>
    ( quantumRangesKeys.includes(key) ? {...acc, [key]:basicKeyToByte[key]} : acc)
  , {})
}

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
    modCodes.QK_LCTL | modCodes.QK_LALT | modCodes.QK_LSFT | modCodes.QK_LGUI,
};

const modifierValuetoKey = Object.entries(modifierKeyToValue).reduce(
  (acc, [key, value]) => ({...acc, [value]: key}),
  {},
);

const topLevelValueToMacro = (
  basicKeyToByte: Record<string, number>
) : Record<number, string> => {
  return Object.entries(topLevelMacroToValue).reduce(
    (acc, [key, value]) => ({...acc, [basicKeyToByte[value]]: key}),
    {});
}

// MT, OSM, LM only take MOD
// Everything else can use the KC mods
// This is some brute forcey stuff, but it works.
// If it returns 0, it means validation failed
export const advancedStringToKeycode = (
  inputString: string,
  basicKeyToByte: Record<string, number>,
): number => {
  const upperString = inputString.toUpperCase();
  const parts = upperString.split(/\(|\)/).map((part) => part.trim());
  if (Object.keys(topLevelMacroToValue).includes(parts[0])) {
    return parseTopLevelMacro(parts, basicKeyToByte);
  } else if (Object.keys(modifierKeyToValue).includes(parts[0])) {
    return parseModifierCode(parts, basicKeyToByte);
  }
  return 0;
};

export const advancedKeycodeToString = (
  inputKeycode: number,
  basicKeyToByte: Record<string, number>,
  byteToKey: Record<number, string>,
): string | null => {
  let valueToRange = Object.entries(quantumRanges(basicKeyToByte))
    .map(([key, value]) => [value, key])
    .sort((a, b) => (a[0] as number) - (b[0] as number));

  /* Find the range we are in first */
  let lastRange = null;
  let lastValue: number = -1;
  const btk = byteToKey;
  for (let [value, rangeName] of valueToRange) {
    if (inputKeycode < value) {
      break;
    }
    lastRange = rangeName;
    lastValue = +value;
  }
  const topLevelModKeys = ['QK_MODS'];
  if (topLevelModKeys.includes(lastRange as string)) {
    return topLevelModToString(inputKeycode, basicKeyToByte, byteToKey);
  }
  let humanReadable: string | null =
    (topLevelValueToMacro(basicKeyToByte) as any)[lastValue] + '(';
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
    case 'QK_TO':
      humanReadable += remainder + ')';
      break;
    case 'QK_LAYER_TAP':
      layer = remainder >> 8;
      keycode = btk[remainder & 0xff];
      humanReadable += layer + ',' + keycode + ')';
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
      (part) => !excluded.includes(part[0]) && (part[1] & modMask) === part[1],
    )
    .map((part) => part[0]);
  return qualifyingStrings.join(' | ');
};

const topLevelModToString = (
  modNumber: number,
  basicKeyToByte: Record<string, number>,
  byteToKey: Record<number, string>,
): string => {
  const keycode = byteToKey[modNumber & 0x00ff];
  const enabledMods = Object.entries(modifierValuetoKey)
    .filter((part) => {
      const current = Number.parseInt(part[0]);
      return (current & modNumber) === current;
    })
    .map((part) => part[1]);
  return enabledMods.join('(') + '(' + keycode + ')'.repeat(enabledMods.length);
};

const parseTopLevelMacro = (
  inputParts: string[],
  basicKeyToByte: Record<string, number>,
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
      return basicKeyToByte[topLevelMacroToValue[topLevelKey]] | (layer & 0xff);
    case 'OSM': //#define OSM(mod) (QK_ONE_SHOT_MOD | ((mod)&0xFF))
      mods = parseMods(parameter);
      if (mods === 0) {
        return 0;
      }
      return basicKeyToByte[topLevelMacroToValue[topLevelKey]] | (mods & 0xff);
    case 'LM': //#define LM(layer, mod) (QK_LAYER_MOD | (((layer)&0xF) << 4) | ((mod)&0xF))
      [param1, param2] = parameter.split(',').map((s) => s.trim());
      layer = Number.parseInt(param1);
      mods = parseMods(param2);
      if (layer < 0 || mods === 0) {
        return 0;
      }
      return basicKeyToByte[topLevelMacroToValue[topLevelKey]] | ((layer & 0xf) << 4) | (mods & 0xff);
    case 'LT': //#define LT(layer, kc) (QK_LAYER_TAP | (((layer)&0xF) << 8) | ((kc)&0xFF))
      [param1, param2] = parameter.split(',').map((s) => s.trim());
      layer = Number.parseInt(param1);
      if (layer < 0 || !basicKeyToByte.hasOwnProperty(param2)) {
        return 0;
      }
      return basicKeyToByte[topLevelMacroToValue[topLevelKey]] | ((layer & 0xf) << 8) | basicKeyToByte[param2];
    case 'MT': // #define MT(mod, kc) (QK_MOD_TAP | (((mod)&0x1F) << 8) | ((kc)&0xFF))
      [param1, param2] = parameter.split(',').map((s) => s.trim());
      mods = parseMods(param1);
      if (mods === 0 || !basicKeyToByte.hasOwnProperty(param2)) {
        return 0;
      }
      return basicKeyToByte[topLevelMacroToValue[topLevelKey]] | ((mods & 0x1f) << 8) | (basicKeyToByte[param2] & 0xff);
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
  basicKeyToByte: any,
): number => {
  const realParts = inputParts.filter((nonce) => nonce.length !== 0);
  const bytes = realParts.map((part, idx) => {
    if (idx === realParts.length - 1) {
      /* this must be a KC code */
      return basicKeyToByte.hasOwnProperty(part) ? basicKeyToByte[part] : null;
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
  return bytes.reduce((acc, byte) => acc | byte, 0);
};

export const anyKeycodeToString = (
  input: number,
  basicKeyToByte: Record<string, number>,
  byteToKey: Record<number, string>,
) => {
  let currentValue = '';
  const advancedParsed = advancedKeycodeToString(
    input,
    basicKeyToByte,
    byteToKey,
  );
  if (byteToKey[input]) {
    currentValue = byteToKey[input];
  } else if (advancedParsed !== null) {
    currentValue = advancedParsed;
  }
  return currentValue;
};
