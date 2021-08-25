import type {ThunkAction} from 'redux-thunk';
import {createSelector} from 'reselect';
import {
  ActionType,
  createReducer,
  createStandardAction,
} from 'typesafe-actions';
import {
  BuiltInMenuModule,
  DefinitionVersion,
  getLightingDefinition,
  isVIADefinitionV2,
  isVIADefinitionV3,
  LightingValue,
  VIADefinitionV2,
  VIADefinitionV3,
  VIAMenu,
} from 'via-reader';

import type {
  Device,
  KeyboardDictionary,
  VendorProductIdMap,
  LightingData,
  ConnectedDevice,
  ConnectedDevices,
  HIDColor,
} from '../../types/types';
import {
  bytesIntoNum,
  numIntoBytes,
  packBits,
  unpackBits,
} from '../../utils/bit-pack';
import {
  getSupportedIdsFromStore,
  getMissingDefinition,
  syncStore,
  getDefinitionsFromStore,
} from '../../utils/device-store';
import {
  getRecognisedDevices,
  getVendorProductId,
} from '../../utils/hid-keyboards';
import {KeyboardAPI, KeyboardValue} from '../../utils/keyboard-api';
import type {RootState} from '..';
import {loadMacros} from './macros';

type Keymap = number[];
type Layer = {
  keymap: Keymap;
  isLoaded: boolean;
};
type DeviceMap = {[devicePath: string]: Layer[]};

type CustomMenuData = {
  [commandName: string]: number[];
};

type LayoutOption = number;
type LightingMap = {[devicePath: string]: LightingData};
type CustomMenuDataMap = {[devicePath: string]: CustomMenuData};
type LayoutOptionsMap = {[devicePath: string]: LayoutOption[]};

// Actions
export const actions = {
  allowGlobalHotKeys: createStandardAction('via/keymap/ALLOW_GLOBAL_HOTKEYS')(),
  disableGlobalHotKeys: createStandardAction(
    'via/keymap/DISABLE_GLOBAL_HOTKEYS',
  )(),
  clearSelectedKey: createStandardAction('via/keymap/CLEAR_SELECTED_KEY')(),
  updateSelectedKey: createStandardAction(
    'via/keymap/UPDATE_SELECTED_KEY',
  )<number>(),
  updateSupportedIds: createStandardAction(
    'via/keymap/UPDATE_SUPPORTED_IDS',
  )<VendorProductIdMap>(),
  updateDefinitions: createStandardAction(
    'via/keymap/UPDATE_DEFINITIONS',
  )<KeyboardDictionary>(),
  loadDefinition: createStandardAction('via/keymap/LOAD_DEFINITION')<{
    definition: VIADefinitionV2 | VIADefinitionV3;
    version: DefinitionVersion;
  }>(),
  setNumberOfLayers: createStandardAction(
    'via/keymap/SET_NUMBER_OF_LAYERS',
  )<number>(),
  loadLayerSuccess: createStandardAction('via/keymap/LOAD')<{
    layerIndex: number;
    keymap: number[];
    devicePath: string;
  }>(),
  saveKeymapSuccess: createStandardAction('via/keymap/SAVE')<Layer[]>(),
  setLayer: createStandardAction('via/keymap/SET_LAYER')<number>(),
  setKey: createStandardAction('via/keymap/SET_KEY')<{
    keyIndex: number;
    value: number;
  }>(),

  // TODO: move this to a device-centric reducer later
  selectDevice: createStandardAction(
    'via/keymap/SELECT_DEVICE',
  )<Device | null>(),
  updateSelectedCustomMenuData: createStandardAction(
    'via/lighting/UPDATE_SELECTED_CUSTOM_MENU_DATA',
  )<CustomMenuData>(),
  updateSelectedLightingData: createStandardAction(
    'via/lighting/UPDATE_SELECTED_LIGHTING_DATA',
  )<LightingData>(),
  updateLayoutOptions: createStandardAction(
    'via/lighting/UPDATE_LAYOUT_OPTIONS',
  )<Partial<LayoutOptionsMap>>(),
  updateLighting: createStandardAction(
    'via/lighting/UPDATE_LIGHTING',
  )<LightingMap>(),
  updateCustomMenuData: createStandardAction(
    'via/custom_menu/UPDATE_CUSTOM_MENU_DATA',
  )<CustomMenuDataMap>(),
  updateConnectedDevices: createStandardAction(
    'via/device/UPDATE_CONNECTED_DEVICES',
  )<ConnectedDevices>(),
};

