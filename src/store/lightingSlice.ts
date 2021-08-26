import {createSelector, createSlice, PayloadAction} from '@reduxjs/toolkit';
import type {ConnectedDevice, LightingData} from 'types/types';
import {
  getLightingDefinition,
  isVIADefinitionV2,
  LightingValue,
} from 'via-reader';
import type {AppThunk, RootState} from './index';
import {getSelectedDefinition} from './definitionsSlice';
import {
  getSelectedConnectedDevice,
  getSelectedDevicePath,
} from './devicesSlice';

type LightingMap = {[devicePath: string]: LightingData};

const commandParamLengths = {
  [LightingValue.BACKLIGHT_COLOR_1]: 2,
  [LightingValue.BACKLIGHT_COLOR_2]: 2,
  [LightingValue.QMK_RGBLIGHT_COLOR]: 2,
  [LightingValue.BACKLIGHT_CUSTOM_COLOR]: 2,
  [LightingValue.BACKLIGHT_CAPS_LOCK_INDICATOR_COLOR]: 2,
  [LightingValue.BACKLIGHT_CAPS_LOCK_INDICATOR_ROW_COL]: 2,
  [LightingValue.BACKLIGHT_LAYER_1_INDICATOR_COLOR]: 2,
  [LightingValue.BACKLIGHT_LAYER_2_INDICATOR_COLOR]: 2,
  [LightingValue.BACKLIGHT_LAYER_3_INDICATOR_COLOR]: 2,
  [LightingValue.BACKLIGHT_LAYER_1_INDICATOR_ROW_COL]: 2,
  [LightingValue.BACKLIGHT_LAYER_2_INDICATOR_ROW_COL]: 2,
  [LightingValue.BACKLIGHT_LAYER_3_INDICATOR_ROW_COL]: 2,
  [LightingValue.BACKLIGHT_EFFECT_SPEED]: 1,
  [LightingValue.BACKLIGHT_USE_7U_SPACEBAR]: 1,
  [LightingValue.BACKLIGHT_USE_ISO_ENTER]: 1,
  [LightingValue.BACKLIGHT_USE_SPLIT_BACKSPACE]: 1,
  [LightingValue.BACKLIGHT_USE_SPLIT_LEFT_SHIFT]: 1,
  [LightingValue.BACKLIGHT_USE_SPLIT_RIGHT_SHIFT]: 1,
  [LightingValue.BACKLIGHT_DISABLE_AFTER_TIMEOUT]: 1,
  [LightingValue.BACKLIGHT_DISABLE_HHKB_BLOCKER_LEDS]: 1,
  [LightingValue.BACKLIGHT_DISABLE_WHEN_USB_SUSPENDED]: 1,
};

export type LightingState = {lightingMap: LightingMap};

const initialState: LightingState = {
  lightingMap: {},
};

const lightingSlice = createSlice({
  name: 'lighting',
  initialState,
  reducers: {
    updateSelectedLightingData: (
      state,
      action: PayloadAction<{lightingData: LightingData; devicePath: string}>,
    ) => {
      const {lightingData, devicePath} = action.payload;
      state.lightingMap[devicePath] = lightingData;
    },
    updateLighting: (state, action: PayloadAction<LightingMap>) => {
      state.lightingMap = {...state.lightingMap, ...action.payload};
    },
  },
});

export const {updateLighting, updateSelectedLightingData} =
  lightingSlice.actions;

export default lightingSlice.reducer;

export const updateBacklightValue =
  (command: LightingValue, ...rest: number[]): AppThunk =>
  async (dispatch, getState) => {
    const state = getState();
    const connectedDevice = getSelectedConnectedDevice(state);
    if (!connectedDevice) {
      return;
    }

    const selectedLightingData = getSelectedLightingData(state);
    const lightingData = {
      ...selectedLightingData,
      [command]: [...rest],
    };
    const {api, device} = connectedDevice;
    dispatch(
      updateSelectedLightingData({
        lightingData,
        devicePath: device.path,
      }),
    );
    await api.setBacklightValue(command, ...rest);
    await api.saveLighting();
  };

export const updateCustomColor =
  (idx: number, hue: number, sat: number): AppThunk =>
  async (dispatch, getState) => {
    const state = getState();
    const connectedDevice = getSelectedConnectedDevice(state);
    const oldLightingData = getSelectedLightingData(state);
    if (!connectedDevice || !oldLightingData) {
      // TODO: shoud we be throwing instead of returning whenever we do these device checks in thunks?
      return;
    }

    const customColors = [...(oldLightingData.customColors || [])];
    customColors[idx] = {hue, sat};
    const lightingData = {
      ...oldLightingData,
      customColors,
    };
    const {api, device} = connectedDevice;
    dispatch(
      updateSelectedLightingData({lightingData, devicePath: device.path}),
    );
    api.setCustomColor(idx, hue, sat);
    await api.saveLighting();
  };

export const updateLightingData =
  (connectedDevice: ConnectedDevice): AppThunk =>
  async (dispatch, getState) => {
    const state = getState();
    const selectedDefinition = getSelectedDefinition(state);
    if (!selectedDefinition) {
      return;
    }

    const {api, device} = connectedDevice;
    if (!isVIADefinitionV2(selectedDefinition)) {
      throw new Error('This method is only compatible with v2 definitions');
    }

    const {lighting} = selectedDefinition;
    const {supportedLightingValues, effects} = getLightingDefinition(lighting);

    if (supportedLightingValues.length !== 0) {
      let props = {};

      // Special case for m6_b
      if (
        supportedLightingValues.indexOf(
          LightingValue.BACKLIGHT_CUSTOM_COLOR,
        ) !== -1
      ) {
        const res = await Array(Math.max(...effects.map(([_, num]) => num)))
          .fill(0)
          .map((_, idx) => api.getCustomColor(idx));
        const customColors = await Promise.all(res);
        props = {customColors};
      }

      const commandPromises = supportedLightingValues.map((command) => ({
        command,
        promise: api.getBacklightValue(
          +command,
          commandParamLengths[command as keyof typeof commandParamLengths],
        ),
      }));
      const commandPromisesRes = await Promise.all(
        commandPromises.map((c) => c.promise),
      );
      props = commandPromises.reduce(
        ({res, ref}, n, idx) => ({ref, res: {...res, [n.command]: ref[idx]}}),
        {res: props, ref: commandPromisesRes},
      ).res;

      dispatch(
        updateLighting({
          [device.path]: {
            ...props,
          },
        }),
      );
    }
  };

export const getLightingMap = (state: RootState) => state.lighting.lightingMap;

export const getSelectedLightingData = createSelector(
  getLightingMap,
  getSelectedDevicePath,
  (map, path) => path && map[path],
);
