import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import type {RootState} from './index';

type DesignState = {
  selectedDefinitionIndex: number;
  selectedOptionKeys: number[];
  showMatrix: boolean;
};

const initialState: DesignState = {
  showMatrix: false,
  selectedOptionKeys: [],
  selectedDefinitionIndex: 0,
};

const designSlice = createSlice({
  name: 'design',
  initialState,
  reducers: {
    updateSelectedDefinitionIndex: (state, action: PayloadAction<number>) => {
      state.selectedDefinitionIndex = action.payload;
    },
    updateSelectedOptionKeys: (state, action: PayloadAction<number[]>) => {
      state.selectedOptionKeys = action.payload;
    },
    updateShowMatrix: (state, action: PayloadAction<boolean>) => {
      state.showMatrix = action.payload;
    },
  },
});

export const {
  updateSelectedDefinitionIndex,
  updateSelectedOptionKeys,
  updateShowMatrix,
} = designSlice.actions;

export default designSlice.reducer;

export const getSelectedDefinitionIndex = (state: RootState) =>
  state.design.selectedDefinitionIndex;

export const getDesignSelectedOptionKeys = (state: RootState) =>
  state.design.selectedOptionKeys;

export const getShowMatrix = (state: RootState) => state.design.showMatrix;
