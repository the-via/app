import {useGLTF} from '@react-three/drei';
import {useMemo} from 'react';
import {getBasicKeyToByte} from 'src/store/definitionsSlice';
import {useAppDispatch, useAppSelector} from 'src/store/hooks';
import {getSelectedKey} from 'src/store/keymapSlice';
import {Keycap} from './unit-key/keycap';
import {
  calculateKeyboardFrameDimensions,
  CSSVarObject,
  KeycapMetric,
} from 'src/utils/keyboard-rendering';
import {getSelectedSRGBTheme} from 'src/store/settingsSlice';
import {ThreeEvent} from '@react-three/fiber';
import {getRGB} from 'src/utils/color-math';
import {Color} from 'three';
import glbSrc from 'assets/models/keyboard_components.glb';
import {getExpressions} from 'src/store/macrosSlice';
import {
  getKeycapSharedProps,
  getKeysKeys,
  getLabels,
} from '../n-links/key-group';
import {KeyGroupProps, KeysKeys} from 'src/types/keyboard-rendering';

const getSRGBArray = (keyColors: number[][]) => {
  return keyColors.map(([hue, sat]) => {
    const rgbStr = getRGB({
      hue: Math.round((255 * hue) / 360),
      sat: Math.round(255 * sat),
    });
    const srgbStr = `#${new Color(rgbStr)
      .convertSRGBToLinear()
      .getHexString()}`;
    const keyColor = {c: srgbStr, t: srgbStr};
    return keyColor;
  });
};
const getPosition = (x: number, y: number): [number, number, number] => [
  (KeycapMetric.keyXPos * x) / CSSVarObject.keyXPos,
  (-y * KeycapMetric.keyYPos) / CSSVarObject.keyYPos,
  0,
];
export const KeyGroup: React.FC<KeyGroupProps<ThreeEvent<MouseEvent>>> = (
  props,
) => {
  const dispatch = useAppDispatch();
  const keycapScene = useGLTF(glbSrc, true).scene;
  const selectedKey = useAppSelector(getSelectedKey);
  const selectedSRGBTheme = useAppSelector(getSelectedSRGBTheme);
  const macroExpressions = useAppSelector(getExpressions);
  const keyColorPalette = props.keyColors
    ? getSRGBArray(props.keyColors)
    : selectedSRGBTheme;
  const {basicKeyToByte, byteToKey} = useAppSelector(getBasicKeyToByte);
  const macros = useAppSelector((state) => state.macros);
  const {keys, selectedKey: externalSelectedKey} = props;
  const selectedKeyIndex =
    externalSelectedKey === undefined ? selectedKey : externalSelectedKey;
  const keysKeys: KeysKeys<ThreeEvent<MouseEvent>> = useMemo(() => {
    return getKeysKeys(props, keyColorPalette, dispatch, getPosition);
  }, [
    keys,
    keyColorPalette,
    props.onKeycapPointerDown,
    props.onKeycapPointerOver,
  ]);
  const labels = useMemo(() => {
    return getLabels(props, macroExpressions, basicKeyToByte, byteToKey);
  }, [keys, props.matrixKeycodes, macros, props.definition]);
  const {width, height} = calculateKeyboardFrameDimensions(keys);
  const elems = useMemo(() => {
    return props.keys.map((k, i) => {
      const {meshKey} = keysKeys.coords[i];
      return (
        <Keycap
          key={i}
          keycapGeometry={
            (
              (keycapScene.getObjectByName(meshKey) as any) ||
              keycapScene.getObjectByName('K-R1-100')
            ).geometry
          }
          {...getKeycapSharedProps(
            k,
            i,
            props,
            keysKeys,
            selectedKeyIndex,
            labels,
          )}
        />
      );
    });
  }, [
    keys,
    selectedKeyIndex,
    labels,
    props.pressedKeys,
    props.selectable,
    keyColorPalette,
    props.definition.vendorProductId,
  ]);
  return (
    <group
      scale={1}
      position={[
        (-width * KeycapMetric.keyXPos + KeycapMetric.keyXSpacing) / 2,
        (KeycapMetric.keyYPos * height - KeycapMetric.keyYSpacing) / 2,
        0,
      ]}
    >
      {elems}
    </group>
  );
};