type Actions = ActionType<typeof actions>;

// Thunks
type ThunkResult = ThunkAction<Promise<void>, RootState, undefined, Actions>;

// TODO: don't need to pass device when we move that to redux
// edit: can we replace the device param by calling getSelectedConnectedDevice() inside the thunk?
export const loadKeymapFromDevice = (
  connectedDevice: ConnectedDevice,
): ThunkResult => {
  return async (dispatch, getState) => {
    const {api} = connectedDevice;

    const state = getState().keymap;
    if (getLoadProgress(state) === 1) {
      return;
    }

    const numberOfLayers = await api.getLayerCount();
    dispatch(actions.setNumberOfLayers(numberOfLayers));
    for (let layer = 0; layer < numberOfLayers; layer++) {
      dispatch(loadKeymapLayer(layer, connectedDevice));
    }
  };
};

const loadKeymapLayer = (
  layerIndex: number,
  connectedDevice: ConnectedDevice,
): ThunkResult => {
  return async (dispatch, getState) => {
    const {api, device, vendorProductId, requiredDefinitionVersion} =
      connectedDevice;
    const {path: devicePath} = device;
    const {matrix} = getDefinitions(getState().keymap)[vendorProductId][
      requiredDefinitionVersion
    ];
    const keymap = await api.readRawMatrix(matrix, layerIndex);
    dispatch(actions.loadLayerSuccess({layerIndex, keymap, devicePath}));
  };
};

export const updateLayoutOption = (
  path: string,
  index: number,
  val: number,
): ThunkResult => {
  return async (dispatch, getState) => {
    const state = getState().keymap;
    const {labels} = getSelectedDefinition(state).layouts;
    if (labels) {
      const optionsNums = labels.map((layoutLabel) =>
        Array.isArray(layoutLabel) ? layoutLabel.slice(1).length : 2,
      );
      const api = getSelectedAPI(state);
      const options = [...getSelectedLayoutOptions(state)];
      options[index] = val;

      const bytes = numIntoBytes(
        packBits(options.map((option, idx) => [option, optionsNums[idx]])),
      );

      try {
        await api.setKeyboardValue(KeyboardValue.LAYOUT_OPTIONS, ...bytes);
      } catch {
        console.warn('Setting layout option command not working');
      }

      // Save Layout Options here
      dispatch(
        actions.updateLayoutOptions({
          [path]: options,
        }),
      );
    }
  };
};

// This scans for potentially compatible devices, filter out the ones that have the correct protocol
// and then optionally will select the first one if the current selection is non-existent
export const reloadConnectedDevices = (): ThunkResult => {
  return async (dispatch, getState) => {
    const state = getState().keymap;
    const selectedPath = getSelectedDevicePath(state) as string;
    const recognisedDevices = await getRecognisedDevices(state.supportedIds);

    const protocolVersions = await Promise.all(
      recognisedDevices.map((device) =>
        new KeyboardAPI(device).getProtocolVersion(),
      ),
    );

    const connectedDevices = recognisedDevices.reduce<ConnectedDevices>(
      (devices, device, idx) => {
        const protocol = protocolVersions[idx];
        devices[device.path] = {
          api: new KeyboardAPI(device),
          device,
          protocol,
          requiredDefinitionVersion: protocol >= 10 ? 'v3' : 'v2',
          vendorProductId: getVendorProductId(
            device.vendorId,
            device.productId,
          ),
        };

        return devices;
      },
      {},
    );

    const definitions = getDefinitions(state);
    const missingDefinitions = await Promise.all(
      Object.values(connectedDevices)
        // Check if we already have the required definition in the store
        .filter(({vendorProductId, requiredDefinitionVersion}) => {
          return (
            !definitions ||
            !definitions[vendorProductId] ||
            !definitions[vendorProductId][requiredDefinitionVersion]
          );
        })
        // Go and get it if we don't
        .map(({device, requiredDefinitionVersion}) =>
          getMissingDefinition(device, requiredDefinitionVersion),
        ),
    );

    dispatch(
      actions.updateDefinitions(
        missingDefinitions.reduce<KeyboardDictionary>(
          (p, [definition, version]) => ({
            ...p,
            [definition.vendorProductId]: {
              ...p[definition.vendorProductId],
              [version]: definition,
            },
          }),
          {},
        ),
      ),
    );

    Object.entries(connectedDevices).forEach(([path, d]) => {
      console.info('Setting connected device:', d.protocol, path, d);
    });
    dispatch(actions.updateConnectedDevices(connectedDevices));
    const validDevicesArr = Object.entries(connectedDevices);
    if (!connectedDevices[selectedPath] && validDevicesArr.length > 0) {
      const firstConnectedDevice = validDevicesArr[0][1];
      dispatch(selectConnectedDevice(firstConnectedDevice));
    } else if (validDevicesArr.length === 0) {
      dispatch(actions.selectDevice(null));
    }
  };
};

