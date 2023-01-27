import fs from 'fs';
import glob from 'glob';
import path from 'path';

var hjson = require('hjson');
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

function generateKeycodeDict(
  qmkKeycodeVersion: string,
  viaProtocolVersion: number,
) {
  console.log(`generating to ${outputPath} ...`);
  const hjsonPaths = glob.sync(
    `../../qmk_firmware/data/constants/keycodes/*${qmkKeycodeVersion}*.hjson`,
    {
      absolute: true,
    },
  );

  const allObjs = hjsonPaths.map((f) => {
    try {
      return hjson.parse(fs.readFileSync(f, 'utf8'));
    } catch (err) {
      console.error(err);
    }
  });

  // Merge all the objects with 'keycodes' keys
  const keycodesObjs: Record<string, Object> = allObjs.reduce(
    (p, n) => ({...p, ...n.keycodes}),
    {},
  );

  // Convert the key to number, so it's sorted by number
  const keycodesObjs2: Record<number, Object & {key: string}> = Object.entries(
    keycodesObjs,
  ).reduce((p, [byte, obj]) => ({...p, [Number.parseInt(byte)]: obj}), {});

  // Convert to name: obj
  // TODO: is there some syntactic sugar that avoids the temp var?
  // Can I spread obj
  const keycodes: Record<string, Object> = Object.entries(keycodesObjs2).reduce(
    (p, [byte, obj]) => {
      //const objWithoutKey = Object.fromEntries(
      //  Object.entries(obj).filter(([k, _]) => k !== 'key'),
      //);
      let {a, ...acc} = {a: 1, b: 2, c: 3};
      let {key, ...objWithoutKey} = obj;
      return {
        ...p,
        [(obj as any).key]: {
          byte: toHexString(Number.parseInt(byte)),
          ...objWithoutKey,
        },
      };
    },
    {},
  );

  // Merge all the objects with 'ranges' keys
  const rangesObjs: Record<string, Object> = allObjs.reduce(
    (p, n) => ({...p, ...n.ranges}),
    {},
  );

  const validRanges = {
    QK_MODS: true,
    QK_MOD_TAP: true,
    QK_LAYER_TAP: true,
    QK_LAYER_MOD: true,
    QK_TO: true,
    QK_MOMENTARY: true,
    QK_DEF_LAYER: true,
    QK_TOGGLE_LAYER: true,
    QK_ONE_SHOT_LAYER: true,
    QK_ONE_SHOT_MOD: true,
    QK_LAYER_TAP_TOGGLE: true,
    QK_USER: true,
    QK_MACRO: true,
  };

  // Convert the ranges to QK_BLAH: 0x0000, QK_BLAH_MAX: 0xFFFF
  // Ranges are min/(max-min) not min/max, have to add size to max
  // MAYBE we should just convert it to QK_BLAH : [min, max] ??
  const ranges: Record<string, string> = Object.entries(rangesObjs)
    .filter(
      ([key, obj]) =>
        !!validRanges[(obj as any).define as keyof typeof validRanges],
    )
    .reduce((p, [key, obj]) => {
      let [min, max]: number[] = key.split('/').map((n) => Number.parseInt(n));
      max = min + max;
      return {
        ...p,
        [(obj as any).define]: toHexString(min),
        [`${(obj as any).define}_MAX`]: toHexString(max),
      };
    }, {});

  const final = {
    keycodes: {...keycodes},
    ranges: {...ranges, QK_LAYER_MOD_MASK: '0x001f'},
  };

  fs.writeFileSync(
    `${outputPath}/dict-v${viaProtocolVersion}.ts`,
    toTypescript(final),
  );
}

generateKeycodeDict('0.0.1', 12);
