import fs from 'fs';
import path from 'path';

import {
  getVersionedKeycodeDict,
  KeycodeDict,
  KeycodeDictSource,
} from '../src/utils/keycode-dict';

import deprecatedKeycodes from '../src/utils/keycode-dict/deprecated-keycodes';

const deprecatedKeycodesInverse: Record<string, string> = Object.entries(
  deprecatedKeycodes,
).reduce((p, [oldKey, newKey]) => ({...p, [newKey]: oldKey}), {});

import {getBasicKeyDict} from './test-keycode-dict-data';

const outputPath = getOutputPath();

export function getOutputPath() {
  return path.resolve('./src/utils/keycode-dict/');
}

function toHexString(n: number): string {
  return `0x${n.toString(16).padStart(4, '0')}`;
}

function toJSON(obj: Object): string {
  return JSON.stringify(obj, null, '  ');
}

function toTypescript(obj: Object): string {
  // pre-emptively escapes ' to \' so that
  // replacing " with ' doesn't cause "'" => '''
  // instead it becomes '\''
  // if you can match double quoted strings that don't contain '
  // without it spilling over to the next double quote then by all means
  // let me know how great you are by sending me the regex kthxbai
  const ts = JSON.stringify(obj, null, '  ')
    .replace(/'/g, "\\'")
    .replace(/"([^"]*)":/g, '$1:')
    .replace(/"(0[xX][0-9a-fA-F]+)"/g, '$1')
    .replace(/"/g, "'");
  return 'export default ' + ts;
}

function validateKeycodes(version: number) {
  const keycodeDict = getVersionedKeycodeDict(version);
  const keycodeToByte: Record<string, number> = getBasicKeyDict(version);

  const missingKeys = Object.keys(keycodeToByte)
    .filter((key) => keycodeDict.keycodes[key] === undefined)
    .filter((key) => keycodeDict.aliases[key] === undefined)
    .filter(
      (key) => (deprecatedKeycodes as Record<string, string>)[key] == undefined,
    )
    .filter((key) => keycodeDict.ranges[key.replace(/^_/, '')] === undefined);

  if (missingKeys.length > 0) {
    console.log(`validateKeycodes(${version}): missing keys = ${missingKeys}`);
  } else {
    console.log(`validateKeycodes(${version}): VALID`);
  }
}

function legacyKeycodeToByte(
  keycodeDict: KeycodeDict,
  keyToByte: Record<string, number>,
  keycode: string,
): number | undefined {
  if (keycodeDict.keycodes[keycode] !== undefined) {
    if (keyToByte[keycode] !== undefined) {
      return keyToByte[keycode];
    }
    if (keycodeDict.keycodes[keycode].aliases !== undefined) {
      const alias = (keycodeDict.keycodes[keycode].aliases as string[]).find(
        (alias) => keyToByte[alias] !== undefined,
      );
      if (alias !== undefined) {
        return keyToByte[alias];
      }
    }
    const deprecatedKeycode = deprecatedKeycodesInverse[keycode];
    if (deprecatedKeycode !== undefined) {
      if (keyToByte[deprecatedKeycode] !== undefined) {
        //console.log(`using deprecated ${deprecatedKeycode}`);
        return keyToByte[deprecatedKeycode];
      }
    }
  } else {
    if (keyToByte['_' + keycode] !== undefined) {
      return keyToByte['_' + keycode];
    }
  }
  return undefined;
}

function generateKeycodeDict(version: number) {
  console.log(`generateKeycodeDict(${version})`);
  const keycodeDict: KeycodeDict = getVersionedKeycodeDict(12);
  const keycodeToByte: Record<string, number> = getBasicKeyDict(version);

  const keycodes = Object.entries(keycodeDict.keycodes).reduce(
    (p, [key, obj]) => {
      let {byte, ...rest} = obj;
      const legacyByte = legacyKeycodeToByte(keycodeDict, keycodeToByte, key);
      if (legacyByte !== undefined) {
        return {...p, [key]: {byte: toHexString(legacyByte), ...rest}};
      }
      //console.error(`${key} not found`);
      return p;
    },
    {},
  );
  const wtLightingKeycodeToByte = {
    BR_INC: 0x5f00,
    BR_DEC: 0x5f01,
    EF_INC: 0x5f02,
    EF_DEC: 0x5f03,
    ES_INC: 0x5f04,
    ES_DEC: 0x5f05,
    H1_INC: 0x5f06,
    H1_DEC: 0x5f07,
    S1_INC: 0x5f08,
    S1_DEC: 0x5f09,
    H2_INC: 0x5f0a,
    H2_DEC: 0x5f0b,
    S2_INC: 0x5f0c,
    S2_DEC: 0x5f0d,
  };
  const wtLightingKeycodes = Object.entries(wtLightingKeycodeToByte).reduce(
    (p, [key, byte]) => ({
      ...p,
      [key]: {byte: toHexString(byte), group: 'wt_lighting'},
    }),
    {},
  );
  const ranges = Object.keys(keycodeDict.ranges).reduce((p, key) => {
    const legacyByte = legacyKeycodeToByte(keycodeDict, keycodeToByte, key);
    if (legacyByte !== undefined) {
      return {...p, [key]: toHexString(legacyByte)};
    }
    console.error(`Could not get byte for ${key}`);
    return p;
  }, {});

  // only generate the WT keycodes for protocol < 11
  // they are now custom keycodes in protocol >= 12
  const keycodeDictSource: KeycodeDictSource = {
    keycodes: {...keycodes, ...(version < 11 ? wtLightingKeycodes : {})},
    ranges: {...ranges},
  };

  fs.writeFileSync(
    `${outputPath}/dict-v${version}.ts`,
    toTypescript(keycodeDictSource),
  );
}

// These generate keycode dicts for old versions
// based on version 12 keycode dict and what exists
// in the old byteToKey dicts
generateKeycodeDict(9);
generateKeycodeDict(10);
generateKeycodeDict(11);
// don't generate for 12, that's generated from qmk hjson

// These validate the new keycode dicts against the old byteToKey dicts
validateKeycodes(9);
validateKeycodes(10);
validateKeycodes(11);
validateKeycodes(12);
