import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import type {ConnectedDevice} from 'src/types/types';
import {MacroAPI} from 'src/utils/macro-api';
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
  (connectedDevice: ConnectedDevice): AppThunk =>
  async (dispatch) => {
    const {api, protocol} = connectedDevice;
    if (protocol < 8) {
      dispatch(setMacrosNotSupported());
    } else {
      const macroApi = new MacroAPI(api);
      if (macroApi) {
        const macros = await macroApi.readMacroExpressions();
        dispatch(loadMacrosSuccess(macros));
      }
    }
  };

export const saveMacros =
  (connectedDevice: ConnectedDevice, macros: string[]): AppThunk =>
  async (dispatch) => {
    const {api} = connectedDevice;
    const macroApi = new MacroAPI(api);
    if (macroApi) {
      await macroApi.writeMacroExpressions(macros);
      dispatch(saveMacrosSuccess(macros));
    }
  };
