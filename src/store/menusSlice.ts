import {createSelector, createSlice, PayloadAction} from '@reduxjs/toolkit';
import type {ConnectedDevice} from '../types/types';
import {isVIADefinitionV2, isVIADefinitionV3, isVIAMenu} from 'via-reader';
import type {AppThunk, RootState} from './index';
import {getSelectedDefinition} from './definitionsSlice';
import {
  getSelectedConnectedDevice,
  getSelectedDevicePath,
} from './devicesSlice';

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

export const updateCustomMenuValue =
  (command: string, ...rest: number[]): AppThunk =>
  async (dispatch, getState) => {
    const state = getState();
    const connectedDevice = getSelectedConnectedDevice(state);
    if (!connectedDevice) {
      return;
    }

    const menuData = getSelectedCustomMenuData(state);
    const commands = getCustomCommands(state);
    const data = {
      ...menuData,
      [command]: [...rest.slice(commands[command].length)],
    };
    const {api, device} = connectedDevice;
    dispatch(
      updateSelectedCustomMenuData({
        menuData: data,
        devicePath: device.path,
      }),
    );
    api.setCustomMenuValue(...rest.slice(0));

    const channel = rest[0];
    api.commitCustomMenu(channel);
  };

export const updateV3MenuData =
  (connectedDevice: ConnectedDevice): AppThunk =>
  async (dispatch, getState) => {
    const state = getState();
    const {api, protocol, device} = connectedDevice;

    const definition = getSelectedDefinition(state);
    if (!isVIADefinitionV3(definition)) {
      throw new Error('V3 menus are only compatible with V3 VIA definitions.');
    }
    const {menus = []} = definition;
    const commands = menus.flatMap(extractCommands);
    if (commands.length !== 0 && protocol >= 10) {
      let props = {};
      const commandPromises = commands.map(([name, channelId, ...command]) => ({
        command: name,
        promise: api.getCustomMenuValue([channelId].concat(command)),
      }));
      const commandPromisesRes = await Promise.all(
        commandPromises.map((c) => c.promise),
      );
      props = commandPromises.reduce(
        ({res, ref}, n, idx) => ({
          ref,
          res: {...res, [n.command]: ref[idx].slice(1)},
        }),
        {res: props, ref: commandPromisesRes},
      ).res;

      dispatch(
        updateCustomMenuData({
          [device.path]: {
            ...props,
          },
        }),
      );
    }
  };

// TODO: properly type the input and add proper type guards
const extractCommands = (menuOrControls: any) => {
  if (typeof menuOrControls === 'string') {
    return [];
  }
  return 'type' in menuOrControls
    ? [menuOrControls.content]
    : 'content' in menuOrControls
    ? menuOrControls.content.flatMap(extractCommands)
    : [];
};

export const getCustomMenuDataMap = (state: RootState) =>
  state.menus.customMenuDataMap;

export const getSelectedCustomMenuData = createSelector(
  getCustomMenuDataMap,
  getSelectedDevicePath,
  (map, path) => path && map[path],
);

export const getCustomCommands = createSelector(
  getSelectedDefinition,
  (definition) => {
    if (!definition) {
      return [];
    }
    const menus = isVIADefinitionV2(definition)
      ? definition.customMenus
      : definition.menus;

    if (menus === undefined) {
      return [];
    }

    return menus.flatMap(extractCommands).reduce((p, n) => {
      return {
        ...p,
        [n[0]]: n.slice(1),
      };
    }, {});
  },
);

export const getCustomMenus = createSelector(
  getSelectedDefinition,
  (definition) => {
    if (!definition || !isVIADefinitionV3(definition)) {
      return [];
    }

    const compileMenu = (partial: string, depth = 0, val: any, idx: number) => {
      console.log('compiling menu');
      return depth === 0
        ? val
        : {
            ...val,
            _id: `${partial}_${idx}`,
            content:
              val.label !== undefined
                ? val.content.map((contentVal: any, contentIdx: number) =>
                    compileMenu(
                      `${partial}_${contentIdx}`,
                      depth - 1,
                      contentVal,
                      idx,
                    ),
                  )
                : val.content.map((contentVal: any, contentIdx: number) =>
                    compileMenu(
                      `${partial}_${contentIdx}`,
                      depth,
                      contentVal,
                      idx,
                    ),
                  ),
          };
    };

    // TODO: handle Common menus (built ins in here too?)
    return (definition.menus || [])
      .filter((menu) => isVIAMenu(menu))
      .map((val, idx) => compileMenu('custom_menu', 3, val, idx));
  },
);
