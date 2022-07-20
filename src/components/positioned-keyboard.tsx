import React, {memo, MouseEventHandler} from 'react';
import type {KeyColor} from '../utils/themes';
import styled from 'styled-components';
import partition from 'lodash.partition';
import {
  getLabelForByte,
  isUserKeycodeByte,
  getUserKeycodeIndex,
  isAlpha,
  isNumericSymbol,
  isNumericOrShiftedSymbol,
  isMacro,
  getShortNameForKeycode,
} from '../utils/key';
import type {IKeycode} from '../utils/key';
import type {
  VIADefinitionV2,
  VIADefinitionV3,
  VIAKey,
  KeyColorType,
  Result,
} from 'via-reader';
import {getBoundingBox} from 'via-reader';
import {getThemeFromStore} from '../utils/device-store';
import type {RootState} from 'src/store';
import {useAppSelector} from 'src/store/hooks';
import {
  getSelectedDefinition,
  getSelectedKeyDefinitions,
} from 'src/store/definitionsSlice';
import {
  getSelectedKey,
  getSelectedKeymap,
  updateSelectedKey,
} from 'src/store/keymapSlice';
import {useDispatch} from 'react-redux';
import type {Key} from 'src/types/types';
import {
  getBGKeyContainerPosition,
  getKeyContainerPosition,
  getLegends,
  getRotationContainerTransform,
  KeyContainer,
  noop,
  RotationContainer,
} from './positioned-keyboard/base';
import {
  EncoderKeyComponent,
  InnerEncoderKeyContainer,
} from './positioned-keyboard/encoder-key';
import {Matrix} from './positioned-keyboard/matrix';

export const CSSVarObject = {
  keyWidth: 52,
  keyXSpacing: 2,
  keyHeight: 54,
  keyYSpacing: 2,
  keyXPos: 52 + 2,
  keyYPos: 54 + 2,
};

const KeyboardFrame = styled.div<{
  selectable: boolean;
  width: number;
  height: number;
  containerDimensions: {width: number; height: number};
}>`
  pointer-events: ${(props) => (props.selectable ? 'all' : 'none')};
  width: ${(props) =>
    CSSVarObject.keyXPos * props.width - CSSVarObject.keyXSpacing}px;
  height: ${(props) =>
    CSSVarObject.keyYPos * props.height - CSSVarObject.keyYSpacing}px;
  background: var(--color_medium-grey);
  padding: 2px;
  border-radius: 3px;
  box-shadow: var(--color_dark-grey) 0 1px 0px 3px;
  padding: 5px;
  background: var(--color_light-jet);
  position: relative;
  transform: ${(props) => {
    if (props.containerDimensions) {
      const ratio = Math.min(
        1,
        props.containerDimensions.width /
          ((CSSVarObject.keyWidth + CSSVarObject.keyXSpacing) * props.width -
            CSSVarObject.keyXSpacing +
            30),
      );
      return `scale(${ratio}, ${ratio})`;
    }
    return 'initial';
  }};
`;

export const BlankKeyboardFrame = styled(KeyboardFrame)`
  padding: 5px;
  background: var(--color_light-jet);
  position: relative;
  transform: ${(props) => {
    if (props.containerDimensions) {
      const ratio = Math.min(
        1,
        props.containerDimensions.width /
          ((CSSVarObject.keyWidth + CSSVarObject.keyXSpacing) * props.width -
            CSSVarObject.keyXSpacing +
            20),
      );
      return `scale(${ratio}, ${ratio})`;
    }
    return 'initial';
  }};
`;

export const BGKeyContainer = styled(KeyContainer)`
  transform: translate3d(0, -4px, 0) scale(0.99);
`;

const SmallInnerKey = styled.div<{backgroundColor: string}>`
  height: 100%;
  position: relative;
  margin: auto;
  background-color: ${(props) => props.backgroundColor};
  line-height: 20px;
  box-sizing: border-box;
  border-radius: 3px;
  font-size: 12px;
  padding-top: 0;
`;

