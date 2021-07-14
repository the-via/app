import {connectRouter} from 'connected-react-router';
import {History} from 'history';
import {combineReducers} from 'redux';
import {StateType} from 'typesafe-actions';

import {keymapReducer} from './modules/keymap';
import {macrosReducer} from './modules/macros';
import {settingsReducer} from './modules/settings';

export default function createRootReducer(history: History) {
  return combineReducers({
    router: connectRouter(history),
    macros: macrosReducer,
    keymap: keymapReducer,
    settings: settingsReducer
  });
}

export type RootState = StateType<ReturnType<typeof createRootReducer>>;
