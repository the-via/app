import {createSlice, PayloadAction} from '@reduxjs/toolkit';

type CustomMenuData = {
  [commandName: string]: number[];
};
type CustomMenuDataMap = {[devicePath: string]: CustomMenuData};

export type MenusState = {
  customMenuDataMap: CustomMenuDataMap;
};

const initialState: MenusState = {
  customMenuDataMap: {},
};

const menusSlice = createSlice({
  name: 'menus',
  initialState,
  reducers: {
    updateSelectedCustomMenuData: (
      state,
      action: PayloadAction<{menuData: CustomMenuData; devicePath: string}>,
    ) => {
      const {devicePath, menuData} = action.payload;
      state.customMenuDataMap[devicePath] = menuData;
    },
    updateCustomMenuData: (state, action: PayloadAction<CustomMenuDataMap>) => {
      state.customMenuDataMap = {...state.customMenuDataMap, ...action.payload};
    },
  },
});

export const {updateSelectedCustomMenuData, updateCustomMenuData} =
  menusSlice.actions;

export default menusSlice.reducer;
