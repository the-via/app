import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import type {DefinitionVersion} from 'via-reader';
import type {RootState} from './index';

export type DesignState = {
  selectedVersion: DefinitionVersion;
};

const initialState: DesignState = {
  selectedVersion: 'v3',
};

const designSlice = createSlice({
  name: 'design',
  initialState,
  reducers: {
    selectVersion: (state, action: PayloadAction<DefinitionVersion>) => {
      state.selectedVersion = action.payload;
    },
  },
});

export const {selectVersion} = designSlice.actions;

export default designSlice.reducer;

export const getSelectedVersion = (state: RootState) =>
  state.design.selectedVersion;
