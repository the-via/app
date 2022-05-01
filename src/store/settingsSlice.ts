import {createSlice, PayloadAction} from '@reduxjs/toolkit';
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
    setTheme: (state, action: PayloadAction<string>) => {
      state.theme = action.payload;
      setSettings(state);
    },
    setTestMatrixEnabled: (state, action: PayloadAction<boolean>) => {
      state.isTestMatrixEnabled = action.payload;
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
  disableGlobalHotKeys,
  enableGlobalHotKeys,
  requireRestart,
  setTestMatrixEnabled,
  setTheme,
  toggleCreatorMode,
  toggleFastRemap,
  toggleHardwareAcceleration,
  toggleKeyRemappingViaKeyboard,
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
export const getTheme = (state: RootState) => state.settings.theme;
export const getDisableHardwareAcceleration = (state: RootState) =>
  state.settings.disableHardwareAcceleration;
export const getRestartRequired = (state: RootState) =>
  state.settings.restartRequired;
export const getIsTestMatrixEnabled = (state: RootState) =>
  state.settings.isTestMatrixEnabled;
