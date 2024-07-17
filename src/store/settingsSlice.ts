import {createSelector, createSlice, PayloadAction} from '@reduxjs/toolkit';
import type {
  MacroEditorSettings,
  Settings,
  TestKeyboardSoundsSettings,
} from '../types/types';
import type {PropertiesOfType} from '../types/generic-types';
import {getSettings, setSettings} from '../utils/device-store';
import type {RootState} from '.';
import {THEMES} from 'src/utils/themes';
import {makeSRGBTheme} from 'src/utils/keyboard-rendering';
import {updateCSSVariables} from 'src/utils/color-math';
import {webGLIsAvailable} from 'src/utils/test-webgl';
import {DefinitionVersion} from '@the-via/reader';

// TODO: why are these settings mixed? Is it because we only want some of them cached? SHould we rename to "CachedSettings"?
type SettingsState = Settings & {
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

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    toggleFastRemap: (state) => {
      toggleBool(state, 'disableFastRemap');
    },
    toggleCreatorMode: (state) => {
      toggleBool(state, 'showDesignTab');
    },
    toggleAskConfirmationButton: (state) => {
      toggleBool(state, 'showAskConfirmationButton');
    },
    toggleThemeMode: (state) => {
      const newThemeMode = state.themeMode === 'light' ? 'dark' : 'light';
      document.documentElement.dataset.themeMode = newThemeMode;
      state.themeMode = newThemeMode;
      setSettings(state);
    },
    updateRenderMode: (state, action: PayloadAction<'3D' | '2D'>) => {
      state.renderMode = action.payload;
      setSettings(state);
    },
    updateDesignDefinitionVersion: (
      state,
      action: PayloadAction<DefinitionVersion>,
    ) => {
      state.designDefinitionVersion = action.payload;
      setSettings(state);
    },
    updateThemeName: (state, action: PayloadAction<string>) => {
      state.themeName = action.payload;
      updateCSSVariables(state.themeName as keyof typeof THEMES);
      setSettings(state);
    },
    setTestMatrixEnabled: (state, action: PayloadAction<boolean>) => {
      state.isTestMatrixEnabled = action.payload;
    },
    setMacroEditorSettings: (
      state,
      action: PayloadAction<Partial<MacroEditorSettings>>,
    ) => {
      const macroEditor = {
        ...state.macroEditor,
        ...action.payload,
      };
      state.macroEditor = macroEditor;
      setSettings(state);
    },
    setTestKeyboardSoundsSettings: (
      state,
      action: PayloadAction<Partial<TestKeyboardSoundsSettings>>,
    ) => {
      const testKeyboardSoundsSettings = {
        ...state.testKeyboardSoundsSettings,
        ...action.payload,
      };
      state.testKeyboardSoundsSettings = testKeyboardSoundsSettings;
      setSettings(state);
    },
    disableGlobalHotKeys: (state) => {
      state.allowGlobalHotKeys = false;
    },
    enableGlobalHotKeys: (state) => {
      state.allowGlobalHotKeys = true;
    },
  },
});

export const {
  toggleFastRemap,
  toggleCreatorMode,
  toggleAskConfirmationButton,
  setTestMatrixEnabled,
  setTestKeyboardSoundsSettings,
  setMacroEditorSettings,
  toggleThemeMode,
  disableGlobalHotKeys,
  enableGlobalHotKeys,
  updateRenderMode,
  updateThemeName,
  updateDesignDefinitionVersion,
} = settingsSlice.actions;

export default settingsSlice.reducer;

export const getDesignDefinitionVersion = (state: RootState) =>
  state.settings.designDefinitionVersion;
export const getAllowGlobalHotKeys = (state: RootState) =>
  state.settings.allowGlobalHotKeys;
export const getDisableFastRemap = (state: RootState) =>
  state.settings.disableFastRemap;
export const getShowDesignTab = (state: RootState) =>
  state.settings.showDesignTab;
export const getAskConfirmationButton = (state: RootState) =>
  state.settings.showAskConfirmationButton;
export const getRestartRequired = (state: RootState) =>
  state.settings.restartRequired;
export const getIsTestMatrixEnabled = (state: RootState) =>
  state.settings.isTestMatrixEnabled;
export const getMacroEditorSettings = (state: RootState) =>
  state.settings.macroEditor;
export const getTestKeyboardSoundsSettings = (state: RootState) =>
  state.settings.testKeyboardSoundsSettings;
export const getRenderMode = (state: RootState) =>
  webGLIsAvailable ? state.settings.renderMode : '2D';
export const getThemeMode = (state: RootState) => state.settings.themeMode;
export const getThemeName = (state: RootState) => state.settings.themeName;
export const getSelectedTheme = createSelector(getThemeName, (themeName) => {
  return THEMES[themeName as keyof typeof THEMES];
});

export const getSelectedSRGBTheme = createSelector(
  getSelectedTheme,
  (selectedTheme) => {
    return makeSRGBTheme(selectedTheme);
  },
);