const InnerKey = styled.div<{backgroundColor: string}>`
  height: 100%;
  margin: auto;
  background-color: ${(props) => props.backgroundColor};
  line-height: 20px;
  box-sizing: border-box;
  border-radius: 3px;
  padding-top: 2px;
`;

// Remove after refactoring with flexbox
const InnerKeyContainer = styled.div`
  position: absolute;
  padding-left: 5px;
  width: 100%;
`;

export const OuterEncoderKey = styled.div<{
  selected?: boolean;
  backgroundColor: string;
}>`
  overflow: hidden;
  border: 2px solid var(--color_accent);
  border-style: dotted;
  border-color: ${(props) =>
    props.selected ? `var(--color_accent)` : props.backgroundColor};
  background-color: ${(props) =>
    props.selected
      ? `var(--color_dark-accent)`
      : getDarkenedColor(props.backgroundColor)};
  animation-duration: ${(props) => (props.selected ? 2 : 0)}s;
  animation-iteration-count: infinite;
  animation-direction: alternate;
  animation-timing-function: ease-in-out;
  height: 100%;
  border-radius: 50%;
  box-sizing: border-box;
  display: block;
  margin-right: 2px;
  width: 100%;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
`;
// Remove after refactoring with flexbox
const SmallInnerCenterKeyContainer = styled.div`
  position: absolute;
  padding-left: 2px;
  top: 10px;
  width: 100%;
`;

export const OuterSecondaryKey = styled.div<{
  selected?: boolean;
  backgroundColor: string;
}>`
  background-color: ${(props) => props.backgroundColor};
  padding-top: 2px;
  padding-bottom: 9px;
  padding-left: 6px;
  padding-right: 6px;
  height: 100%;
  border-radius: 3px;
  box-sizing: border-box;
  display: block;
  margin-right: 2px;
  width: 100%;
  cursor: pointer;
  position: absolute;
`;

export const OuterKey = styled.div<{
  selected?: boolean;
  backgroundColor: string;
}>`
  background-color: ${(props) => props.backgroundColor};
  animation-duration: ${(props) => (props.selected ? 2 : 0)}s;
  animation-iteration-count: infinite;
  animation-direction: alternate;
  animation-timing-function: ease-in-out;
  padding-top: 2px;
  padding-bottom: 9px;
  padding-left: 6px;
  padding-right: 6px;
  height: 100%;
  border-radius: 3px;
  box-sizing: border-box;
  display: block;
  margin-right: 2px;
  width: 100%;
  cursor: pointer;
`;

export const getDarkenedColor = (color: string) => {
  const cleanedColor = color.replace('#', '');
  const r = parseInt(cleanedColor[0], 16) * 16 + parseInt(cleanedColor[1], 16);
  const g = parseInt(cleanedColor[2], 16) * 16 + parseInt(cleanedColor[3], 16);
  const b = parseInt(cleanedColor[4], 16) * 16 + parseInt(cleanedColor[5], 16);
  const hr = Math.round(r * 0.8).toString(16);
  const hg = Math.round(g * 0.8).toString(16);
  const hb = Math.round(b * 0.8).toString(16);
  const res = `#${hr.padStart(2, '0')}${hg.padStart(2, '0')}${hb.padStart(
    2,
    '0',
  )}`;
  return res;
};

export const chooseInnerKey = (props: {
  topLabel?: string;
  centerLabel?: string;
}) => {
  const {topLabel, centerLabel} = props;
  const isSmall = topLabel !== undefined || centerLabel !== undefined;
  return isSmall ? SmallInnerKey : InnerKey;
};