export const selectConnectedDeviceByPath = (path: string): ThunkResult => {
  return async (dispatch, getState) => {
    await dispatch(reloadConnectedDevices());
    const connectedDevice = getConnectedDevices(getState().keymap)[path];
    if (connectedDevice) {
      dispatch(selectConnectedDevice(connectedDevice));
    }
  };
};
export const selectConnectedDevice = (
  connectedDevice: ConnectedDevice,
): ThunkResult => {
  return async (dispatch, getState) => {
    dispatch(actions.selectDevice(connectedDevice.device));
    dispatch(loadMacros(connectedDevice.device));
    dispatch(loadLayoutOptions());

    const protocol = getSelectedProtocol(getState().keymap);
    if (protocol < 10) {
      dispatch(updateLightingData(connectedDevice.device));
    }
    if (protocol >= 10) {
      dispatch(updateV3MenuData(connectedDevice.device));
    }

    dispatch(loadKeymapFromDevice(connectedDevice));
  };
};

export const updateCustomMenuValue = (
  command: string,
  ...rest: number[]
): ThunkResult => {
  return async (dispatch, getState) => {
    const state = getState().keymap;
    const menuData = getSelectedCustomMenuData(state);
    const commands = getCustomCommands(state);
    const data = {
      ...menuData,
      [command]: [...rest.slice(commands[command].length)],
    };
    const api = getSelectedAPI(state);
    dispatch(actions.updateSelectedCustomMenuData(data));
    api.setCustomMenuValue(...rest.slice(0));

    const channel = rest[0];
    api.commitCustomMenu(channel);
  };
};

export const updateBacklightValue = (
  command: LightingValue,
  ...rest: number[]
): ThunkResult => {
  return async (dispatch, getState) => {
    const state = getState().keymap;
    const selectedLightingData = getSelectedLightingData(state);
    const lightingData = {
      ...selectedLightingData,
      [command]: [...rest],
    };
    const api = getSelectedAPI(state);
    dispatch(actions.updateSelectedLightingData(lightingData));
    await api.setBacklightValue(command, ...rest);
    await api.saveLighting();
  };
};

export const updateCustomColor = (
  idx: number,
  hue: number,
  sat: number,
): ThunkResult => {
  return async (dispatch, getState) => {
    const state = getState().keymap;
    const oldLightingData = getSelectedLightingData(state);
    const customColors = [...(oldLightingData.customColors as HIDColor[])];
    customColors[idx] = {hue, sat};
    const lightingData = {
      ...oldLightingData,
      customColors,
    };
    const api = getSelectedAPI(state);
    dispatch(actions.updateSelectedLightingData(lightingData));
    api.setCustomColor(idx, hue, sat);
    await api.saveLighting();
  };
};

