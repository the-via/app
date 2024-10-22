import type {
  DefinitionVersionMap,
  VIADefinitionV2,
  VIADefinitionV3,
} from '@the-via/reader';
import {useMemo} from 'react';
import {getCustomDefinitions} from 'src/store/definitionsSlice';
import {
  getDesignSelectedOptionKeys,
  getSelectedDefinitionIndex,
  getShowMatrix,
} from 'src/store/designSlice';
import {useAppSelector} from 'src/store/hooks';
import {getDesignDefinitionVersion} from 'src/store/settingsSlice';
import {DisplayMode, NDimension} from 'src/types/keyboard-rendering';
import {getKeyboardCanvas} from './configure';

const EMPTY_ARR = [] as any[];
const DesignKeyboard = (props: {
  containerDimensions?: DOMRect;
  definition: VIADefinitionV2 | VIADefinitionV3;
  showMatrix?: boolean;
  selectedOptionKeys: number[];
  nDimension: NDimension;
}) => {
  const {containerDimensions, showMatrix, definition, selectedOptionKeys} =
    props;
  const {keys, optionKeys} = definition.layouts;
  if (!containerDimensions) {
    return null;
  }

  const displayedOptionKeys = useMemo(
    () =>
      optionKeys
        ? Object.entries(optionKeys).flatMap(([key, options]) => {
            const optionKey = parseInt(key);

            // If a selection option has been set for this optionKey, use that
            return selectedOptionKeys[optionKey]
              ? options[selectedOptionKeys[optionKey]]
              : options[0];
          })
        : [],
    [optionKeys, selectedOptionKeys],
  );

  const displayedKeys = useMemo(() => {
    return [...keys, ...displayedOptionKeys];
  }, [keys, displayedOptionKeys]);
  const KeyboardCanvas = getKeyboardCanvas(props.nDimension);
  return (
    <KeyboardCanvas
      matrixKeycodes={EMPTY_ARR}
      keys={displayedKeys}
      selectable={false}
      definition={definition}
      containerDimensions={containerDimensions}
      mode={DisplayMode.Design}
      showMatrix={showMatrix}
    />
  );
};

export const Design = (props: {
  dimensions?: DOMRect;
  nDimension: NDimension;
}) => {
  const localDefinitions = Object.values(useAppSelector(getCustomDefinitions));
  const definitionVersion = useAppSelector(getDesignDefinitionVersion);
  const selectedDefinitionIndex = useAppSelector(getSelectedDefinitionIndex);
  const selectedOptionKeys = useAppSelector(getDesignSelectedOptionKeys);
  const showMatrix = useAppSelector(getShowMatrix);
  const versionDefinitions: DefinitionVersionMap[] = useMemo(
    () =>
      localDefinitions.filter(
        (definitionMap) => definitionMap[definitionVersion],
      ),
    [localDefinitions, definitionVersion],
  );

  const definition =
    versionDefinitions[selectedDefinitionIndex] &&
    versionDefinitions[selectedDefinitionIndex][definitionVersion];

  return (
    definition && (
      <DesignKeyboard
        containerDimensions={props.dimensions}
        definition={definition}
        selectedOptionKeys={selectedOptionKeys}
        showMatrix={showMatrix}
        nDimension={props.nDimension}
      />
    )
  );
};
