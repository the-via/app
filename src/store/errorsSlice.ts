import {RootState} from './index';
import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {Device} from 'src/types/types';

export type KeyboardAPIError = {
  commandName: string;
  commandBytes: number[];
  responseBytes: number[];
  device: Device;
};

type ErrorsState = {
  keyboardAPIErrors: KeyboardAPIError[];
};

const initialState: ErrorsState = {
  keyboardAPIErrors: [],
};

const errorsSlice = createSlice({
  name: 'errors',
  initialState,
  reducers: {
    logKeyboardAPIError: (state, action: PayloadAction<KeyboardAPIError>) => {
      state.keyboardAPIErrors.push(action.payload);
    },
    clearKeyboardAPIErrors: (state) => {
      state.keyboardAPIErrors = [];
    },
  },
});

export const {logKeyboardAPIError, clearKeyboardAPIErrors} =
  errorsSlice.actions;

export default errorsSlice.reducer;

export const getKeyboardAPIErrors = (state: RootState) =>
  state.errors.keyboardAPIErrors;