const commandParamLengths = {
  [LightingValue.BACKLIGHT_COLOR_1]: 2,
  [LightingValue.BACKLIGHT_COLOR_2]: 2,
  [LightingValue.QMK_RGBLIGHT_COLOR]: 2,
  [LightingValue.BACKLIGHT_CUSTOM_COLOR]: 2,
  [LightingValue.BACKLIGHT_CAPS_LOCK_INDICATOR_COLOR]: 2,
  [LightingValue.BACKLIGHT_CAPS_LOCK_INDICATOR_ROW_COL]: 2,
  [LightingValue.BACKLIGHT_LAYER_1_INDICATOR_COLOR]: 2,
  [LightingValue.BACKLIGHT_LAYER_2_INDICATOR_COLOR]: 2,
  [LightingValue.BACKLIGHT_LAYER_3_INDICATOR_COLOR]: 2,
  [LightingValue.BACKLIGHT_LAYER_1_INDICATOR_ROW_COL]: 2,
  [LightingValue.BACKLIGHT_LAYER_2_INDICATOR_ROW_COL]: 2,
  [LightingValue.BACKLIGHT_LAYER_3_INDICATOR_ROW_COL]: 2,
  [LightingValue.BACKLIGHT_EFFECT_SPEED]: 1,
  [LightingValue.BACKLIGHT_USE_7U_SPACEBAR]: 1,
  [LightingValue.BACKLIGHT_USE_ISO_ENTER]: 1,
  [LightingValue.BACKLIGHT_USE_SPLIT_BACKSPACE]: 1,
  [LightingValue.BACKLIGHT_USE_SPLIT_LEFT_SHIFT]: 1,
  [LightingValue.BACKLIGHT_USE_SPLIT_RIGHT_SHIFT]: 1,
  [LightingValue.BACKLIGHT_DISABLE_AFTER_TIMEOUT]: 1,
  [LightingValue.BACKLIGHT_DISABLE_HHKB_BLOCKER_LEDS]: 1,
  [LightingValue.BACKLIGHT_DISABLE_WHEN_USB_SUSPENDED]: 1,
};

const extractCommands = (menuOrControls: any) => {
  if (typeof menuOrControls === 'string') {
    // properly type the input and add proper type guards
    return [];
  }
  return 'type' in menuOrControls
    ? [menuOrControls.content]
    : 'content' in menuOrControls
    ? menuOrControls.content.flatMap(extractCommands)
    : [];
};

export const updateV3MenuData = (device: Device): ThunkResult => {
  return async (dispatch, getState) => {
    const state = getState().keymap;
    const {api, protocol} = state.connectedDevices[device.path]; // should this be from selected device?

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
        actions.updateCustomMenuData({
          [device.path]: {
            ...props,
          },
        }),
      );
    }
  };
};

// TODO: improve selectors and probs get rid of device being passed in
export const updateLightingData = (device: Device): ThunkResult => {
  return async (dispatch, getState) => {
    const state = getState().keymap;
    const selectedDefinition = getSelectedDefinition(state);
    const {api} = state.connectedDevices[device.path];

    if (!isVIADefinitionV2(selectedDefinition)) {
      throw new Error('This method is only compatible with v2 definitions');
    }

    const {lighting} = selectedDefinition as VIADefinitionV2;
    const {supportedLightingValues, effects} = getLightingDefinition(lighting);

    if (supportedLightingValues.length !== 0) {
      let props = {};

      // Special case for m6_b
      if (
        supportedLightingValues.indexOf(
          LightingValue.BACKLIGHT_CUSTOM_COLOR,
        ) !== -1
      ) {
        const res = await Array(Math.max(...effects.map(([_, num]) => num)))
          .fill(0)
          .map((_, idx) => api.getCustomColor(idx));
        const customColors = await Promise.all(res);
        props = {customColors};
      }

      const commandPromises = supportedLightingValues.map((command) => ({
        command,
        promise: api.getBacklightValue(
          +command,
          commandParamLengths[command as keyof typeof commandParamLengths],
        ),
      }));
      const commandPromisesRes = await Promise.all(
        commandPromises.map((c) => c.promise),
      );
      props = commandPromises.reduce(
        ({res, ref}, n, idx) => ({ref, res: {...res, [n.command]: ref[idx]}}),
        {res: props, ref: commandPromisesRes},
      ).res;

      dispatch(
        actions.updateLighting({
          [device.path]: {
            ...props,
          },
        }),
      );
    }
  };
};

export const updateKey = (keyIndex: number, value: number): ThunkResult => {
  return async (dispatch, getState) => {
    const state = getState().keymap;
    const keys = getSelectedKeyDefinitions(state);
    const api = getSelectedAPI(state);
    if (api && keys) {
      const {row, col} = keys[keyIndex];
      await api.setKey(state.selectedLayerIndex, row, col, value);
      dispatch(actions.setKey({keyIndex, value}));
    }
  };
};

