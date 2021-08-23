import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import type {KeyboardDictionary} from 'src/types/types';
import type {
  DefinitionVersion,
  VIADefinitionV2,
  VIADefinitionV3,
} from 'via-reader';

type LayoutOption = number;
type LayoutOptionsMap = {[devicePath: string]: LayoutOption[] | null}; // TODO: is this null valid?

// TODO: should we use some redux local storage action instead of our custom via-app-store/device-store caching for definitions?
export type DefinitionsState = {
  definitions: KeyboardDictionary;
  customDefinitions: KeyboardDictionary;
  layoutOptionsMap: LayoutOptionsMap;
};

const initialState: DefinitionsState = {
  definitions: {},
  customDefinitions: {},
  layoutOptionsMap: {},
};

const definitionsSlice = createSlice({
  name: 'definitions',
  initialState,
  reducers: {
    updateDefinitions: (state, action: PayloadAction<KeyboardDictionary>) => {
      state.definitions = {...state.definitions, ...action.payload};
    },
    loadDefinition: (
      state,
      action: PayloadAction<{
        definition: VIADefinitionV2 | VIADefinitionV3;
        version: DefinitionVersion;
      }>,
    ) => {
      const {version, definition} = action.payload;
      if (version === 'v2') {
        state.customDefinitions[definition.vendorProductId][version] =
          definition as VIADefinitionV2;
      } else {
        state.customDefinitions[definition.vendorProductId][version] =
          definition as VIADefinitionV3;
      }
    },
    updateLayoutOptions: (state, action: PayloadAction<LayoutOptionsMap>) => {
      state.layoutOptionsMap = {...state.layoutOptionsMap, ...action.payload};
    },
  },
});

export const {loadDefinition, updateDefinitions, updateLayoutOptions} =
  definitionsSlice.actions;

export default definitionsSlice.reducer;
