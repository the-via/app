import {createSelector, createSlice, PayloadAction} from '@reduxjs/toolkit';
import {
  commonMenus,
  isVIADefinitionV2,
  isVIADefinitionV3,
  isVIAMenu,
  VIAMenu,
} from '@the-via/reader';
import {
  makeCustomMenu,
  makeCustomMenus,
} from 'src/components/panes/configure-panes/custom/menu-generator';
import {KeyboardAPI} from 'src/utils/keyboard-api';
import type {CommonMenusMap, ConnectedDevice} from '../types/types';
import {getSelectedDefinition} from './definitionsSlice';
import {
  getSelectedConnectedDevice,
  getSelectedDevicePath,
  getSelectedKeyboardAPI,
} from './devicesSlice';
import type {AppThunk, RootState} from './index';
import {getSelectedFirmwareVersion} from './firmwareSlice';

type CustomMenuData = {
  [commandName: string]: number[] | number[][];
};
type CustomMenuDataMap = {[devicePath: string]: CustomMenuData};

type MenusState = {
  customMenuDataMap: CustomMenuDataMap;
  commonMenusMap: CommonMenusMap;
  showKeyPainter: boolean;
};

const initialState: MenusState = {
  customMenuDataMap: {},
  commonMenusMap: {},
  showKeyPainter: false,
};

const menusSlice = createSlice({
  name: 'menus',
  initialState,
  reducers: {
    updateShowKeyPainter: (state, action: PayloadAction<boolean>) => {
      state.showKeyPainter = action.payload;
    },
    updateSelectedCustomMenuData: (
      state,
      action: PayloadAction<{menuData: CustomMenuData; devicePath: string}>,
    ) => {
      const {devicePath, menuData} = action.payload;
      state.customMenuDataMap[devicePath] = menuData;
    },
    updateCommonMenus: (
      state,
      action: PayloadAction<{commonMenuMap: CommonMenusMap}>,
    ) => {
      const {commonMenuMap} = action.payload;
      state.commonMenusMap = commonMenuMap;
    },
    updateCustomMenuData: (state, action: PayloadAction<CustomMenuDataMap>) => {
      state.customMenuDataMap = {...state.customMenuDataMap, ...action.payload};
    },
  },
});

export const {
  updateShowKeyPainter,
  updateSelectedCustomMenuData,
  updateCustomMenuData,
} = menusSlice.actions;

export default menusSlice.reducer;

export const updateCustomMenuValue =
  (command: string, ...rest: number[]): AppThunk =>
  async (dispatch, getState) => {
    const state = getState();
    const firmwareVersion = getSelectedFirmwareVersion(state);
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
    const {path} = connectedDevice;
    dispatch(
      updateSelectedCustomMenuData({
        menuData: data,
        devicePath: path,
      }),
    );

    const api = getSelectedKeyboardAPI(state) as KeyboardAPI;
    api.setCustomMenuValue(...rest.slice(0));

    const channel = rest[0];
    api.commitCustomMenu(channel);
  };

// COMMON MENU IDENTIFIER RESOLVES INTO ACTUAL MODULE
const tryResolveCommonMenu = (id: VIAMenu | string): VIAMenu | VIAMenu[] => {
  // Only convert to menu object if it is found in common menus, else return
  if (typeof id === 'string') {
    return commonMenus[id as keyof typeof commonMenus];
  }
  return id;
};

