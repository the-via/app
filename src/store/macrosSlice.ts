import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import type {Device} from 'src/types/types';
import {KeyboardAPI} from 'src/utils/keyboard-api';
import {getMacroApi} from 'src/utils/macro-api';
import type {AppThunk} from '.';

export type MacrosState = {
  expressions: string[];
  isFeatureSupported: boolean;
};

const initialState: MacrosState = {
  expressions: [],
  isFeatureSupported: true,
};

export const macrosSlice = createSlice({
  name: 'macros',
  initialState,
  reducers: {
    // Redux Toolkit allows us to write "mutating" logic in reducers. It
    // doesn't actually mutate the state because it uses the Immer library,
    // which detects changes to a "draft state" and produces a brand new
    // immutable state based off those changes
    loadMacrosSuccess: (state, action: PayloadAction<string[]>) => {
      state.expressions = action.payload;
    },
    saveMacrosSuccess: (state, action: PayloadAction<string[]>) => {
      state.expressions = action.payload;
    },
    setMacrosNotSupported: (state) => {
      state.isFeatureSupported = false;
    },
  },
});

export const {loadMacrosSuccess, saveMacrosSuccess, setMacrosNotSupported} =
  macrosSlice.actions;

export default macrosSlice.reducer;

export const loadMacros =
  (device: Device): AppThunk =>
  async (dispatch) => {
    const protocol = await new KeyboardAPI(device).getProtocolVersion();
    if (protocol < 8) {
      dispatch(setMacrosNotSupported());
    } else {
      const macroApi = getMacroApi(device);
      if (macroApi) {
        const macros = await macroApi.readMacroExpressions();
        dispatch(loadMacrosSuccess(macros));
      }
    }
  };

export const saveMacros =
  (device: Device, macros: string[]): AppThunk =>
  async (dispatch) => {
    const macroApi = getMacroApi(device);
    if (macroApi) {
      await macroApi.writeMacroExpressions(macros);
      dispatch(saveMacrosSuccess(macros));
    }
  };
