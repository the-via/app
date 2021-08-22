import {createSlice} from '@reduxjs/toolkit';
import type {Settings} from '../types/types';
import type {PropertiesOfType} from '../types/generic-types';
import {getSettings, setSettings} from '../utils/device-store';

// TODO: why are these settings mixed? Is it because we only want some of them cached? SHould we rename to "CachedSettings"?
export type SettingsState = Settings & {
  isTestMatrixEnabled: boolean;
  requireRestart: boolean;
};

const initialState: SettingsState = {
  ...getSettings(),
  isTestMatrixEnabled: false,
  requireRestart: false,
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
    // Redux Toolkit allows us to write "mutating" logic in reducers. It
    // doesn't actually mutate the state because it uses the Immer library,
    // which detects changes to a "draft state" and produces a brand new
    // immutable state based off those changes
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
    requireRestart: (state) => {
      toggleBool(state, 'requireRestart');
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
} = settingsSlice.actions;

export default settingsSlice.reducer;