export const updateV3MenuData =
  (connectedDevice: ConnectedDevice): AppThunk =>
  async (dispatch, getState) => {
    const state = getState();
    const firmwareVersion = getSelectedFirmwareVersion(state);
    const definition = getSelectedDefinition(state);
    const api = getSelectedKeyboardAPI(state) as KeyboardAPI;

    if (!isVIADefinitionV3(definition)) {
      throw new Error('V3 menus are only compatible with V3 VIA definitions.');
    }
    const menus = getV3Menus(state);
    const commands = menus.flatMap(extractCommands);
    const {protocol, path} = connectedDevice;

    if (commands.length !== 0 && protocol >= 11) {
      let props = {} as CustomMenuData;
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

      // Update to detect instance of color-palette control and an li on a key
      const maxLedIndex = Math.max(
        ...definition.layouts.keys.map((key) => key.li ?? -1),
      );
      console.debug(maxLedIndex, 'maxLedIndex');

      if (maxLedIndex >= 0) {
        // Ask for PerKeyRGBValues -- hardcoded to 62
        const perKeyRGB = await api.getPerKeyRGBMatrix(
          Array(maxLedIndex + 1)
            .fill(0)
            .map((_, i) => i),
        );
        props.__perKeyRGB = perKeyRGB;
      }

      dispatch(
        updateSelectedCustomMenuData({
          devicePath: path,
          menuData: {
            ...props,
            ...(firmwareVersion !== undefined && {
              id_firmware_version: [firmwareVersion],
            }),
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
    : 'content' in menuOrControls && typeof menuOrControls.content !== 'string'
    ? menuOrControls.content.flatMap(extractCommands)
    : [];
};

export const getCommonMenusDataMap = (state: RootState) =>
  state.menus.commonMenusMap;

export const getShowKeyPainter = (state: RootState) =>
  state.menus.showKeyPainter;

export const getCustomMenuDataMap = (state: RootState) =>
  state.menus.customMenuDataMap;

export const getSelectedCustomMenuData = createSelector(
  getCustomMenuDataMap,
  getSelectedDevicePath,
  (map, path) => path && map[path],
);

export const getV3Menus = createSelector(
  getSelectedDefinition,
  (definition) => {
    if (!definition || !isVIADefinitionV3(definition)) {
      return [];
    }

    // TODO: handle Common menus (built ins in here too?)
    return (definition.menus || [])
      .flatMap(tryResolveCommonMenu)
      .map((menu, idx) =>
        isVIAMenu(menu) ? compileMenu('custom_menu', 3, menu, idx) : menu,
      );
  },
);

export const getV3MenuComponents = createSelector(
  getSelectedDefinition,
  getSelectedCustomMenuData,
  (definition, selectedCustomMenuData) => {
    if (!definition || !isVIADefinitionV3(definition)) {
      return [];
    }

    // TODO: handle Common menus (built ins in here too?)
    return (definition.menus || [])
      .flatMap(tryResolveCommonMenu)
      .map((menu: any, idx) =>
        isVIAMenu(menu)
          ? makeCustomMenu(compileMenu('custom_menu', 3, menu, idx), idx)
          : menu,
      )
      .filter((menuComponent: any) => {
        // Filter out menus that shouldn't be shown
        if (menuComponent.shouldShow && selectedCustomMenuData) {
          return menuComponent.shouldShow(selectedCustomMenuData);
        }
        return true; // Show by default if no shouldShow function
      }) as ReturnType<typeof makeCustomMenus>;
  },
);

export const getCustomCommands = createSelector(
  getSelectedDefinition,
  getV3Menus,
  (definition, v3Menus) => {
    if (!definition) {
      return [];
    }
    const menus = isVIADefinitionV2(definition)
      ? definition.customMenus
      : v3Menus;

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

const compileMenu = (partial: string, depth = 0, val: any, idx: number) => {
  return depth === 0
    ? val
    : {
        ...val,
        _id: `${partial}_${idx}`,
        content:
          val.label !== undefined
            ? typeof val.content === 'string'
              ? val.content
              : val.content.map((contentVal: any, contentIdx: number) =>
                  compileMenu(
                    `${partial}_${contentIdx}`,
                    depth - 1,
                    contentVal,
                    idx,
                  ),
                )
            : val.content.map((contentVal: any, contentIdx: number) =>
                compileMenu(`${partial}_${contentIdx}`, depth, contentVal, idx),
              ),
      };
};
