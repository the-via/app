import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {getMacroAPI} from 'src/utils/macro-api';
import {
  expressionToSequence,
  optimizedSequenceToRawSequence,
  rawSequenceToOptimizedSequence,
  sequenceToExpression,
} from 'src/utils/macro-api/macro-api.common';
import {RawKeycodeSequence} from 'src/utils/macro-api/types';
import type {ConnectedDevice} from '../types/types';
import type {AppThunk, RootState} from './index';

export type MacrosState = {
  ast: RawKeycodeSequence[];
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
      action: PayloadAction<{expressions: string[]; ast: RawKeycodeSequence[]}>,
    ) => {
      state.expressions = action.payload.expressions;
      state.ast = action.payload.ast;
    },
    saveMacrosSuccess: (
      state,
      action: PayloadAction<{expressions: string[]; ast: RawKeycodeSequence[]}>,
    ) => {
      state.expressions = action.payload.expressions;
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
          const sequences = await macroApi.readRawKeycodeSequences();
          const expressions = sequences.map((sequence) => {
            const optimizedSequence = rawSequenceToOptimizedSequence(sequence);
            const expression = sequenceToExpression(optimizedSequence);
            return expression;
          });
          dispatch(
            loadMacrosSuccess({expressions: expressions, ast: sequences}),
          );
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
      const sequences = macros.map((expression) => {
        const optimizedSequence = expressionToSequence(expression);
        const rawSequence = optimizedSequenceToRawSequence(optimizedSequence);
        return rawSequence;
      });
      await macroApi.writeRawKeycodeSequences(sequences);
      dispatch(saveMacrosSuccess({expressions: macros, ast: sequences}));
    }
  };

export const getIsMacroFeatureSupported = (state: RootState) =>
  state.macros.isFeatureSupported;
