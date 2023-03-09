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
  DefinitionVersionMap,
  KeyboardDictionary,
  VIADefinitionV2,
  VIADefinitionV3,
  VIAKey,
} from '@the-via/reader';
import type {AppThunk, RootState} from './index';
import {
  getSelectedDevicePath,
  getSelectedConnectedDevice,
  ensureSupportedIds,
  getSelectedKeyboardAPI,
} from './devicesSlice';
import {getMissingDefinition} from 'src/utils/device-store';
import {getBasicKeyDict} from 'src/utils/key-to-byte/dictionary-store';
import {getByteToKey} from 'src/utils/key';
import {del, entries, setMany, update} from 'idb-keyval';

type LayoutOption = number;
type LayoutOptionsMap = {[devicePath: string]: LayoutOption[] | null}; // TODO: is this null valid?

// TODO: should we use some redux local storage action instead of our custom via-app-store/device-store caching for definitions?
type DefinitionsState = {
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
    loadInitialCustomDefinitions: (
      state,
      action: PayloadAction<KeyboardDictionary>,
    ) => {
      state.customDefinitions = action.payload;
    },
    unloadCustomDefinition: (
      state,
      action: PayloadAction<{
        id: number;
        version: DefinitionVersion;
      }>,
    ) => {
      const {version, id} = action.payload;
      const definitionEntry = state.customDefinitions[id];
      if (Object.keys(definitionEntry).length === 1) {
        delete state.customDefinitions[id];
        del(id);
      } else {
        delete definitionEntry[version];
        update(id, (d) => {
          delete d[version];
          return d;
        });
      }
      state.customDefinitions = {...state.customDefinitions};
    },
    loadCustomDefinitions: (
      state,
      action: PayloadAction<{
        definitions: (VIADefinitionV2 | VIADefinitionV3)[];
        version: DefinitionVersion;
      }>,
    ) => {
      const {version, definitions} = action.payload;
      definitions.forEach((definition) => {
        const definitionEntry =
          state.customDefinitions[definition.vendorProductId] ?? {};
        if (version === 'v2') {
          definitionEntry[version] = definition as VIADefinitionV2;
        } else {
          definitionEntry[version] = definition as VIADefinitionV3;
        }
        state.customDefinitions[definition.vendorProductId] = definitionEntry;
      });
    },
    updateLayoutOptions: (state, action: PayloadAction<LayoutOptionsMap>) => {
      state.layoutOptionsMap = {...state.layoutOptionsMap, ...action.payload};
    },
  },
});

export const {
  loadCustomDefinitions,
  loadInitialCustomDefinitions,
  updateDefinitions,
  unloadCustomDefinition,
  updateLayoutOptions,
} = definitionsSlice.actions;

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
  (definitions, customDefinitions) => {
    return Object.entries(customDefinitions).reduce(
      (p, [id, definitionMap]) => {
        return {...p, [id]: {...p[id], ...definitionMap}};
      },
      definitions,
    );
  },
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

export const getBasicKeyToByte = createSelector(
  getSelectedConnectedDevice,
  (connectedDevice) => {
    const basicKeyToByte = getBasicKeyDict(
      connectedDevice ? connectedDevice.protocol : 0,
    );
    return {basicKeyToByte, byteToKey: getByteToKey(basicKeyToByte)};
  },
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
    (definition
      ? layoutOptions.flatMap(
          (option, idx) =>
            (definition.layouts.optionKeys[idx] &&
              definition.layouts.optionKeys[idx][option]) ||
            [],
        )
      : []) as VIAKey[],
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
    const api = getSelectedKeyboardAPI(state);
    const path = getSelectedDevicePath(state);

    if (!definition || !api || !path || !definition.layouts.labels) {
      return;
    }

    const optionsNums = definition.layouts.labels.map((layoutLabel) =>
      Array.isArray(layoutLabel) ? layoutLabel.slice(1).length : 2,
    );

    // Clone the existing options into a new array so it can be modified with
    // the new layout index
    const options = [...getSelectedLayoutOptions(state)];
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

export const storeCustomDefinitions =
  ({
    definitions,
    version,
  }: {
    definitions: (VIADefinitionV2 | VIADefinitionV3)[];
    version: DefinitionVersion;
  }): AppThunk =>
  async (dispatch, getState) => {
    try {
      const allCustomDefinitions = getCustomDefinitions(getState());
      const entries = definitions.map((definition) => {
        return [
          definition.vendorProductId,
          {
            ...allCustomDefinitions[definition.vendorProductId],
            [version]: definition,
          },
        ] as [IDBValidKey, DefinitionVersionMap];
      });
      return setMany(entries);
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

export const loadStoredCustomDefinitions =
  (): AppThunk => async (dispatch, getState) => {
    try {
      const dictionaryEntries: [string, DefinitionVersionMap][] =
        await entries();
      const keyboardDictionary = dictionaryEntries
        .filter(([key]) => {
          return ['string', 'number'].includes(typeof key);
        })
        .reduce((p, n) => {
          return {...p, [n[0]]: n[1]};
        }, {} as KeyboardDictionary);
      // Each entry should be in the form of [id, {v2:..., v3:...}]
      dispatch(loadInitialCustomDefinitions(keyboardDictionary));

      const [v2Ids, v3Ids] = dictionaryEntries.reduce(
        ([v2Ids, v3Ids], [entryId, definitionVersionMap]) => [
          definitionVersionMap.v2 ? [...v2Ids, Number(entryId)] : v2Ids,
          definitionVersionMap.v3 ? [...v3Ids, Number(entryId)] : v3Ids,
        ],

        [[] as number[], [] as number[]],
      );

      dispatch(ensureSupportedIds({productIds: v2Ids, version: 'v2'}));
      dispatch(ensureSupportedIds({productIds: v3Ids, version: 'v3'}));
    } catch (e) {
      console.error(e);
    }
  };
export const loadLayoutOptions = (): AppThunk => async (dispatch, getState) => {
  const state = getState();
  const selectedDefinition = getSelectedDefinition(state);
  const connectedDevice = getSelectedConnectedDevice(state);
  const api = getSelectedKeyboardAPI(state);
  if (
    !connectedDevice ||
    !selectedDefinition ||
    !selectedDefinition.layouts.labels ||
    !api
  ) {
    return;
  }

  const {path} = connectedDevice;
  try {
    const res = await api.getKeyboardValue(KeyboardValue.LAYOUT_OPTIONS, [], 4);
    const options = unpackBits(
      bytesIntoNum(res),
      selectedDefinition.layouts.labels.map((layoutLabel: string[] | string) =>
        Array.isArray(layoutLabel) ? layoutLabel.slice(1).length : 2,
      ),
    );
    dispatch(
      updateLayoutOptions({
        [path]: options,
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
    const baseDefinitions = getBaseDefinitions(state);
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
        .map((device) =>
          getMissingDefinition(device, device.requiredDefinitionVersion),
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
          baseDefinitions,
        ),
      ),
    );
  };
