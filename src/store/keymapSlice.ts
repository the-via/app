import {createSelector, createSlice, PayloadAction} from '@reduxjs/toolkit';
import type {ConnectedDevice, DeviceLayerMap, Keymap} from 'src/types/types';
import type {AppThunk, RootState} from '.';
import {getSelectedDevicePath} from './devicesSlice';

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
    setKey: (
      state,
      action: PayloadAction<{
        devicePath: string;
        // layerIndex: number; // TODO: pass this in explicitly replace ref to selectedLayerIndex?
        keymapIndex: number;
        value: number;
      }>,
    ) => {
      // TODO: implement this in the UpdateKey thunk to extract the keymapIndex

      // const {keyIndex, value} = action.payload;
      // const keymap = [...(getSelectedRawLayer(state) as any).keymap];
      // const {selectedLayerIndex} = state;
      // const rawDeviceLayers = getSelectedRawLayers(state);
      // const keys = getSelectedKeyDefinitions(state);
      // const {
      //   matrix: {cols},
      // } = getSelectedDefinition(state);

      // const {row, col} = keys[keyIndex];
      // const newRawLayers = [...(rawDeviceLayers as Layer[])];
      // keymap[row * cols + col] = value;
      // newRawLayers[selectedLayerIndex] = {
      //   ...newRawLayers[selectedLayerIndex],
      //   keymap,
      // };

      // return {
      //   ...state,
      //   rawDeviceMap: {
      //     ...state.rawDeviceMap,
      //     [state.selectedDevicePath as string]: newRawLayers,
      //   },
      // };

      const {keymapIndex, value, devicePath} = action.payload;
      const {selectedLayerIndex} = state;

      state.rawDeviceMap[devicePath][selectedLayerIndex].keymap[keymapIndex] =
        value;
    },
  },
});

export const {
  setNumberOfLayers,
  setLayer,
  loadLayerSuccess,
  clearSelectedKey,
  setKey,
  updateSelectedKey,
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

    const {matrix} = getDefinitions(getState().keymap)[vendorProductId][
      requiredDefinitionVersion
    ];

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
