import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import type {LightingData} from 'src/types/types';

type LightingMap = {[devicePath: string]: LightingData};

export type LightingState = {lightingMap: LightingMap};

const initialState: LightingState = {
  lightingMap: {},
};

const lightingSlice = createSlice({
  name: 'lighting',
  initialState,
  reducers: {
    updateSelectedLightingData: (
      state,
      action: PayloadAction<{lightingData: LightingData; devicePath: string}>,
    ) => {
      const {lightingData, devicePath} = action.payload;
      state.lightingMap[devicePath] = lightingData;
    },
    updateLighting: (state, action: PayloadAction<LightingMap>) => {
      state.lightingMap = {...state.lightingMap, ...action.payload};
    },
  },
});

export const {updateLighting, updateSelectedLightingData} =
  lightingSlice.actions;

export default lightingSlice.reducer;
