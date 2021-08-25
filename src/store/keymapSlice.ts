import {createSelector, createSlice, PayloadAction} from '@reduxjs/toolkit';
import type {
  ConnectedDevice,
  Device,
  DeviceLayerMap,
  Keymap,
  Layer,
} from 'src/types/types';
import {KeyboardAPI} from 'src/utils/keyboard-api';
import type {AppThunk, RootState} from '.';
import {
  getDefinitions,
  getSelectedDefinition,
  getSelectedKeyDefinitions,
} from './definitionsSlice';
import {
  getSelectedConnectedDevice,
  getSelectedDevicePath,
  selectDevice,
} from './devicesSlice';

export type KeymapState = {
  rawDeviceMap: DeviceLayerMap;
  numberOfLayers: number;
  selectedLayerIndex: number;
  selectedKey: null | number;
};

const initialState: KeymapState = {
  rawDeviceMap: {},
  numberOfLayers: 4,
  selectedLayerIndex: 0,
  selectedKey: null,
};

export const keymapSlice = createSlice({
  name: 'keymap',
  initialState,
  reducers: {
    setNumberOfLayers: (state, action: PayloadAction<number>) => {
      state.numberOfLayers = action.payload;
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
    updateSelectedKey: (state, action: PayloadAction<number>) => {
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
} = keymapSlice.actions;

export default keymapSlice.reducer;

export const loadKeymapFromDevice =
  (connectedDevice: ConnectedDevice): AppThunk =>
  async (dispatch, getState) => {
    const state = getState();

    if (getLoadProgress(state) === 1) {
      return;
    }

    const {api, device, vendorProductId, requiredDefinitionVersion} =
      connectedDevice;

    const numberOfLayers = await api.getLayerCount();
    dispatch(setNumberOfLayers(numberOfLayers));

    const {matrix} =
      getDefinitions(state)[vendorProductId][requiredDefinitionVersion];

    // TODO: is this await Promise.all() necessary?
    await Promise.all(
      Array(numberOfLayers).map(async (_, layerIndex) => {
        const keymap = await api.readRawMatrix(matrix, layerIndex);
        dispatch(
          loadLayerSuccess({layerIndex, keymap, devicePath: device.path}),
        );
      }),
    );
  };

// TODO: why isn't this keymap of type Keymap i.e. number[]?
// TODO: should this be using the current selected device? not sure
// TODO: should it use connected device instead to get the api from it?
export const saveRawKeymapToDevice =
  (keymap: number[][], device: Device): AppThunk =>
  async (dispatch, getState) => {
    const state = getState();
    const api = new KeyboardAPI(device);
    const definition = getSelectedDefinition(state);
    if (!api || !definition) {
      return;
    }

    const {matrix} = definition;

    await api.writeRawMatrix(matrix, keymap);
    const layers = keymap.map((layer) => ({
      keymap: layer,
      isLoaded: true,
    }));
    dispatch(saveKeymapSuccess({layers, devicePath: device.path}));
  };

export const updateKey =
  (keyIndex: number, value: number): AppThunk =>
  async (dispatch, getState) => {
    const state = getState();
    const keys = getSelectedKeyDefinitions(state);
    const connectedDevice = getSelectedConnectedDevice(state);
    const selectedDefinition = getSelectedDefinition(state);
    if (!connectedDevice || !keys || !selectedDefinition) {
      return;
    }

    const selectedLayerIndex = getSelectedLayerIndex(state);
    const {api, device} = connectedDevice;
    const {row, col} = keys[keyIndex];
    await api.setKey(selectedLayerIndex, row, col, value);

    const {matrix} = selectedDefinition;
    const keymapIndex = row * matrix.cols + col;

    dispatch(setKey({keymapIndex, value, devicePath: device.path}));
  };

export const getSelectedKey = (state: RootState) => state.keymap.selectedKey;
export const getRawDeviceMap = (state: RootState) => state.keymap.rawDeviceMap;
export const getNumberOfLayers = (state: RootState) =>
  state.keymap.numberOfLayers;
export const getSelectedLayerIndex = (state: RootState) =>
  state.keymap.selectedLayerIndex;

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
