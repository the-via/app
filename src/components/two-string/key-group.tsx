import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {getBasicKeyToByte} from 'src/store/definitionsSlice';
import {useAppDispatch, useAppSelector} from 'src/store/hooks';
import {getSelectedKey} from 'src/store/keymapSlice';
import {getExpressions} from 'src/store/macrosSlice';
import {getHostKeyboardLayout, getSelectedTheme} from 'src/store/settingsSlice';
import {keymapExtras} from 'src/utils/keymap-extras';
import {KeyGroupProps, KeysKeys} from 'src/types/keyboard-rendering';
import {getRGB} from 'src/utils/color-math';
import {
  calculateKeyboardFrameDimensions,
  CSSVarObject,
  getComboKeyProps,
} from 'src/utils/keyboard-rendering';
import {useSkipFontCheck} from 'src/utils/use-skip-font-check';
import styled from 'styled-components';
import {Color} from 'three';
import {
  getKeycapSharedProps,
  getKeysKeys,
  getLabels,
} from '../n-links/key-group';
import {CaseInsideBorder} from './case';
import {Keycap} from './unit-key/keycap';

const KeyGroupContainer = styled.div<{height: number; width: number}>`
  position: absolute;
  top: ${(p) => CaseInsideBorder * 1.5}px;
  left: ${(p) => CaseInsideBorder * 1.5}px;
`;

const getPosition = (x: number, y: number): [number, number, number] => [
  x - CSSVarObject.keyWidth / 2,
  y - CSSVarObject.keyHeight / 2,
  0,
];

type GridDirection = 'left' | 'right' | 'up' | 'down';
const ARROW_DIRECTIONS: Record<string, GridDirection> = {
  ArrowLeft: 'left',
  ArrowRight: 'right',
  ArrowUp: 'up',
  ArrowDown: 'down',
};

// Finds the closest key in a given direction by weighting how aligned it is
// on the cross-axis (e.g. same row for left/right) ahead of raw distance,
// since the physical layout isn't a strict row/column grid.
const findNextKeyIndex = (
  currentIndex: number,
  direction: GridDirection,
  positions: {i: number; x: number; y: number}[],
) => {
  const current = positions.find((p) => p.i === currentIndex);
  if (!current) {
    return currentIndex;
  }
  const isHorizontal = direction === 'left' || direction === 'right';
  const sign = direction === 'right' || direction === 'down' ? 1 : -1;
  let bestIndex = currentIndex;
  let bestScore = Infinity;
  for (const p of positions) {
    if (p.i === currentIndex) {
      continue;
    }
    const primaryDelta =
      ((isHorizontal ? p.x : p.y) - (isHorizontal ? current.x : current.y)) *
      sign;
    if (primaryDelta <= 0.5) {
      continue;
    }
    const secondaryDelta = Math.abs(
      (isHorizontal ? p.y : p.x) - (isHorizontal ? current.y : current.x),
    );
    const score = secondaryDelta * 3 + primaryDelta;
    if (score < bestScore) {
      bestScore = score;
      bestIndex = p.i;
    }
  }
  return bestIndex;
};

const getRGBArray = (keyColors: number[][]) => {
  return keyColors.map(([hue, sat]) => {
    const rgbStr = getRGB({
      hue: Math.round((255 * hue) / 360),
      sat: Math.round(255 * sat),
    });
    const srgbStr = `#${new Color(rgbStr).getHexString()}`;
    const keyColor = {c: srgbStr, t: srgbStr};
    return keyColor;
  });
};

export const KeyGroup: React.FC<KeyGroupProps<React.MouseEvent>> = (props) => {
  const dispatch = useAppDispatch();
  const selectedKey = useAppSelector(getSelectedKey);
  const selectedTheme = useAppSelector(getSelectedTheme);
  const macroExpressions = useAppSelector(getExpressions);
  const skipFontCheck = useSkipFontCheck();
  const keyColorPalette = props.keyColors
    ? getRGBArray(props.keyColors)
    : selectedTheme;
  const {basicKeyToByte, byteToKey} = useAppSelector(getBasicKeyToByte);
  const hostKeyboardLayout = useAppSelector(getHostKeyboardLayout);
  const keycodeLUT = keymapExtras[hostKeyboardLayout]?.keycodeLUT;
  const macros = useAppSelector((state) => state.macros);
  const {keys, selectedKey: externalSelectedKey} = props;
  const selectedKeyIndex =
    externalSelectedKey === undefined ? selectedKey : externalSelectedKey;
  const keysKeys: KeysKeys<React.MouseEvent> = useMemo(() => {
    return getKeysKeys(props, keyColorPalette, dispatch, getPosition);
  }, [
    keys,
    keyColorPalette,
    props.onKeycapPointerDown,
    props.onKeycapPointerOver,
  ]);
  const labels = useMemo(() => {
    return getLabels(props, macroExpressions, basicKeyToByte, byteToKey, keycodeLUT);
  }, [keys, props.matrixKeycodes, macros, props.definition, keycodeLUT]);
  const {width, height} = calculateKeyboardFrameDimensions(keys);

  const keyRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const positions = useMemo(
    () =>
      props.keys.reduce<{i: number; x: number; y: number}[]>((acc, k, i) => {
        if (!k.d) {
          const [x, y] = keysKeys.coords[i].position;
          acc.push({i, x, y});
        }
        return acc;
      }, []),
    [keys, keysKeys],
  );
  const [focusedIndex, setFocusedIndex] = useState(
    () => positions.find((p) => p.i === selectedKeyIndex)?.i ?? positions[0]?.i ?? 0,
  );
  useEffect(() => {
    if (
      typeof selectedKeyIndex === 'number' &&
      selectedKeyIndex !== focusedIndex &&
      positions.some((p) => p.i === selectedKeyIndex)
    ) {
      setFocusedIndex(selectedKeyIndex);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedKeyIndex]);

  const onGridKeyDown = useCallback(
    (evt: React.KeyboardEvent) => {
      const direction = ARROW_DIRECTIONS[evt.key];
      if (!direction) {
        return;
      }
      const nextIndex = findNextKeyIndex(focusedIndex, direction, positions);
      if (nextIndex !== focusedIndex) {
        evt.preventDefault();
        setFocusedIndex(nextIndex);
        keyRefs.current[nextIndex]?.focus();
      }
    },
    [focusedIndex, positions],
  );

  const elems = useMemo(() => {
    return props.keys.map((k, i) => {
      return k.d ? null : (
        <Keycap
          {...getComboKeyProps(k)}
          {...getKeycapSharedProps(
            k,
            i,
            props,
            keysKeys,
            selectedKeyIndex,
            labels,
            skipFontCheck,
          )}
          rovingTabIndex={i === focusedIndex ? 0 : -1}
          containerRef={(el) => {
            keyRefs.current[i] = el;
          }}
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
    skipFontCheck,
    focusedIndex,
  ]);
  return (
    <KeyGroupContainer
      height={height}
      width={width}
      onKeyDown={onGridKeyDown}
      style={{pointerEvents: props.selectable ? 'all' : 'none'}}
    >
      {elems}
    </KeyGroupContainer>
  );
};