export const chooseInnerKeyContainer = (props: {
  topLabel?: string;
  centerLabel?: string;
}) => {
  const {topLabel, centerLabel} = props;
  const isSmall = topLabel !== undefined || centerLabel !== undefined;
  return isSmall && centerLabel
    ? SmallInnerCenterKeyContainer
    : InnerKeyContainer;
};
export const KeyBG = memo(
  ({x, x2, y, y2, w, w2, h, h2, r = 0, rx = 0, ry = 0, ei}: any) => {
    const hasSecondKey = [h2, w2].every((i) => i !== undefined);
    const backColor = 'var(--color_accent)';
    const radiusStyle =
      ei !== undefined ? {borderRadius: '50%', overflow: 'hidden'} : {};
    return (
      <RotationContainer
        selected={true}
        style={{...getRotationContainerTransform({r, rx, ry})}}
      >
        <BGKeyContainer
          selected={true}
          style={{
            ...getBGKeyContainerPosition({w, h, x, y}),
            ...radiusStyle,
          }}
        >
          {hasSecondKey ? (
            <>
              <OuterSecondaryKey
                backgroundColor={backColor}
                style={getBGKeyContainerPosition({
                  w: w2,
                  x: x2 || 0,
                  y: y2 || 0,
                  h: h2,
                })}
              />
            </>
          ) : null}
          <OuterKey backgroundColor={backColor}></OuterKey>
        </BGKeyContainer>
      </RotationContainer>
    );
  },
);

const KeyComponent = memo(
  ({
    x,
    x2,
    y,
    y2,
    w,
    w2,
    h,
    h2,
    c,
    t,
    r = 0,
    rx = 0,
    ry = 0,
    selected,
    macroExpression,
    centerLabel = undefined,
    topLabel = undefined,
    bottomLabel = undefined,
    label = undefined,
    id,
    onClick = noop,
  }: Key) => {
    const isSmall = topLabel !== undefined || centerLabel !== undefined;
    const ChosenInnerKeyContainer = chooseInnerKeyContainer({
      topLabel,
      centerLabel,
    });
    const ChosenInnerKey = chooseInnerKey({topLabel, centerLabel});
    const legends = isSmall && !centerLabel ? [topLabel, bottomLabel] : [label];
    const tooltipData = label && getTooltipData({macroExpression, label});
    const containerOnClick: MouseEventHandler = (evt) => {
      evt.stopPropagation();
      onClick(id);
    };
    const hasSecondKey = [h2, w2].every((i) => i !== undefined);
    return (
      <RotationContainer
        selected={selected}
        style={{...getRotationContainerTransform({r, rx, ry})}}
      >
        <KeyContainer
          id={id.toString()}
          {...tooltipData}
          selected={selected}
          style={getKeyContainerPosition({w, h, x, y})}
          onClick={containerOnClick}
        >
          {hasSecondKey ? (
            <>
              <OuterSecondaryKey
                backgroundColor={getDarkenedColor(c)}
                style={getKeyContainerPosition({
                  w: w2 || 0,
                  x: x2 || 0,
                  y: y2 || 0,
                  h: h2 || 0,
                })}
              >
                <ChosenInnerKey
                  style={hasSecondKey ? {transform: 'rotateZ(0)'} : {}}
                  backgroundColor={c}
                >
                  <ChosenInnerKeyContainer></ChosenInnerKeyContainer>
                </ChosenInnerKey>
              </OuterSecondaryKey>
            </>
          ) : null}
          <OuterKey selected={selected} backgroundColor={getDarkenedColor(c)}>
            <ChosenInnerKey
              style={hasSecondKey ? {transform: 'rotateZ(0)'} : {}}
              backgroundColor={c}
            >
              <ChosenInnerKeyContainer>
                {getLegends(legends, t)}
              </ChosenInnerKeyContainer>
            </ChosenInnerKey>
          </OuterKey>
        </KeyContainer>
      </RotationContainer>
    );
  },
);

type PositionedKeyboardProps = {
  selectable: boolean;
  containerDimensions?: any;
  showMatrix?: boolean;
  selectedOptionKeys?: number[];
};

