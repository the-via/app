import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {getMacroAPI} from 'src/utils/macro-api';
import {KeycodeSequence} from 'src/utils/use-keycode-recorder';
import type {ConnectedDevice} from '../types/types';
import type {AppThunk, RootState} from './index';

export type MacrosState = {
  ast: KeycodeSequence[];
  expressions: string[];
  isFeatureSupported: boolean;
};

export const macrosInitialState: MacrosState = {
  ast: [],
  expressions: [],
  isFeatureSupported: true,
};

export const macrosSlice = createSlice({
  name: 'macros',
  initialState: macrosInitialState,
  reducers: {
    loadMacrosSuccess: (
      state,
      action: PayloadAction<{expressions: string[]; ast: KeycodeSequence[]}>,
    ) => {
      state.expressions = action.payload.expressions;
      state.ast = action.payload.ast;
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
  (
    connectedDevice: ConnectedDevice,
    basicKeyToByte: Record<string, number>,
  ): AppThunk =>
  async (dispatch) => {
    const {api, protocol} = connectedDevice;
    if (protocol < 8) {
      dispatch(setMacrosNotSupported());
    } else {
      try {
        const macroApi = getMacroAPI(protocol, api);
        if (macroApi) {
          const macros = await macroApi.readMacroExpressions();
          const macrosAst = await macroApi.readMacroASTS();
          dispatch(loadMacrosSuccess({expressions: macros, ast: macrosAst}));
        }
      } catch (err) {
        dispatch(setMacrosNotSupported());
      }
    }
  };

export const saveMacros =
  (connectedDevice: ConnectedDevice, macros: string[]): AppThunk =>
  async (dispatch) => {
    const {api, protocol} = connectedDevice;
    const macroApi = getMacroAPI(protocol, api);
    if (macroApi) {
      await macroApi.writeMacroExpressions(macros);
      dispatch(saveMacrosSuccess(macros));
    }
  };

export const getIsMacroFeatureSupported = (state: RootState) =>
  state.macros.isFeatureSupported;
