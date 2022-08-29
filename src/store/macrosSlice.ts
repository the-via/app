import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {MacroAPIV11} from 'src/utils/macro-api/macro-api.v11';
import type {ConnectedDevice} from '../types/types';
import {MacroAPI} from '../utils/macro-api/macro-api';
import type {AppThunk, RootState} from './index';

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
      try {
        const macroApi =
          protocol >= 11 ? new MacroAPIV11(api) : new MacroAPI(api);
        if (macroApi) {
          const macros = await macroApi.readMacroExpressions();
          dispatch(loadMacrosSuccess(macros));
        }
      } catch (err) {
        dispatch(setMacrosNotSupported());
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

export const getIsMacroFeatureSupported = (state: RootState) =>
  state.macros.isFeatureSupported;
