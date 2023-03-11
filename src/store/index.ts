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
import * as Sentry from '@sentry/react';
import {errorsListenerMiddleware} from './errorsListener';

const sentryEnhancer = Sentry.createReduxEnhancer({});

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
  enhancers: [sentryEnhancer],
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