export const saveRawKeymapToDevice = (
  keymap: number[][],
  device: Device,
): ThunkResult => {
  return async (dispatch, getState) => {
    const api = new KeyboardAPI(device);
    if (!api) {
      return;
    }

    const {matrix} = getSelectedDefinition(getState().keymap);
    await api.writeRawMatrix(matrix, keymap);
    const layers = keymap.map((layer) => ({
      keymap: layer,
      isLoaded: true,
    }));
    dispatch(actions.saveKeymapSuccess(layers));
  };
};

export const loadSupportedIds = (): ThunkResult => {
  // TODO: make choice based on protocol
  return async (dispatch) => {
    await syncStore();
    dispatch(actions.updateSupportedIds(getSupportedIdsFromStore()));
    dispatch(actions.updateDefinitions(getDefinitionsFromStore()));
    dispatch(reloadConnectedDevices());
  };
};

export const loadLayoutOptions = (): ThunkResult => {
  return async (dispatch, getState) => {
    const state = getState().keymap;
    const {labels} = getSelectedDefinition(state).layouts;
    if (labels) {
      const api = getSelectedAPI(state);
      const path = getSelectedDevicePath(state) as string;
      try {
        const res = await api.getKeyboardValue(KeyboardValue.LAYOUT_OPTIONS, 4);
        const options = unpackBits(
          bytesIntoNum(res),
          labels.map((layoutLabel: string[] | string) =>
            Array.isArray(layoutLabel) ? layoutLabel.slice(1).length : 2,
          ),
        );
        dispatch(
          actions.updateLayoutOptions({
            [path]: options,
          }),
        );
      } catch {
        console.warn('Getting layout options command not working');
      }
    }
  };
};

// State
export type State = {
  rawDeviceMap: Readonly<DeviceMap>;
  selectedDevicePath: string | null;
  selectedVendorProductId: number | null;
  selectedLayerIndex: number;
  numberOfLayers: number;
  connectedDevices: ConnectedDevices;
  lightingMap: LightingMap;
  customMenuDataMap: CustomMenuDataMap;
  layoutOptionsMap: LayoutOptionsMap;
  definitions: KeyboardDictionary;
  customDefinitions: KeyboardDictionary;
  selectedKey: null | number;
  allowGlobalHotKeys: boolean;
  supportedIds: VendorProductIdMap;
};

const initialState: State = {
  allowGlobalHotKeys: false,
  rawDeviceMap: {},
  definitions: {},
  customDefinitions: {},
  selectedDevicePath: null,
  selectedKey: null,
  selectedVendorProductId: null,
  selectedLayerIndex: 0,
  numberOfLayers: 4,
  connectedDevices: {},
  lightingMap: {},
  layoutOptionsMap: {},
  customMenuDataMap: {},
  supportedIds: [],
};

const getSelectedPropsFromDevice = (device: Device) => ({
  selectedDevice: device,
  selectedDevicePath: device.path,
  selectedVendorProductId: getVendorProductId(
    device.vendorId,
    device.productId,
  ),
});

const getResetSelectedProps = () => ({
  selectedDevice: null,
  selectedDevicePath: null,
  selectedVendorProductId: null,
  selectedKey: null,
});

