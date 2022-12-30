import {useGLTF} from '@react-three/drei';
import {
  KeyColorType,
  ThemeDefinition,
  VIADefinitionV2,
  VIADefinitionV3,
  VIAKey,
} from '@the-via/reader';
import {useMemo} from 'react';
import {getBasicKeyToByte} from 'src/store/definitionsSlice';
import {useAppDispatch, useAppSelector} from 'src/store/hooks';
import {getSelectedKey, updateSelectedKey} from 'src/store/keymapSlice';
import {DisplayMode, Keycap} from './keycap';
import {
  calculateKeyboardFrameDimensions,
  calculatePointPosition,
  CSSVarObject,
  getKeyboardRowPartitions,
  getKeyId,
  getLabel,
  getMeshName,
  getScale,
  getTextureColors,
  KeycapMetric,
  makeSRGBTheme,
} from 'src/utils/keyboard-rendering';
import {TestKeyState} from 'src/types/types';
import {getSelectedSRGBTheme} from 'src/store/settingsSlice';
import {ThreeEvent} from '@react-three/fiber';
import {getRGB} from 'src/utils/color-math';
import {Color} from 'three';
import glbSrc from 'assets/models/keyboard_components.glb';

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

export const KeyGroup: React.VFC<{
  selectable?: boolean;
  keys: VIAKey[];
  matrixKeycodes: number[];
  definition: VIADefinitionV2 | VIADefinitionV3;
  mode: DisplayMode;
  pressedKeys?: TestKeyState[];
  keyColors?: number[][];
  selectedKey?: number;
  onKeycapPointerDown?: (e: ThreeEvent<MouseEvent>, idx: number) => void;
  onKeycapPointerOver?: (e: ThreeEvent<MouseEvent>, idx: number) => void;
}> = (props) => {
  const dispatch = useAppDispatch();
  const keycapNodes = useGLTF(glbSrc, true).nodes;
  const selectedKey = useAppSelector(getSelectedKey);
  const selectedSRGBTheme = useAppSelector(getSelectedSRGBTheme);
  const keyColorPalette = props.keyColors
    ? getSRGBArray(props.keyColors)
    : selectedSRGBTheme;
  console.log(keyColorPalette, 'colors');
  const {basicKeyToByte, byteToKey} = useAppSelector(getBasicKeyToByte);
  const macros = useAppSelector((state) => state.macros);
  const {keys, selectedKey: externalSelectedKey} = props;
  const selectedKeyIndex =
    externalSelectedKey === undefined ? selectedKey : externalSelectedKey;
  const keysKeys = useMemo(() => {
    const {rowMap} = getKeyboardRowPartitions(keys);
    return {
      indices: keys.map((k, i) => {
        const isEncoder = k['ei'] !== undefined;
        return `${props.definition.vendorProductId}-${i}-${k.w}-${k.h}-${isEncoder}`;
      }),
      coords: keys.map((k, i) => {
        // x & y are pixel positioned
        const [x, y] = calculatePointPosition(k);
        const r = (k.r * (2 * Math.PI)) / 360;
        // The 1.05mm in-between keycaps but normalized by a keycap width/height
        const normalizedKeyXSpacing =
          KeycapMetric.keyXSpacing / KeycapMetric.keyWidth;
        const normalizedKeyYSpacing =
          KeycapMetric.keyYSpacing / KeycapMetric.keyHeight;
        const normalizedWidth =
          (1 + normalizedKeyXSpacing) * (k.w2 || k.w) - normalizedKeyXSpacing;
        const normalizedHeight =
          k.h * (1 + normalizedKeyYSpacing) - normalizedKeyYSpacing;
        const meshKey = getMeshName(k, rowMap[getKeyId(k)], false);
        const paletteKey = props.keyColors ? i : k.color;
        const color = (keyColorPalette as any)[paletteKey];

        return {
          position: [
            (KeycapMetric.keyXPos * x) / CSSVarObject.keyXPos,
            (-y * KeycapMetric.keyYPos) / CSSVarObject.keyYPos,
            0,
          ],
          rotation: [0, 0, -r],
          scale: [normalizedWidth, normalizedHeight, 1],
          color,
          meshKey,
          idx: i,
          onClick: (evt: any, idx: number) => {
            evt.stopPropagation();
            dispatch(updateSelectedKey(idx));
          },
          onPointerDown: props.onKeycapPointerDown,
          onPointerOver: props.onKeycapPointerOver,
        };
      }),
    };
  }, [
    keys,
    keyColorPalette,
    props.onKeycapPointerDown,
    props.onKeycapPointerOver,
  ]);
  const labels = useMemo(() => {
    return !props.matrixKeycodes.length
      ? []
      : props.keys.map((k, i) =>
          getLabel(
            props.matrixKeycodes[i],
            k.w,
            macros,
            props.definition,
            basicKeyToByte,
            byteToKey,
          ),
        );
  }, [keys, props.matrixKeycodes, macros, props.definition]);
  const {width, height} = calculateKeyboardFrameDimensions(keys);
  const elems = useMemo(() => {
    return props.keys.map((k, i) => {
      const {
        position,
        meshKey,
        rotation,
        scale,
        color,
        idx,
        onClick,
        onPointerDown,
        onPointerOver,
      } = keysKeys.coords[i];
      const key = keysKeys.indices[i];
      const isEncoder = k['ei'] !== undefined;

      return (
        <Keycap
          mode={props.mode}
          key={key}
          position={position}
          rotation={rotation}
          scale={getScale(k, scale)}
          textureWidth={k.w}
          textureHeight={k.h}
          textureOffsetX={!!k.w2 ? Math.abs(k.w2 - k.w) : 0}
          color={color}
          shouldRotate={isEncoder}
          onPointerDown={onPointerDown}
          onPointerOver={onPointerOver}
          keycapGeometry={
            ((keycapNodes[meshKey] as any) || keycapNodes['K-R1-100']).geometry
          }
          keyState={props.pressedKeys ? props.pressedKeys[i] : -1}
          disabled={!props.selectable}
          selected={i === selectedKeyIndex}
          idx={idx}
          label={labels[i]}
          onClick={onClick}
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
        (-width * KeycapMetric.keyXPos) / 2,
        (KeycapMetric.keyYPos * height) / 2,
        0,
      ]}
    >
      {elems}
    </group>
  );
};
