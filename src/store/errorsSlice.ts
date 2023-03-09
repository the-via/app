import {RootState} from './index';
import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {Device} from 'src/types/types';

export type KeyboardAPIError = {
  timestamp: string;
  commandName: string;
  commandBytes: number[];
  responseBytes: number[];
  device: Device;
};

type ErrorsState = {
  keyboardAPIErrors: KeyboardAPIError[];
  appErrors: [string, Error][];
};

const initialState: ErrorsState = {
  keyboardAPIErrors: [],
  appErrors: [],
};

export const getErrorTimestamp = () => {
  const now = new Date();
  return `${now.toLocaleTimeString()}.${now
    .getMilliseconds()
    .toString()
    .padStart(3, '0')}`;
};

const errorsSlice = createSlice({
  name: 'errors',
  initialState,
  reducers: {
    logAppError: (state, action: PayloadAction<Error>) => {
      state.appErrors.push([getErrorTimestamp(), action.payload]);
    },
    logKeyboardAPIError: (state, action: PayloadAction<KeyboardAPIError>) => {
      state.keyboardAPIErrors.push(action.payload);
    },
    appErrors: (state) => {
      state.keyboardAPIErrors = [];
    },
    clearAppErrors: (state) => {
      state.appErrors = [];
    },
    clearKeyboardAPIErrors: (state) => {
      state.keyboardAPIErrors = [];
    },
  },
});

export const {
  logKeyboardAPIError,
  clearKeyboardAPIErrors,
  logAppError,
  clearAppErrors,
} = errorsSlice.actions;

export default errorsSlice.reducer;

export const getAppErrors = (state: RootState) => state.errors.appErrors;
export const getKeyboardAPIErrors = (state: RootState) =>
  state.errors.keyboardAPIErrors;