// Reducer
export const keymapReducer = createReducer<State, Actions>(initialState)
  .handleAction(actions.disableGlobalHotKeys, (state) => ({
    ...state,
    allowGlobalHotKeys: false,
  }))
  .handleAction(actions.allowGlobalHotKeys, (state) => ({
    ...state,
    allowGlobalHotKeys: true,
  }))
  .handleAction(actions.selectDevice, (state, action) => ({
    ...state,
    ...(action.payload
      ? getSelectedPropsFromDevice(action.payload)
      : getResetSelectedProps()),
  }))
  .handleAction(actions.updateLayoutOptions, (state, action) => ({
    ...state,
    layoutOptionsMap: {
      ...state.layoutOptionsMap,
      ...action.payload,
    } as any,
  }))
  .handleAction(actions.updateLighting, (state, action) => ({
    ...state,
    lightingMap: {
      ...state.lightingMap,
      ...action.payload,
    },
  }))
  .handleAction(actions.updateCustomMenuData, (state, action) => ({
    ...state,
    customMenuDataMap: {
      ...state.customMenuDataMap,
      ...action.payload,
    },
  }))
  .handleAction(actions.clearSelectedKey, (state) => ({
    ...state,
    selectedKey: null,
  }))
  .handleAction(actions.updateSelectedKey, (state, action) => ({
    ...state,
    selectedKey: action.payload,
  }))
  .handleAction(actions.updateConnectedDevices, (state, action) => ({
    ...state,
    connectedDevices: action.payload,
  }))
  .handleAction(actions.setNumberOfLayers, (state, action) => ({
    ...state,
    numberOfLayers: action.payload,
  }))
  .handleAction(actions.loadDefinition, (state, action) => ({
    ...state,
    customDefinitions: {
      ...state.customDefinitions,
      [action.payload.definition.vendorProductId]: {
        ...[action.payload.version],
        [action.payload.version]: action.payload.definition,
      },
    },
  }))
  .handleAction(actions.updateSelectedCustomMenuData, (state, action) => ({
    ...state,
    customMenuDataMap: {
      ...state.customMenuDataMap,
      [state.selectedDevicePath as string]: action.payload,
    },
  }))
  .handleAction(actions.updateSelectedLightingData, (state, action) => ({
    ...state,
    lightingMap: {
      ...state.lightingMap,
      [state.selectedDevicePath as string]: action.payload,
    },
  }))
  .handleAction(actions.setLayer, (state, action) => {
    return {
      ...state,
      selectedLayerIndex: action.payload,
    };
  })
  .handleAction(actions.updateSupportedIds, (state, action) => ({
    ...state,
    supportedIds: action.payload,
  }))
  .handleAction(actions.updateDefinitions, (state, action) => ({
    ...state,
    definitions: {
      ...state.definitions,
      ...action.payload,
    },
  }))
  .handleAction(actions.setKey, (state, action) => {
    const {keyIndex, value} = action.payload;
    const keymap = [...(getSelectedRawLayer(state) as any).keymap];
    const {selectedLayerIndex} = state;
    const rawDeviceLayers = getSelectedRawLayers(state);
    const keys = getSelectedKeyDefinitions(state);
    const {
      matrix: {cols},
    } = getSelectedDefinition(state);

    const {row, col} = keys[keyIndex];
    const newRawLayers = [...(rawDeviceLayers as Layer[])];
    keymap[row * cols + col] = value;
    newRawLayers[selectedLayerIndex] = {
      ...newRawLayers[selectedLayerIndex],
      keymap,
    };

    return {
      ...state,
      rawDeviceMap: {
        ...state.rawDeviceMap,
        [state.selectedDevicePath as string]: newRawLayers,
      },
    };
  })
  .handleAction(actions.loadLayerSuccess, (state, action) => {
    const {layerIndex, keymap, devicePath} = action.payload;
    const deviceLayers =
      state.rawDeviceMap[devicePath] || initDeviceLayers(state.numberOfLayers);
    const newDeviceLayers = [...deviceLayers];
    newDeviceLayers[layerIndex] = {
      keymap,
      isLoaded: true,
    };
    return {
      ...state,
      rawDeviceMap: {
        ...state.rawDeviceMap,
        [devicePath]: newDeviceLayers,
      },
    };
  })
  .handleAction(actions.saveKeymapSuccess, (state, action) => ({
    ...state,
    rawDeviceMap: {
      ...state.rawDeviceMap,
      [state.selectedDevicePath as string]: action.payload,
    },
  }));

const initDeviceLayers = (numberOfLayers: number): Layer[] =>
  Array(numberOfLayers).fill({
    keymap: [],
    isLoaded: false,
  });

// Selectors

export const getConnectedDevices = (state: State) => state.connectedDevices;
export const getBaseDefinitions = (state: State) => state.definitions;
export const getCustomDefinitions = (state: State) => state.customDefinitions;
export const getSelectedKey = (state: State) => state.selectedKey;
export const getRawDeviceMap = (state: State) => state.rawDeviceMap;
export const getLayoutOptionsMap = (state: State) => state.layoutOptionsMap;
export const getCustomMenuDataMap = (state: State) => state.customMenuDataMap;
export const getLightingMap = (state: State) => state.lightingMap;
export const getNumberOfLayers = (state: State) => state.numberOfLayers;

export const getSelectedDevicePath = (state: State) =>
  state.selectedDevicePath as string;
export const getSelectedLayerIndex = (state: State) => state.selectedLayerIndex;

