import {VIAKey} from '@the-via/reader';
import {useMemo} from 'react';
import {
  getSelectedDefinition,
  getSelectedKeyDefinitions,
} from 'src/store/definitionsSlice';
import {useAppSelector} from 'src/store/hooks';
import {
  getSelectedKeymap,
  getSelectedPaletteColor,
} from 'src/store/keymapSlice';
import {getShowKeyPainter} from 'src/store/menusSlice';
import {DisplayMode, NDimension} from 'src/types/keyboard-rendering';
import {useColorPainter} from 'src/utils/use-color-painter';
import {KeyboardCanvas as FiberKeyboardCanvas} from '../../three-fiber/keyboard-canvas';
import {KeyboardCanvas as StringKeyboardCanvas} from '../../two-string/keyboard-canvas';

export const getKeyboardCanvas = (dimension: '2D' | '3D') =>
  dimension === '2D' ? StringKeyboardCanvas : FiberKeyboardCanvas;

export const ConfigureKeyboard = (props: {
  selectable?: boolean;
  dimensions?: DOMRect;
  nDimension: NDimension;
}) => {
  const {selectable, dimensions} = props;
  const matrixKeycodes = useAppSelector(
    (state) => getSelectedKeymap(state) || [],
  );
  const keys: (VIAKey & {ei?: number})[] = useAppSelector(
    getSelectedKeyDefinitions,
  );
  const definition = useAppSelector(getSelectedDefinition);
  const showKeyPainter = useAppSelector(getShowKeyPainter);
  const selectedPaletteColor = useAppSelector(getSelectedPaletteColor);
  const {keyColors, onKeycapPointerDown, onKeycapPointerOver} = useColorPainter(
    keys,
    selectedPaletteColor,
  );
  const [normalizedKeys, normalizedColors] = useMemo(() => {
    // skip keys without colors on it
    return keyColors && keys
      ? [
          keys.filter((_, i) => keyColors[i] && keyColors[i].length),
          keyColors.filter((i) => i && i.length),
        ]
      : [null, null];
  }, [keys, keyColors]);

  if (!definition || !dimensions) {
    return null;
  }

  const showKeyboardCanvas = normalizedKeys?.length && normalizedColors?.length;

  const KeyboardCanvas = getKeyboardCanvas(props.nDimension);
  return (
    <>
      <KeyboardCanvas
        matrixKeycodes={matrixKeycodes}
        keys={keys}
        selectable={!!selectable}
        definition={definition}
        containerDimensions={dimensions}
        mode={DisplayMode.Configure}
        shouldHide={showKeyPainter}
      />
      {showKeyboardCanvas ? (
        <KeyboardCanvas
          matrixKeycodes={matrixKeycodes}
          keys={normalizedKeys}
          selectable={showKeyPainter}
          definition={definition}
          containerDimensions={dimensions}
          mode={DisplayMode.ConfigureColors}
          keyColors={normalizedColors}
          onKeycapPointerDown={onKeycapPointerDown}
          onKeycapPointerOver={onKeycapPointerOver}
          shouldHide={!showKeyPainter}
        />
      ) : null}
    </>
  );
};