const getTooltipData = ({
  macroExpression,
  label,
}: {
  macroExpression?: string;
  label: string;
}) =>
  label && label.length > 15
    ? {'data-tip': label}
    : macroExpression && macroExpression.length
    ? {'data-tip': macroExpression}
    : {};

export const getLabel = (
  keycodeByte: number,
  width: number,
  macros: RootState['macros'],
  selectedDefinition: VIADefinitionV2 | VIADefinitionV3 | null,
) => {
  let label: string = '';
  if (isUserKeycodeByte(keycodeByte) && selectedDefinition?.customKeycodes) {
    const userKeycodeIdx = getUserKeycodeIndex(keycodeByte);
    label = getShortNameForKeycode(
      selectedDefinition.customKeycodes[userKeycodeIdx] as IKeycode,
    );
  } else if (keycodeByte) {
    label = getLabelForByte(keycodeByte, width * 100) ?? '';
  }
  let macroExpression: string | undefined;
  if (isMacro(label)) {
    macroExpression = macros.expressions[label.substring(1) as any];
  }

  if (isAlpha(label) || isNumericOrShiftedSymbol(label)) {
    return (
      label && {
        label: label.toUpperCase(),
        macroExpression,
      }
    );
  } else if (isNumericSymbol(label)) {
    const topLabel = label[0];
    const bottomLabel = label[label.length - 1];
    return (
      bottomLabel && {
        topLabel,
        bottomLabel,
        macroExpression,
      }
    );
  } else {
    return (
      label && {
        label,
        centerLabel: label,
        macroExpression,
      }
    );
  }
};

export const getColors = (color: KeyColorType): KeyColor =>
  // TODO: make choice based on protocol
  getThemeFromStore()[color];

const AnchorContainer = styled.div`
  position: relative;
  height: 100%;
  width: 100%;
`;

export const calculateKeyboardFrameDimensions = (keys: Partial<Result>[]) => {
  const boundingBoxes = keys.map(getBoundingBox as any) as any[];
  const minX = Math.min(...boundingBoxes.map((b) => b.xStart));
  const minY = Math.min(...boundingBoxes.map((b) => b.yStart));
  const width = Math.max(...boundingBoxes.map((b) => b.xEnd)) - minX;
  const height = Math.max(...boundingBoxes.map((b) => b.yEnd)) - minY;
  return {
    width,
    height,
  };
};

export const PositionedKeyboard = (props: PositionedKeyboardProps) => {
  const {selectable, containerDimensions} = props;
  const dispatch = useDispatch();

  const selectedKey = useAppSelector(getSelectedKey);
  const matrixKeycodes = useAppSelector(
    (state) => getSelectedKeymap(state) || [],
  );
  const macros = useAppSelector((state) => state.macros);
  const keys: (VIAKey & {ei?: number})[] = useAppSelector(
    getSelectedKeyDefinitions,
  );
  const selectedDefinition = useAppSelector(getSelectedDefinition);
  if (!selectedDefinition || !keys) {
    return null;
  }
  const {width, height} = calculateKeyboardFrameDimensions(keys);

  return (
    <div>
      <KeyboardFrame
        key={selectedDefinition.vendorProductId}
        width={width}
        height={height}
        selectable={selectable}
        containerDimensions={containerDimensions}
      >
        <AnchorContainer>
          {selectedKey !== null ? <KeyBG {...keys[selectedKey]} /> : null}
          {keys.map((k, index) => {
            const KeyboardKeyComponent =
              k['ei'] !== undefined ? EncoderKeyComponent : KeyComponent;
            return (
              <KeyboardKeyComponent
                {...{
                  ...k,
                  ...getLabel(
                    matrixKeycodes[index],
                    k.w,
                    macros,
                    selectedDefinition,
                  ),
                  ...getColors(k.color),
                  selected: selectedKey === index,
                  onClick: selectable
                    ? (id) => {
                        dispatch(updateSelectedKey(id));
                      }
                    : noop,
                }}
                key={index}
                id={index}
              />
            );
          })}
        </AnchorContainer>
      </KeyboardFrame>
    </div>
  );
};