export const getDefinitions = createSelector(
  getBaseDefinitions,
  getCustomDefinitions,
  (definitions, customDefinitions) =>
    ({...definitions, ...customDefinitions} as KeyboardDictionary),
);
export const getSelectedConnectedDevice = createSelector(
  getConnectedDevices,
  getSelectedDevicePath,
  (devices, path) => devices[path as string] && devices[path],
);
export const getSelectedDevice = createSelector(
  getConnectedDevices,
  getSelectedDevicePath,
  (devices, path) => devices[path] && devices[path].device,
);
export const getSelectedProtocol = createSelector(
  getConnectedDevices,
  getSelectedDevicePath,
  (devices, path) => devices[path] && devices[path].protocol,
);
export const getSelectedAPI = createSelector(
  getConnectedDevices,
  getSelectedDevicePath,
  (devices, path) => devices[path] && devices[path].api,
);
export const getSelectedDefinition = createSelector(
  getDefinitions,
  getSelectedConnectedDevice,
  (definitions, connectedDevice) =>
    connectedDevice &&
    definitions &&
    definitions[connectedDevice.vendorProductId] &&
    definitions[connectedDevice.vendorProductId][
      connectedDevice.requiredDefinitionVersion
    ],
);
export const getCustomCommands = createSelector(
  getSelectedDefinition,
  (definition) => {
    if (definition === undefined) {
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
    if (definition === undefined || !isVIADefinitionV3(definition)) {
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

    // TODO: handle BuiltInMenuModule and string values
    // Should we even have random string values as per current type?
    return (definition.menus || [])
      .filter((menu) => isVIAMenu(menu))
      .map((val, idx) => compileMenu('custom_menu', 3, val, idx));
    // return [];
  },
);

export const getSelectedLayoutOptions = createSelector(
  getSelectedDefinition,
  getLayoutOptionsMap,
  getSelectedDevicePath,
  (definition, map, path) =>
    map[path] ||
    (definition &&
      definition.layouts.labels &&
      definition.layouts.labels.map((_) => 0)) ||
    [],
);
export const getSelectedCustomMenuData = createSelector(
  getCustomMenuDataMap,
  getSelectedDevicePath,
  (map, path) => map[path],
);
export const getSelectedLightingData = createSelector(
  getLightingMap,
  getSelectedDevicePath,
  (map, path) => map[path],
);
export const getSelectedRawLayers = createSelector(
  getRawDeviceMap,
  getSelectedDevicePath,
  (rawDeviceMap, devicePath) => devicePath && rawDeviceMap[devicePath],
);
export const getSelectedOptionKeys = createSelector(
  getSelectedLayoutOptions,
  getSelectedDefinition,
  (layoutOptions, definition) =>
    layoutOptions.flatMap(
      (option, idx) => definition.layouts.optionKeys[idx][option],
    ),
);
export const getSelectedKeyDefinitions = createSelector(
  getSelectedDefinition,
  getSelectedOptionKeys,
  (definition, optionKeys) => {
    if (definition && optionKeys) {
      return definition.layouts.keys.concat(optionKeys);
    }
    return [];
  },
);
export const getSelectedKeymaps = createSelector(
  getSelectedKeyDefinitions,
  getSelectedDefinition,
  getSelectedRawLayers,
  (keys, definition, layers) => {
    if (definition && layers) {
      const rawKeymaps = layers.map((layer) => layer.keymap);
      const {
        matrix: {cols},
      } = definition;
      return rawKeymaps.map((keymap) =>
        keys.map(({row, col}) => keymap[row * cols + col]),
      );
    }
    return undefined;
  },
);
export const getLoadProgress = createSelector(
  getSelectedRawLayers,
  getNumberOfLayers,
  (layers, layerCount) =>
    layers && layers.filter((layer) => layer.isLoaded).length / layerCount,
);
export const getSelectedRawLayer = createSelector(
  getSelectedRawLayers,
  getSelectedLayerIndex,
  (deviceLayers, layerIndex) => deviceLayers && deviceLayers[layerIndex],
);

export const getSelectedKeymap = createSelector(
  getSelectedKeymaps,
  getSelectedLayerIndex,
  (deviceLayers, layerIndex) => deviceLayers && deviceLayers[layerIndex],
);
