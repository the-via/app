import {
  createReducer,
  createStandardAction,
  ActionType
} from 'typesafe-actions';
import {getSettings, setSettings} from '../../utils/device-store';
import type {Settings} from '../../types/types'

// Actions
export const actions = {
  toggleKeyRemappingViaKeyboard: createStandardAction(
    'via/settings/TOGGLE_KEY_REMAPPING_VIA_KB'
  )(),
  toggleFastRemap: createStandardAction('via/settings/TOGGLE_FAST_REMAP')(),
  toggleHardwareAcceleration: createStandardAction(
    'via/settings/TOGGLE_HARDWARE_ACCELERATION'
  )(),
  setTestMatrixEnabled: createStandardAction('via/settings/TOGGLE_TEST_MATRIX')<
    boolean
  >(),
  toggleCreatorMode: createStandardAction('via/settings/TOGGLE_CREATOR_MODE')(),
  requireRestart: createStandardAction('via/settings/REQUIRE_RESTART')()
};

type Actions = ActionType<typeof actions>;
type ActionHandler = (state: State, action: Actions) => State;

const saveToDisk: (fn: ActionHandler) => ActionHandler = fn => (
  state: State,
  action
) => {
  const newState = fn(state, action);
  setSettings(newState);
  return newState;
};

// State
export type SettingsState = {
  isTestMatrixEnabled: boolean;
  requireRestart: boolean;
};
export type State = Readonly<Settings & SettingsState>;
const initialState: Settings & SettingsState = {
  ...getSettings(),
  isTestMatrixEnabled: false,
  requireRestart: false
};

// Reducer
export const settingsReducer = createReducer<State, Actions>(initialState)
  .handleAction(
    actions.toggleKeyRemappingViaKeyboard,
    saveToDisk(state => ({
      ...state,
      allowKeyboardKeyRemapping: !state.allowKeyboardKeyRemapping
    }))
  )
  .handleAction(
    actions.toggleFastRemap,
    saveToDisk(state => ({
      ...state,
      disableFastRemap: !state.disableFastRemap
    }))
  )
  .handleAction(
    actions.toggleHardwareAcceleration,
    saveToDisk(state => ({
      ...state,
      disableHardwareAcceleration: !state.disableHardwareAcceleration
    }))
  )
  .handleAction(
    actions.toggleCreatorMode,
    saveToDisk(state => ({
      ...state,
      showDesignTab: !state.showDesignTab
    }))
  )
  .handleAction(actions.setTestMatrixEnabled, (state, action) => ({
    ...state,
    isTestMatrixEnabled: action.payload
  }))
  .handleAction(
    actions.requireRestart,
    saveToDisk(state => ({
      ...state,
      requireRestart: true
    }))
  );