export const BlankPositionedKeyboard = (props: {
  selectedKey?: number;
  selectedOptionKeys?: number[];
  containerDimensions: any;
  showMatrix?: boolean;
  selectedDefinition: VIADefinitionV2 | VIADefinitionV3 | null;
}) => (
  <BlankPositionedKeyboardComponent
    {...props}
    selectable={false}
    selectedKey={props.selectedKey === undefined ? null : props.selectedKey}
    macros={{expressions: [], isFeatureSupported: false}}
  />
);

export function calculatePointPosition({
  x = 0,
  y = 0,
  r = 0,
  rx = 0,
  ry = 0,
  w = 0,
  h = 0,
}: VIAKey) {
  // We express the radians in counter-clockwise form, translate the point by the origin, rotate it, then reverse the translation
  const rRadian = (r * (2 * Math.PI)) / 360;
  const cosR = Math.cos(rRadian);
  const sinR = Math.sin(rRadian);
  const originX = CSSVarObject.keyXPos * rx;
  const originY = CSSVarObject.keyYPos * ry;
  const xPos = CSSVarObject.keyXPos * x + (w * CSSVarObject.keyWidth) / 2;
  const yPos = CSSVarObject.keyYPos * y + (h * CSSVarObject.keyHeight) / 2;
  const transformedXPos =
    xPos * cosR - yPos * sinR - originX * cosR + originY * sinR + originX;
  const transformedYPos =
    xPos * sinR + yPos * cosR - originX * sinR - originY * cosR + originY;

  return [transformedXPos, transformedYPos];
}

const generateRowColArray = (keys: VIAKey[], rows: number, cols: number) => {
  const matrixKeys = keys.filter((key) => key['ei'] === undefined);
  const rowKeys = matrixKeys
    .reduce(
      (sumKeys, key) => {
        sumKeys[key.row][key.col] = calculatePointPosition(key);
        return sumKeys;
      },
      Array(rows)
        .fill(0)
        .map(() => Array(cols).fill(0)),
    )
    .map((arr) => arr.sort((a, b) => a[0] - b[0]));
  const colKeys = matrixKeys
    .reduce(
      (sumKeys, key) => {
        sumKeys[key.col][key.row] = calculatePointPosition(key);
        return sumKeys;
      },
      Array(cols)
        .fill(0)
        .map(() => Array(rows).fill(0)),
    )
    .map((arr) => arr.sort((a, b) => a[1] - b[1]));
  return {rowKeys, colKeys};
};

/*
 * This algorithm is meant to sort the keys in a visual left to right, top to down,
 * taking into consideration keys that could be above or below the key within a range of less than a key >.>
 * It's tricky though, one possible visual order is:
 *           _______
 *          |       |
 *  _______ |   2   | _______
 * |       ||_______||       |
 * |   1   | _______ |   4   | _______
 * |_______||       ||_______||       |
 *          |   3   | _______ |   6   |
 *          |_______||       ||_______|
 *                   |   5   |
 *                   |_______|
 * Another is:
 *           _______
 *          |       |
 *  _______ |   2   | _______
 * |       ||_______||       |
 * |   1   | _______ |   3   | _______
 * |_______||       ||_______||       |
 *          |   5   | _______ |   4   |
 *          |_______||       ||_______|
 *                   |   6   |
 *                   |_______|
 * and yet another:
 *           _______
 *          |       |
 *  _______ |   1   | _______
 * |       ||_______||       |
 * |   4   | _______ |   2   | _______
 * |_______||       ||_______||       |
 *          |   5   | _______ |   3   |
 *          |_______||       ||_______|
 *                   |   6   |
 *                   |_______|
 */
const sortByX = (a: VIAKey, b: VIAKey) => {
  const aPoint = calculatePointPosition(a);
  const bPoint = calculatePointPosition(b);
  return aPoint[0] - bPoint[0];
};

