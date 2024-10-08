import {AnyAction, configureStore, ThunkAction} from '@reduxjs/toolkit';
import settingsReducer from './settingsSlice';
import macrosReducer from './macrosSlice';
import devicesReducer from './devicesSlice';
import keymapReducer from './keymapSlice';
import definitionsReducer from './definitionsSlice';
import lightingReducer from './lightingSlice';
import menusReducer from './menusSlice';
import designReducer from './designSlice';
import errorsReducer from './errorsSlice';
import {errorsListenerMiddleware} from './errorsListener';

export const store = configureStore({
  reducer: {
    settings: settingsReducer,
    macros: macrosReducer,
    devices: devicesReducer,
    keymap: keymapReducer,
    definitions: definitionsReducer,
    lighting: lightingReducer,
    menus: menusReducer,
    design: designReducer,
    errors: errorsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(errorsListenerMiddleware.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  AnyAction
>;
