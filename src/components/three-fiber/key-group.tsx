import {useGLTF} from '@react-three/drei';
import {getLabel} from '../positioned-keyboard/base';
import {VIADefinitionV2, VIADefinitionV3, VIAKey} from '@the-via/reader';
import {useMemo} from 'react';
import {getBasicKeyToByte} from 'src/store/definitionsSlice';
import {useAppDispatch, useAppSelector} from 'src/store/hooks';
import {getSelectedKey, updateSelectedKey} from 'src/store/keymapSlice';
import {
  calculateKeyboardFrameDimensions,
  calculatePointPosition,
  getTextureColors,
} from '../positioned-keyboard';
import {TestKeyState} from '../test-keyboard';
import {CSSVarObject, KeycapMetric} from './keyboard';
import {DisplayMode, getGeometry, Keycap} from './keycap';

export const KeyGroup: React.VFC<{
  selectable?: boolean;
  containerDimensions?: DOMRect;
  keys: VIAKey[];
  matrixKeycodes: number[];
  definition: VIADefinitionV2 | VIADefinitionV3;
  mode: DisplayMode;
  pressedKeys?: TestKeyState[];
  selectedKey?: number;
}> = (props) => {
  const dispatch = useAppDispatch();
  const keycapNodes = useGLTF('/fonts/blenderspacecap.glb').nodes;
  const {Cylinder} = useGLTF('/fonts/rotary_encoder.glb').nodes;
  const selectedKey = useAppSelector(getSelectedKey);
  const {basicKeyToByte, byteToKey} = useAppSelector(getBasicKeyToByte);
  const macros = useAppSelector((state) => state.macros);
  const {keys, selectedKey: externalSelectedKey} = props;
  const selectedKeyIndex =
    externalSelectedKey === undefined ? selectedKey : externalSelectedKey;
  const keysKeys = useMemo(() => {
    return {
      indices: keys.map(
        (k, i) => `${props.definition.vendorProductId}-${i}-${k.w}-${k.h}`,
      ),
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
          (1 + normalizedKeyXSpacing) * k.w - normalizedKeyXSpacing;
        const normalizedHeight =
          k.h * (1 + normalizedKeyYSpacing) - normalizedKeyYSpacing;
        console.log(x / CSSVarObject.keyXSpacing);
        return {
          position: [
            (KeycapMetric.keyXPos * x) / CSSVarObject.keyXPos,
            (-y * KeycapMetric.keyYPos) / CSSVarObject.keyYPos,
            0,
          ],
          rotation: [0, 0, -r],
          scale: [normalizedWidth, normalizedHeight, 1],
          color: getTextureColors(k),
          idx: i,
          onClick: (evt: any, idx: number) => {
            evt.stopPropagation();
            dispatch(updateSelectedKey(idx));
          },
        };
      }),
    };
  }, [keys]);
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
  const {width, height} = calculateKeyboardFrameDimensions(props.keys);
  const elems = useMemo(
    () =>
      props.keys.map((k, i) => {
        const {position, rotation, scale, color, idx, onClick} =
          keysKeys.coords[i];
        const key = keysKeys.indices[i];
        const isEncoder = k['ei'] !== undefined;

        return (
          <Keycap
            mode={props.mode}
            key={key}
            position={position}
            rotation={rotation}
            scale={[2.25, 2.75, 6.25].includes(k.w) ? [1, 1, 1] : scale}
            textureWidth={k.w}
            color={color}
            shouldRotate={isEncoder}
            keycapGeometry={
              (isEncoder ? Cylinder : (keycapNodes[getGeometry(k)] as any))
                .geometry
            }
            keyState={props.pressedKeys ? props.pressedKeys[i] : -1}
            disabled={!props.selectable}
            selected={i === selectedKeyIndex}
            idx={idx}
            label={labels[i]}
            onClick={onClick}
          />
        );
      }),
    [
      props.keys,
      selectedKeyIndex,
      labels,
      props.pressedKeys,
      props.selectable,
      props.definition.vendorProductId,
    ],
  );
  return (
    <group scale={1} position={[(-width * 19.05) / 2, (19.05 * height) / 2, 0]}>
      {elems}
    </group>
  );
};