const sortByYX = (a: VIAKey, b: VIAKey) => {
  const aPoint = calculatePointPosition(a);
  const bPoint = calculatePointPosition(b);
  return aPoint[1] - bPoint[1] === 0
    ? aPoint[0] - bPoint[0]
    : aPoint[1] - bPoint[1];
};

const withinChain = (a: VIAKey, b: VIAKey) => {
  const aPoint = calculatePointPosition(a);
  const bPoint = calculatePointPosition(b);

  const yDiff = Math.abs(aPoint[1] - bPoint[1]);
  // Fudging factor
  return yDiff < CSSVarObject.keyYPos * 0.9;
};

const getTraversalOrder = (arr: VIAKey[]): VIAKey[] => {
  const [car, ...cdr] = [...arr].sort(sortByYX);
  if (car === undefined) {
    return cdr;
  } else {
    const [chain, rest] = partition([...arr], (a) => withinChain(car, a));
    return [...chain.sort(sortByX), ...getTraversalOrder(rest)];
  }
};

// TODO: This code is shared across components, move to shared module?
export const getNextKey = (
  currIndex: number,
  keys: VIAKey[],
): number | null => {
  const currKey = keys[currIndex];
  const sortedKeys = getTraversalOrder([...keys]);
  const sortedIndex = sortedKeys.indexOf(currKey);
  return sortedIndex === sortedKeys.length - 1
    ? null
    : keys.indexOf(sortedKeys[(sortedIndex + 1) % sortedKeys.length]);
};

const BlankPositionedKeyboardComponent = (
  props: PositionedKeyboardProps & {
    selectedKey: number | null;
    macros: RootState['macros'];
    selectedDefinition: VIADefinitionV2 | VIADefinitionV3 | null;
    matrixKeycodes?: number[];
  },
) => {
  const {
    containerDimensions,
    selectable,
    selectedKey,
    selectedOptionKeys = [],
    showMatrix = false,
    selectedDefinition,
    matrixKeycodes = [],
    macros,
  } = props;
  if (!selectedDefinition) return null;
  const pressedKeys = {};

  const {keys, optionKeys} = selectedDefinition.layouts;

  // This was previously memoised, but removed because it produced an inconsistent number of hooks error
  // because the memo was not called when selectedDefinition was null
  const displayedOptionKeys = optionKeys
    ? Object.entries(optionKeys).flatMap(([key, options]) => {
        const optionKey = parseInt(key);

        // If a selection option has been set for this optionKey, use that
        return selectedOptionKeys[optionKey]
          ? options[selectedOptionKeys[optionKey]]
          : options[0];
      })
    : [];

  const displayedKeys = [...keys, ...displayedOptionKeys];
  const {width, height} = calculateKeyboardFrameDimensions(displayedKeys);
  const {rows, cols} = selectedDefinition.matrix;
  return (
    <div>
      <BlankKeyboardFrame
        key={selectedDefinition.vendorProductId}
        containerDimensions={containerDimensions}
        width={width}
        height={height}
        selectable={selectable}
      >
        <AnchorContainer>
          {selectedKey !== null ? (
            <KeyBG {...displayedKeys[selectedKey]} />
          ) : null}
          {displayedKeys.map((k, index) => {
            const KeyboardKeyComponent =
              k['ei'] !== undefined ? EncoderKeyComponent : KeyComponent;
            return (
              <KeyboardKeyComponent
                {...{
                  ...k,
                  ...getLabel(
                    matrixKeycodes[index],
                    k.w,
                    macros,
                    selectedDefinition,
                  ),
                  ...getColors(k.color),
                  selected: (pressedKeys as any)[index],
                }}
                key={index}
                id={index}
              />
            );
          })}
          {showMatrix && (
            <Matrix {...generateRowColArray(displayedKeys, rows, cols)} />
          )}
        </AnchorContainer>
      </BlankKeyboardFrame>
    </div>
  );
};
