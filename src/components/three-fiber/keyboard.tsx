import React, {Suspense, useEffect, useMemo, useRef, useState} from 'react';
import {VIAKey, KeyColorType, DefinitionVersionMap} from '@the-via/reader';
import {useAppSelector} from 'src/store/hooks';
import {
  getSelectedKeyDefinitions,
  getSelectedDefinition,
} from 'src/store/definitionsSlice';
import type {VIADefinitionV2, VIADefinitionV3} from '@the-via/reader';
import {getSelectedKeymap} from 'src/store/keymapSlice';
import {TestKeyState} from '../test-keyboard';
import {KeyboardCanvas} from './keyboard-canvas';

export const CSSVarObject = {
  keyWidth: 52,
  keyXSpacing: 2,
  keyHeight: 54,
  keyYSpacing: 2,
  keyXPos: 52 + 2,
  keyYPos: 54 + 2,
};

export const KeycapMetric = {
  keyWidth: 18,
  keyXSpacing: 1.05,
  keyHeight: 18,
  keyYSpacing: 1.05,
  keyXPos: 19.05,
  keyYPos: 19.05,
};

enum DisplayMode {
  Test = 1,
  Configure = 2,
  Design = 3,
}

export const ConfigureKeyboard = (props: {
  selectable?: boolean;
  containerDimensions?: DOMRect;
}) => {
  const {selectable, containerDimensions} = props;
  const matrixKeycodes = useAppSelector(
    (state) => getSelectedKeymap(state) || [],
  );
  const keys: (VIAKey & {ei?: number})[] = useAppSelector(
    getSelectedKeyDefinitions,
  );
  const definition = useAppSelector(getSelectedDefinition);
  if (!definition || !containerDimensions) {
    return null;
  }

  return (
    <KeyboardCanvas
      matrixKeycodes={matrixKeycodes}
      keys={keys}
      selectable={!!selectable}
      definition={definition}
      containerDimensions={containerDimensions}
      mode={DisplayMode.Configure}
    />
  );
};

export const TestKeyboard = (props: {
  selectable?: boolean;
  containerDimensions?: DOMRect;
  pressedKeys?: TestKeyState[];
  matrixKeycodes: number[];
  keys: (VIAKey & {ei?: number})[];
  definition: VIADefinitionV2 | VIADefinitionV3;
}) => {
  const {
    selectable,
    containerDimensions,
    matrixKeycodes,
    keys,
    pressedKeys,
    definition,
  } = props;
  if (!containerDimensions) {
    return null;
  }

  return (
    <KeyboardCanvas
      matrixKeycodes={matrixKeycodes}
      keys={keys}
      selectable={!!selectable}
      definition={definition}
      pressedKeys={pressedKeys}
      containerDimensions={containerDimensions}
      mode={DisplayMode.Test}
    />
  );
};

export const DesignKeyboard = (props: {
  containerDimensions?: DOMRect;
  definition: VIADefinitionV2 | VIADefinitionV3;
  showMatrix?: boolean;
  selectedOptionKeys: number[];
}) => {
  const {containerDimensions, showMatrix, definition, selectedOptionKeys} =
    props;
  const {keys, optionKeys} = definition.layouts;
  if (!containerDimensions) {
    return null;
  }

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
  useMemo(() => {
    return [...keys, ...displayedOptionKeys];
  }, [keys, displayedOptionKeys]);
  return (
    <KeyboardCanvas
      matrixKeycodes={[]}
      keys={displayedKeys}
      selectable={false}
      definition={definition}
      containerDimensions={containerDimensions}
      mode={DisplayMode.Design}
      showMatrix={showMatrix}
    />
  );
};

export const DebugKeyboard = (props: {
  containerDimensions?: DOMRect;
  definition: VIADefinitionV2 | VIADefinitionV3;
  showMatrix?: boolean;
  selectedOptionKeys: number[];
  selectedKey?: number;
}) => {
  const {
    containerDimensions,
    showMatrix,
    definition,
    selectedOptionKeys,
    selectedKey,
  } = props;
  if (!containerDimensions) {
    return null;
  }
  const {keys, optionKeys} = definition.layouts;
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
  return (
    <KeyboardCanvas
      matrixKeycodes={[]}
      keys={displayedKeys}
      selectable={false}
      definition={definition}
      containerDimensions={containerDimensions}
      mode={DisplayMode.Design}
      showMatrix={showMatrix}
      selectedKey={selectedKey}
    />
  );
};
