import {createSelector, createSlice, PayloadAction} from '@reduxjs/toolkit';
import type {
  ConnectedDevice,
  DeviceLayerMap,
  Keymap,
  Layer,
} from '../types/types';
import type {AppThunk, RootState} from './index';
import {
  getDefinitions,
  getSelectedDefinition,
  getSelectedKeyDefinitions,
} from './definitionsSlice';
import {
  getSelectedConnectedDevice,
  getSelectedDevicePath,
  getSelectedKeyboardApi,
  selectDevice,
} from './devicesSlice';
import {KeyboardAPI} from 'src/utils/keyboard-api';

export type KeymapState = {
  rawDeviceMap: DeviceLayerMap;
  numberOfLayers: number;
  selectedLayerIndex: number;
  selectedKey: number | null;
  configureKeyboardIsSelectable: boolean;
  selectedPaletteColor: [number, number];
};

const initialState: KeymapState = {
  rawDeviceMap: {},
  numberOfLayers: 4,
  selectedLayerIndex: 0,
  selectedKey: null,
  configureKeyboardIsSelectable: false,
  selectedPaletteColor: [0, 0],
};

export const keymapSlice = createSlice({
  name: 'keymap',
  initialState,
  reducers: {
    setSelectedPaletteColor: (
      state,
      action: PayloadAction<[number, number]>,
    ) => {
      state.selectedPaletteColor = action.payload;
    },
    setNumberOfLayers: (state, action: PayloadAction<number>) => {
      state.numberOfLayers = action.payload;
    },
    setConfigureKeyboardIsSelectable: (
      state,
      action: PayloadAction<boolean>,
    ) => {
      state.configureKeyboardIsSelectable = action.payload;
    },
    // Writes a single layer to the device layer map
    loadLayerSuccess: (
      state,
      action: PayloadAction<{
        layerIndex: number;
        keymap: Keymap;
        devicePath: string;
      }>,
    ) => {
      const {layerIndex, keymap, devicePath} = action.payload;
      state.rawDeviceMap[devicePath] =
        state.rawDeviceMap[devicePath] ||
        Array(state.numberOfLayers).fill({
          keymap: [],
          isLoaded: false,
        });
      state.rawDeviceMap[devicePath][layerIndex] = {
        keymap,
        isLoaded: true,
      };
    },
    setLayer: (state, action: PayloadAction<number>) => {
      state.selectedLayerIndex = action.payload;
    },
    clearSelectedKey: (state) => {
      state.selectedKey = null;
    },
    updateSelectedKey: (state, action: PayloadAction<number | null>) => {
      state.selectedKey = action.payload;
    },
    saveKeymapSuccess: (
      state,
      action: PayloadAction<{layers: Layer[]; devicePath: string}>,
    ) => {
      const {layers, devicePath} = action.payload;
      state.rawDeviceMap[devicePath] = layers;
    },
    setKey: (
      state,
      action: PayloadAction<{
        devicePath: string;
        keymapIndex: number;
        value: number;
      }>,
    ) => {
      const {keymapIndex, value, devicePath} = action.payload;
      const {selectedLayerIndex} = state;

      state.rawDeviceMap[devicePath][selectedLayerIndex].keymap[keymapIndex] =
        value;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(selectDevice, (state) => {
      state.selectedKey = null;
    });
  },
});

export const {
  setNumberOfLayers,
  setLayer,
  loadLayerSuccess,
  clearSelectedKey,
  setKey,
  updateSelectedKey,
  saveKeymapSuccess,
  setConfigureKeyboardIsSelectable,
  setSelectedPaletteColor,
} = keymapSlice.actions;

export default keymapSlice.reducer;

export const loadKeymapFromDevice =
  (connectedDevice: ConnectedDevice): AppThunk =>
  async (dispatch, getState) => {
    const state = getState();

    if (getLoadProgress(state) === 1) {
      return;
    }

    const {path, vendorProductId, requiredDefinitionVersion} = connectedDevice;
    const api = getSelectedKeyboardApi(state) as KeyboardAPI;

    const numberOfLayers = await api.getLayerCount();
    dispatch(setNumberOfLayers(numberOfLayers));

    const {matrix} =
      getDefinitions(state)[vendorProductId][requiredDefinitionVersion];

    for (var layerIndex = 0; layerIndex < numberOfLayers; layerIndex++) {
      const keymap = await api.readRawMatrix(matrix, layerIndex);
      dispatch(loadLayerSuccess({layerIndex, keymap, devicePath: path}));
    }
  };

// TODO: why isn't this keymap of type Keymap i.e. number[]?
// TODO: should this be using the current selected device? not sure
export const saveRawKeymapToDevice =
  (keymap: number[][], connectedDevice: ConnectedDevice): AppThunk =>
  async (dispatch, getState) => {
    const state = getState();
    const {path} = connectedDevice;
    const api = getSelectedKeyboardApi(state);
    const definition = getSelectedDefinition(state);
    if (!path || !definition || !api) {
      return;
    }

    const {matrix} = definition;

    await api.writeRawMatrix(matrix, keymap);
    const layers = keymap.map((layer) => ({
      keymap: layer,
      isLoaded: true,
    }));
    dispatch(saveKeymapSuccess({layers, devicePath: path}));
  };

export const updateKey =
  (keyIndex: number, value: number): AppThunk =>
  async (dispatch, getState) => {
    const state = getState();
    const keys = getSelectedKeyDefinitions(state);
    const connectedDevice = getSelectedConnectedDevice(state);
    const api = getSelectedKeyboardApi(state);
    const selectedDefinition = getSelectedDefinition(state);
    if (!connectedDevice || !keys || !selectedDefinition || !api) {
      return;
    }

    const selectedLayerIndex = getSelectedLayerIndex(state);
    const {path} = connectedDevice;
    const {row, col} = keys[keyIndex];
    await api.setKey(selectedLayerIndex, row, col, value);

    const {matrix} = selectedDefinition;
    const keymapIndex = row * matrix.cols + col;

    dispatch(setKey({keymapIndex, value, devicePath: path}));
  };

export const getConfigureKeyboardIsSelectable = (state: RootState) =>
  state.keymap.configureKeyboardIsSelectable;
export const getSelectedKey = (state: RootState) => state.keymap.selectedKey;
export const getRawDeviceMap = (state: RootState) => state.keymap.rawDeviceMap;
export const getNumberOfLayers = (state: RootState) =>
  state.keymap.numberOfLayers;
export const getSelectedLayerIndex = (state: RootState) =>
  state.keymap.selectedLayerIndex;
export const getSelected256PaletteColor = (state: RootState) =>
  state.keymap.selectedPaletteColor;
export const getSelectedPaletteColor = createSelector(
  getSelected256PaletteColor,
  ([hue, sat]) => {
    return [(360 * hue) / 255, sat / 255] as [number, number];
  },
);

export const getSelectedRawLayers = createSelector(
  getRawDeviceMap,
  getSelectedDevicePath,
  (rawDeviceMap, devicePath) => (devicePath && rawDeviceMap[devicePath]) || [],
);

export const getLoadProgress = createSelector(
  getSelectedRawLayers,
  getNumberOfLayers,
  (layers, layerCount) =>
    layers && layers.filter((layer) => layer.isLoaded).length / layerCount,
);

export const getSelectedRawLayer = createSelector(
  getSelectedRawLayers,
  getSelectedLayerIndex,
  (deviceLayers, layerIndex) => deviceLayers && deviceLayers[layerIndex],
);

export const getSelectedKeymaps = createSelector(
  getSelectedKeyDefinitions,
  getSelectedDefinition,
  getSelectedRawLayers,
  (keys, definition, layers) => {
    if (definition && layers) {
      const rawKeymaps = layers.map((layer) => layer.keymap);
      const {
        matrix: {cols},
      } = definition;
      return rawKeymaps.map((keymap) =>
        keys.map(({row, col}) => keymap[row * cols + col]),
      );
    }
    return undefined;
  },
);

export const getSelectedKeymap = createSelector(
  getSelectedKeymaps,
  getSelectedLayerIndex,
  (deviceLayers, layerIndex) => deviceLayers && deviceLayers[layerIndex],
);
