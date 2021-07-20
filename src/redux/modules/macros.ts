import type { ThunkAction } from 'redux-thunk';
import {
  createStandardAction,
  ActionType,
  createReducer,
} from 'typesafe-actions';

import { Device, KeyboardAPI } from '../../utils/keyboard-api';
import { getMacroApi } from '../../utils/macro-api';
import type { RootState } from '..';

// Actions
const actions = {
  loadMacrosSuccess: createStandardAction('via/macros/LOAD')<string[]>(),
  saveMacrosSuccess: createStandardAction('via/macros/SAVE')<string[]>(),
  setMacrosNotSupported: createStandardAction('via/macros/NOT_SUPPORTED')(),
};

type Actions = ActionType<typeof actions>;

// Thunks
type ThunkResult = ThunkAction<Promise<void>, RootState, undefined, Actions>;

// TODO: don't need to pass device when we move that to redux
export const loadMacros = (device: Device): ThunkResult => {
  return async (dispatch) => {
    const protocol = await new KeyboardAPI(device).getProtocolVersion();
    if (protocol < 8) {
      dispatch(actions.setMacrosNotSupported());
    } else {
      const macroApi = getMacroApi(device);
      const macros = await macroApi.readMacroExpressions();
      dispatch(actions.loadMacrosSuccess(macros));
    }
  };
};

export const saveMacros = (device: Device, macros: string[]): ThunkResult => {
  return async (dispatch) => {
    const macroApi = getMacroApi(device);
    await macroApi.writeMacroExpressions(macros);
    dispatch(actions.saveMacrosSuccess(macros));
  };
};

// State
export type State = Readonly<{
  expressions: string[];
  isFeatureSupported: boolean;
}>;

const initialState: State = {
  expressions: [],
  isFeatureSupported: true,
};

// Reducer
export const macrosReducer = createReducer<State, Actions>(initialState)
  .handleAction(
    [actions.loadMacrosSuccess, actions.saveMacrosSuccess],
    (state, action) => ({
      ...state,
      expressions: action.payload,
    }),
  )
  .handleAction(actions.setMacrosNotSupported, (state) => {
    return {
      ...state,
      isFeatureSupported: false,
    };
  });
