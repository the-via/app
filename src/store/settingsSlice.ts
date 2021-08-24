import {createSlice} from '@reduxjs/toolkit';
import type {Settings} from '../types/types';
import type {PropertiesOfType} from '../types/generic-types';
import {getSettings, setSettings} from '../utils/device-store';

// TODO: why are these settings mixed? Is it because we only want some of them cached? SHould we rename to "CachedSettings"?
export type SettingsState = Settings & {
  isTestMatrixEnabled: boolean;
  requireRestart: boolean;
  allowGlobalHotKeys: boolean;
};

const initialState: SettingsState = {
  ...getSettings(),
  isTestMatrixEnabled: false,
  requireRestart: false,
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
    requireRestart: (state) => {
      toggleBool(state, 'requireRestart');
    },
    disableGlobalHotKeys: (state) => {
      state.allowGlobalHotKeys = false;
    },
    allowGlobalHotkeys: (state) => {
      state.allowGlobalHotKeys = true;
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
  allowGlobalHotkeys,
} = settingsSlice.actions;

export default settingsSlice.reducer;
