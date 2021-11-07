import {createSelector, createSlice, PayloadAction} from '@reduxjs/toolkit';
import type {ConnectedDevices} from '../types/types';
import {
  bytesIntoNum,
  numIntoBytes,
  packBits,
  unpackBits,
} from '../utils/bit-pack';
import {KeyboardValue} from '../utils/keyboard-api';
import type {
  DefinitionVersion,
  KeyboardDictionary,
  VIADefinitionV2,
  VIADefinitionV3,
} from 'via-reader';
import type {AppThunk, RootState} from './index';
import {
  getSelectedDevicePath,
  getSelectedConnectedDevice,
} from './devicesSlice';
import {getMissingDefinition} from 'src/utils/device-store';

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
      const definitionEntry =
        state.customDefinitions[definition.vendorProductId] ?? {};
      if (version === 'v2') {
        definitionEntry[version] = definition as VIADefinitionV2;
      } else {
        definitionEntry[version] = definition as VIADefinitionV3;
      }
      state.customDefinitions[definition.vendorProductId] = definitionEntry;
    },
    updateLayoutOptions: (state, action: PayloadAction<LayoutOptionsMap>) => {
      state.layoutOptionsMap = {...state.layoutOptionsMap, ...action.payload};
    },
  },
});

export const {loadDefinition, updateDefinitions, updateLayoutOptions} =
  definitionsSlice.actions;

export default definitionsSlice.reducer;

export const getBaseDefinitions = (state: RootState) =>
  state.definitions.definitions;
export const getCustomDefinitions = (state: RootState) =>
  state.definitions.customDefinitions;
export const getLayoutOptionsMap = (state: RootState) =>
  state.definitions.layoutOptionsMap;

export const getDefinitions = createSelector(
  getBaseDefinitions,
  getCustomDefinitions,
  (definitions, customDefinitions) =>
    ({...definitions, ...customDefinitions} as KeyboardDictionary),
);

export const getSelectedDefinition = createSelector(
  getDefinitions,
  getSelectedConnectedDevice,
  (definitions, connectedDevice) =>
    connectedDevice &&
    definitions &&
    definitions[connectedDevice.vendorProductId] &&
    definitions[connectedDevice.vendorProductId][
      connectedDevice.requiredDefinitionVersion
    ],
);

export const getSelectedLayoutOptions = createSelector(
  getSelectedDefinition,
  getLayoutOptionsMap,
  getSelectedDevicePath,
  (definition, map, path) =>
    (path && map[path]) ||
    (definition &&
      definition.layouts.labels &&
      definition.layouts.labels.map((_) => 0)) ||
    [],
);

export const getSelectedOptionKeys = createSelector(
  getSelectedLayoutOptions,
  getSelectedDefinition,
  (layoutOptions, definition) =>
    definition &&
    layoutOptions.flatMap(
      (option, idx) => definition.layouts.optionKeys[idx][option],
    ),
);

export const getSelectedKeyDefinitions = createSelector(
  getSelectedDefinition,
  getSelectedOptionKeys,
  (definition, optionKeys) => {
    if (definition && optionKeys) {
      return definition.layouts.keys.concat(optionKeys);
    }
    return [];
  },
);

export const updateLayoutOption =
  (index: number, val: number): AppThunk =>
  async (dispatch, getState) => {
    const state = getState();
    const definition = getSelectedDefinition(state);
    const device = getSelectedConnectedDevice(state);
    const path = getSelectedDevicePath(state);

    if (!definition || !device || !path || !definition.layouts.labels) {
      return;
    }

    const optionsNums = definition.layouts.labels.map((layoutLabel) =>
      Array.isArray(layoutLabel) ? layoutLabel.slice(1).length : 2,
    );
    const {api} = device;
    const options = getSelectedLayoutOptions(state);
    options[index] = val;

    const bytes = numIntoBytes(
      packBits(options.map((option, idx) => [option, optionsNums[idx]])),
    );

    try {
      await api.setKeyboardValue(KeyboardValue.LAYOUT_OPTIONS, ...bytes);
    } catch {
      console.warn('Setting layout option command not working');
    }

    dispatch(
      updateLayoutOptions({
        [path]: options,
      }),
    );
  };

export const loadLayoutOptions = (): AppThunk => async (dispatch, getState) => {
  const state = getState();
  const selectedDefinition = getSelectedDefinition(state);
  const connectedDevice = getSelectedConnectedDevice(state);
  if (
    !connectedDevice ||
    !selectedDefinition ||
    !selectedDefinition.layouts.labels
  ) {
    return;
  }

  const {api, device} = connectedDevice;
  try {
    const res = await api.getKeyboardValue(KeyboardValue.LAYOUT_OPTIONS, 4);
    const options = unpackBits(
      bytesIntoNum(res),
      selectedDefinition.layouts.labels.map((layoutLabel: string[] | string) =>
        Array.isArray(layoutLabel) ? layoutLabel.slice(1).length : 2,
      ),
    );
    dispatch(
      updateLayoutOptions({
        [device.path]: options,
      }),
    );
  } catch {
    console.warn('Getting layout options command not working');
  }
};

export const reloadDefinitions =
  (connectedDevices: ConnectedDevices): AppThunk =>
  async (dispatch, getState) => {
    const state = getState();
    const definitions = getDefinitions(state);
    const missingDefinitions = await Promise.all(
      Object.values(connectedDevices)
        // Check if we already have the required definition in the store
        .filter(({vendorProductId, requiredDefinitionVersion}) => {
          return (
            !definitions ||
            !definitions[vendorProductId] ||
            !definitions[vendorProductId][requiredDefinitionVersion]
          );
        })
        // Go and get it if we don't
        .map(({device, requiredDefinitionVersion}) =>
          getMissingDefinition(device, requiredDefinitionVersion),
        ),
    );
    if (!missingDefinitions.length) {
      return;
    }
    dispatch(
      updateDefinitions(
        missingDefinitions.reduce<KeyboardDictionary>(
          (p, [definition, version]) => ({
            ...p,
            [definition.vendorProductId]: {
              ...p[definition.vendorProductId],
              [version]: definition,
            },
          }),
          {},
        ),
      ),
    );
  };
