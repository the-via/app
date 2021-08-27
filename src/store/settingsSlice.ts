import {createSlice} from '@reduxjs/toolkit';
import type {Settings} from '../types/types';
import type {PropertiesOfType} from '../types/generic-types';
import {getSettings, setSettings} from '../utils/device-store';
import type {RootState} from '.';

// TODO: why are these settings mixed? Is it because we only want some of them cached? SHould we rename to "CachedSettings"?
export type SettingsState = Settings & {
  isTestMatrixEnabled: boolean;
  restartRequired: boolean;
  allowGlobalHotKeys: boolean;
};

const initialState: SettingsState = {
  ...getSettings(),
  isTestMatrixEnabled: false,
  restartRequired: false,
  allowGlobalHotKeys: false,
};

const toggleBool = (
  state: SettingsState,
  key: keyof PropertiesOfType<SettingsState, boolean>,
) => {
  state[key] = !state[key];
  setSettings(state);
};

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    toggleKeyRemappingViaKeyboard: (state) => {
      toggleBool(state, 'allowKeyboardKeyRemapping');
    },
    toggleFastRemap: (state) => {
      toggleBool(state, 'disableFastRemap');
    },
    toggleHardwareAcceleration: (state) => {
      toggleBool(state, 'disableHardwareAcceleration');
    },
    toggleCreatorMode: (state) => {
      toggleBool(state, 'showDesignTab');
    },
    setTestMatrixEnabled: (state) => {
      toggleBool(state, 'isTestMatrixEnabled');
    },
    disableGlobalHotKeys: (state) => {
      state.allowGlobalHotKeys = false;
    },
    enableGlobalHotKeys: (state) => {
      state.allowGlobalHotKeys = true;
    },
    requireRestart: (state) => {
      state.restartRequired = true;
    },
  },
});

export const {
  toggleKeyRemappingViaKeyboard,
  toggleFastRemap,
  toggleHardwareAcceleration,
  toggleCreatorMode,
  setTestMatrixEnabled,
  requireRestart,
  disableGlobalHotKeys,
  enableGlobalHotKeys,
} = settingsSlice.actions;

export default settingsSlice.reducer;

export const getAllowKeyboardKeyRemapping = (state: RootState) =>
  state.settings.allowKeyboardKeyRemapping;
export const getAllowGlobalHotKeys = (state: RootState) =>
  state.settings.allowGlobalHotKeys;
export const getDisableFastRemap = (state: RootState) =>
  state.settings.disableFastRemap;
export const getShowDesignTab = (state: RootState) =>
  state.settings.showDesignTab;
export const getDisableHardwareAcceleration = (state: RootState) =>
  state.settings.disableHardwareAcceleration;
export const getRestartRequired = (state: RootState) =>
  state.settings.restartRequired;
