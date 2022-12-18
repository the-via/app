import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import type {DefinitionVersion} from '@the-via/reader';
import type {RootState} from './index';

export type DesignState = {
  selectedVersion: DefinitionVersion;
  selectedDefinitionIndex: number;
  selectedOptionKeys: number[];
  showMatrix: boolean;
};

const initialState: DesignState = {
  selectedVersion: 'v3',
  showMatrix: false,
  selectedOptionKeys: [],
  selectedDefinitionIndex: 0,
};

const designSlice = createSlice({
  name: 'design',
  initialState,
  reducers: {
    selectVersion: (state, action: PayloadAction<DefinitionVersion>) => {
      state.selectedVersion = action.payload;
    },
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
  selectVersion,
  updateSelectedDefinitionIndex,
  updateSelectedOptionKeys,
  updateShowMatrix,
} = designSlice.actions;

export default designSlice.reducer;

export const getSelectedVersion = (state: RootState) =>
  state.design.selectedVersion;

export const getSelectedDefinitionIndex = (state: RootState) =>
  state.design.selectedDefinitionIndex;

export const getDesignSelectedOptionKeys = (state: RootState) =>
  state.design.selectedOptionKeys;

export const getShowMatrix = (state: RootState) => state.design.showMatrix;
