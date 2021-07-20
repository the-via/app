import * as React from 'react';
import styles from './Home.module.css';
import {mapEvtToKeycode, getByteForCode} from '../utils/key';
import {getDevicesUsingDefinitions} from '../utils/hid-keyboards';
import {usbDetect} from '../utils/usb-hid';
import {Title} from './title-bar';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {loadMacros} from '../redux/modules/macros';

import {
  loadDefinitions,
  loadKeymapFromDevice,
  reloadConnectedDevices,
  selectConnectedDevice,
  getLoadProgress,
  getSelectedLayerIndex,
  updateKey,
  actions,
  getSelectedKey,
  getSelectedDevicePath,
  getSelectedAPI,
  getSelectedDefinition,
  getSelectedVendorProductId,
  getSelectedProtocol,
  getSelectedKeyDefinitions,
  getSelectedDevice,
  getDefinitions
} from '../redux/modules/keymap';
import {RootState} from '../redux';
import {getLightingDefinition, LightingValue} from 'via-reader';
import {getNextKey} from './positioned-keyboard';

const mapStateToProps = ({keymap, settings}: RootState) => ({
  allowKeyRemappingViaKeyboard: settings.allowKeyboardKeyRemapping,
  disableFastRemap: settings.disableFastRemap,
  globalHotKeysAllowed: keymap.allowGlobalHotKeys,
  definitions: getDefinitions(keymap),
  progress: getLoadProgress(keymap),
  activeLayer: getSelectedLayerIndex(keymap),
  selectedKey: getSelectedKey(keymap),
  selectedDevicePath: getSelectedDevicePath(keymap),
  selectedDevice: getSelectedDevice(keymap),
  selectedProtocol: getSelectedProtocol(keymap),
  displayedKeys: getSelectedKeyDefinitions(keymap),
  selectedAPI: getSelectedAPI(keymap),
  selectedVendorProductId: getSelectedVendorProductId(keymap),
  selectedDefinition: getSelectedDefinition(keymap)
});
const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      loadMacros,
      loadKeymapFromDevice,
      updateKey,
      allowGlobalHotKeys: actions.allowGlobalHotKeys,
      disableGlobalHotKeys: actions.disableGlobalHotKeys,
      validateDevices: actions.validateDevices,
      updateSelectedLightingData: actions.updateSelectedLightingData,
      updateSelectedKey: actions.updateSelectedKey,
      loadDefinitions,
      selectConnectedDevice,
      reloadConnectedDevices
    },
    dispatch
  );

type OwnProps = {
  children: React.ReactNode;
};
type Props = OwnProps &
  ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

// TODO: remove loaded and ready - use loading progress instead. Need more in redux before that can be done
type State = {
  selectedTitle: string | null;
};

const timeoutRepeater = (fn, timeout, numToRepeat = 0) => () =>
  setTimeout(() => {
    fn();
    if (numToRepeat > 0) {
      timeoutRepeater(fn, timeout, numToRepeat - 1)();
    }
  }, timeout);

class Home extends React.Component<Props, State> {
  updateDevicesRepeat: () => void;

  constructor(props) {
    super(props);
    this.state = {
      selectedTitle: null
    };
    this.updateDevicesRepeat = timeoutRepeater(
      () => {
        this.props.reloadConnectedDevices();
      },
      500,
      1
    );
  }

  homeElem = React.createRef<HTMLDivElement>();

  componentDidMount() {
    if (this.homeElem.current) {
    this.homeElem.current.focus();
    }
    this.props.allowGlobalHotKeys();
    usbDetect.on('change', this.updateDevicesRepeat);
    usbDetect.on('remove', this.validateDevices);
    timeoutRepeater(this.props.loadDefinitions, 5 * 60000, Infinity);
    this.props.loadDefinitions();
    this.props.reloadConnectedDevices();
    this.updateDevicesRepeat();
    this.enableKeyPressListener();
  }

  componentWillUnmount() {
    usbDetect.off('change', this.updateDevicesRepeat);
    usbDetect.off('remove', this.validateDevices);
    this.props.disableGlobalHotKeys();
    this.disableKeyPressListener();
  }

  validateDevices = () => {
    // getDevices can potentially contain devices with no definition, change this later
    const keyboards = getDevicesUsingDefinitions(this.props.definitions);
    this.props.validateDevices(keyboards);
  };

  disableKeyPressListener = () => {
    const body = document.body;
    if (body) {
      body.removeEventListener('keydown', this.handleKeys);
    }
  };

  enableKeyPressListener = () => {
    const body = document.body;
    if (body) {
      body.addEventListener('keydown', this.handleKeys);
    }
  };

  handleKeys = (evt: KeyboardEvent): void => {
    if (
      this.props.allowKeyRemappingViaKeyboard &&
      this.props.globalHotKeysAllowed &&
      this.props.selectedKey !== null
    ) {
      this.updateSelectedKey(getByteForCode(mapEvtToKeycode(evt)));
    }
  };

  setSelectedTitle = (selectedTitle: string | null) => {
    this.props.updateSelectedKey(null);
    this.setState({selectedTitle});
  };

  componentDidUpdate(prevProps: Props) {
    if (prevProps.selectedDevicePath !== this.props.selectedDevicePath) {
      this.setState({
        selectedTitle: this.props.selectedDevicePath ? Title.KEYS : null
      });
      this.props.updateSelectedKey(null);
      this.toggleLights();
    }
  }

  updateSelectedKey = async (value: number) => {
    const {
      activeLayer,
      updateKey,
      selectedKey,
      selectedDefinition,
      displayedKeys,
      disableFastRemap
    } = this.props;

    if (activeLayer !== null && selectedKey !== null && selectedDefinition) {
      // Redux
      updateKey(selectedKey, value);
      this.props.updateSelectedKey(
        disableFastRemap ? null : getNextKey(selectedKey, displayedKeys)
      );
    }
  };

  async toggleLights() {
    const api = this.props.selectedAPI;
    const selectedDefinition = this.props.selectedDefinition;

    // TODO: Some sort of toggling lights on v3 firmware
    if (this.props.selectedProtocol >= 10) return;

    if (
      api &&
      selectedDefinition &&
      getLightingDefinition(
        selectedDefinition.lighting
      ).supportedLightingValues.includes(LightingValue.BACKLIGHT_EFFECT)
    ) {
      const val = await api.getRGBMode();
      const newVal =
        val !== 0
          ? 0
          : getLightingDefinition(selectedDefinition.lighting).effects.length -
            1;
      api.setRGBMode(newVal);
      api.timeout(200);
      api.setRGBMode(val);
      api.timeout(200);
      api.setRGBMode(newVal);
      api.timeout(200);
      await api.setRGBMode(val);
    }
  }

  render() {
    // Remove once custom menus are removed
    return (
      <div className={styles.home} ref={this.homeElem} tabIndex={0}>
        {this.props.children}
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Home);
