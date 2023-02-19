import {Component} from 'react';
import styled from 'styled-components';
import Select from 'react-select';
import {
  getEncoderModes,
  setEncoderModes,
  getDefaultOLED,
  setDefaultOLED,
  getOLEDMode,
  setOLEDMode,
  getCustomEncoderConfig,
  setCustomEncoderConfig,
} from './api';
import {EncoderModeToggle} from './encoder-mode-toggle';
import {EncoderCustomConfig} from './encoder-custom-config';
import type {KeyboardAPI} from '../../../../../utils/keyboard-api';
import {getSelectedConnectedDevice} from 'src/store/devicesSlice';
import {useAppSelector} from 'src/store/hooks';

type EnabledEncoderModes = number;
type OLEDMode = number;
type EncoderBehavior = [number, number, number];

const MenuContainer = styled.div`
  display: flex;
  color: #717070;
  padding: 24px;
  font-family: GothamRounded;
  h3 {
    margin: 4px 0;
  }
  p {
    margin: 4px 0 8px 0;
    width: 288px;
    font-size: 13px;
    text-align: center;
  }
`;

const SectionContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
`;

const OLEDSelectContainer = styled.div`
  width: 156px;
  margin-bottom: 12px;
`;

const CustomEncoderContainer = styled.div`
  padding-left: 112px;
  display: flex;
  flex-direction: row;
`;

const LabelText = styled.span`
  font-weight: 650;
  margin-right: 8px;
  width: 64px;
`;

const OLED_OPTIONS = [
  {value: 0, label: 'Default'},
  {value: 1, label: 'Time'},
  {value: 2, label: 'Off'},
];

type State = {
  enabledModes: number;
  defaultOLEDMode: number;
  currOLEDMode: number;
  encoderBehaviors: EncoderBehavior[];
};

export const SatisfactionMenu = () => {
  const selectedDevice = useAppSelector(getSelectedConnectedDevice);
  if (selectedDevice) {
    return <BaseSatisfactionMenu api={selectedDevice.api} />;
  }
  return null;
};

class BaseSatisfactionMenu extends Component<{api: KeyboardAPI}, State> {
  state = {
    enabledModes: 0x1f,
    defaultOLEDMode: 0,
    currOLEDMode: 0,
    encoderBehaviors: [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ] as EncoderBehavior[],
  };

  componentDidMount() {
    this.fetchDataAndSet();
  }

  fetchDataAndSet = async () => {
    const {api} = this.props;
    const promises = [
      getEncoderModes(api),
      getDefaultOLED(api),
      getOLEDMode(api),
      getCustomEncoderConfig(api, 0),
      getCustomEncoderConfig(api, 1),
      getCustomEncoderConfig(api, 2),
    ];
    const [
      enabledModes,
      defaultOLEDMode,
      currOLEDMode,
      encoder0,
      encoder1,
      encoder2,
    ] = await Promise.all(promises);
    this.setState({
      enabledModes,
      defaultOLEDMode,
      currOLEDMode,
      encoderBehaviors: [encoder0, encoder1, encoder2],
    });
  };

  onEncoderModeChange = (newEncoderModes: EnabledEncoderModes) => {
    const {api} = this.props;
    const {enabledModes: currentModes} = this.state;
    if (currentModes !== newEncoderModes) {
      this.setState({enabledModes: newEncoderModes});
      setEncoderModes(api, newEncoderModes);
    }
  };

  onEncoderCustomConfigChange = (
    encoderIdx: number,
    behavior: number,
    newValue: number,
  ) => {
    const {api} = this.props;
    const newBehaviors = [...this.state.encoderBehaviors];
    newBehaviors[encoderIdx][behavior] = newValue;
    this.setState({encoderBehaviors: newBehaviors});
    setCustomEncoderConfig(api, encoderIdx, behavior, newValue);
  };

  onOLEDDefaultChange = (input: {value: OLEDMode}) => {
    const {value: newDefaultOLEDMode} = input;
    const {api} = this.props;
    const {defaultOLEDMode: currentMode} = this.state;
    if (currentMode !== newDefaultOLEDMode) {
      this.setState({defaultOLEDMode: newDefaultOLEDMode});
      setDefaultOLED(api, newDefaultOLEDMode);
    }
  };

  onOLEDChange = (input: {value: OLEDMode}) => {
    const {value: newOLEDMode} = input;
    const {api} = this.props;
    const {currOLEDMode} = this.state;
    if (currOLEDMode !== newOLEDMode) {
      this.setState({currOLEDMode: newOLEDMode});
      setOLEDMode(api, newOLEDMode);
    }
  };

  render() {
    const {api} = this.props;
    const {enabledModes, defaultOLEDMode, currOLEDMode, encoderBehaviors} =
      this.state;
    if (api) {
      return (
        <MenuContainer>
          <SectionContainer>
            <EncoderModeToggle
              onChange={this.onEncoderModeChange}
              enabledModes={enabledModes}
            />
          </SectionContainer>
          <SectionContainer>
            <h3>Default OLED Mode:</h3>
            <p>
              This is the OLED mode that will be selected by default when you
              plug in your keyboard.
            </p>
            <OLEDSelectContainer>
              <Select
                value={OLED_OPTIONS.find((e) => e.value === defaultOLEDMode)}
                onChange={this.onOLEDDefaultChange as any}
                options={OLED_OPTIONS}
              />
            </OLEDSelectContainer>
            <h3>Current OLED Mode:</h3>
            <p>Change your {"keyboard's"} current OLED mode</p>
            <OLEDSelectContainer>
              <Select
                value={OLED_OPTIONS.find((e) => e.value === currOLEDMode)}
                onChange={this.onOLEDChange as any}
                options={OLED_OPTIONS}
                menuPlacement="top"
              />
            </OLEDSelectContainer>
          </SectionContainer>
          <SectionContainer>
            <h3>Custom Encoder Configuration:</h3>
            <p>Configure the behavior of encoder custom modes</p>
            <CustomEncoderContainer>
              <LabelText>CW</LabelText>
              <LabelText>CCW</LabelText>
              <LabelText>Press</LabelText>
            </CustomEncoderContainer>
            <EncoderCustomConfig
              title="Custom 0"
              encoderIdx={0}
              behaviors={encoderBehaviors[0]}
              onChange={this.onEncoderCustomConfigChange}
            />
            <EncoderCustomConfig
              title="Custom 1"
              encoderIdx={1}
              behaviors={encoderBehaviors[1]}
              onChange={this.onEncoderCustomConfigChange}
            />
            <EncoderCustomConfig
              title="Custom 2"
              encoderIdx={2}
              behaviors={encoderBehaviors[2]}
              onChange={this.onEncoderCustomConfigChange}
            />
          </SectionContainer>
        </MenuContainer>
      );
    }
    return null;
  }
}
