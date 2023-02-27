import {createSelector, createSlice, PayloadAction} from '@reduxjs/toolkit';
import {KeyboardAPI} from 'src/utils/keyboard-api';
import {getMacroAPI, isDelaySupported} from 'src/utils/macro-api';
import {
  expressionToSequence,
  optimizedSequenceToRawSequence,
  rawSequenceToOptimizedSequence,
  sequenceToExpression,
} from 'src/utils/macro-api/macro-api.common';
import {RawKeycodeSequence} from 'src/utils/macro-api/types';
import type {ConnectedDevice} from '../types/types';
import {
  getSelectedConnectedDevice,
  getSelectedKeyboardAPI,
} from './devicesSlice';
import type {AppThunk, RootState} from './index';

export type MacrosState = {
  ast: RawKeycodeSequence[];
  macroBufferSize: number;
  macroCount: number;
  isFeatureSupported: boolean;
};

export const macrosInitialState: MacrosState = {
  ast: [],
  macroBufferSize: 0,
  macroCount: 0,
  isFeatureSupported: true,
};

export const macrosSlice = createSlice({
  name: 'macros',
  initialState: macrosInitialState,
  reducers: {
    loadMacrosSuccess: (
      state,
      action: PayloadAction<{
        ast: RawKeycodeSequence[];
        macroBufferSize: number;
        macroCount: number;
      }>,
    ) => {
      state.ast = action.payload.ast;
      state.macroBufferSize = action.payload.macroBufferSize;
      state.macroCount = action.payload.macroCount;
    },
    saveMacrosSuccess: (
      state,
      action: PayloadAction<{ast: RawKeycodeSequence[]}>,
    ) => {
      state.ast = action.payload.ast;
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
  async (dispatch, getState) => {
    const {protocol} = connectedDevice;
    if (protocol < 8) {
      dispatch(setMacrosNotSupported());
    } else {
      try {
        const state = getState();
        const api = getSelectedKeyboardAPI(state) as KeyboardAPI;
        const macroApi = getMacroAPI(protocol, api);
        if (macroApi) {
          const sequences = await macroApi.readRawKeycodeSequences();
          const macroBufferSize = await api.getMacroBufferSize();
          const macroCount = await api.getMacroCount();
          dispatch(
            loadMacrosSuccess({ast: sequences, macroBufferSize, macroCount}),
          );
        }
      } catch (err) {
        dispatch(setMacrosNotSupported());
      }
    }
  };

export const saveMacros =
  (connectedDevice: ConnectedDevice, macros: string[]): AppThunk =>
  async (dispatch, getState) => {
    const state = getState();
    const api = getSelectedKeyboardAPI(state) as KeyboardAPI;
    const {protocol} = connectedDevice;
    const macroApi = getMacroAPI(protocol, api);
    if (macroApi) {
      const sequences = macros.map((expression) => {
        const optimizedSequence = expressionToSequence(expression);
        const rawSequence = optimizedSequenceToRawSequence(optimizedSequence);
        return rawSequence;
      });
      await macroApi.writeRawKeycodeSequences(sequences);
      dispatch(saveMacrosSuccess({ast: sequences}));
    }
  };

export const getIsMacroFeatureSupported = (state: RootState) =>
  state.macros.isFeatureSupported;

export const getAST = (state: RootState) => state.macros.ast;
export const getMacroBufferSize = (state: RootState) =>
  state.macros.macroBufferSize;
export const getMacroCount = (state: RootState) => state.macros.macroCount;

export const getExpressions = createSelector(getAST, (sequences) =>
  sequences.map((sequence) => {
    const optimizedSequence = rawSequenceToOptimizedSequence(sequence);
    const expression = sequenceToExpression(optimizedSequence);
    return expression;
  }),
);

export const getIsDelaySupported = createSelector(
  getSelectedConnectedDevice,
  (device) => !!device && isDelaySupported(device.protocol),
);
