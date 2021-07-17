import * as React from 'react';
import styled from 'styled-components';
import basicKeyToByte from '../../utils/key-to-byte.json5';
import {
  advancedStringToKeycode,
  anyKeycodeToString
} from '../../utils/advanced-keys';

const NormalInput = styled.input`
  border: none;
  border-bottom: 1px solid var(--color_dark-grey);
  color: var(--color_accent);
  background: var(--color_light-jet);
  transition: all 0.4s ease-out;
  font-size: 18px;
  margin-bottom: 25px;
  height: 30px;
  padding: 0 5px;
  &:focus {
    outline: none;
    color: var(--color_accent);
    border-color: var(--color_accent);
  }
  &::placeholder {
    color: var(--color_dark-grey);
  }
`;

const ErrorInput = styled(NormalInput)`
  border-color: #d15e5e;
  color: #d15e5e;
`;

type Props = {
  defaultValue: number;
  onBlur: (newValue: number) => void;
  className?: string;
};

type State = {
  currentValue: string;
  currentParsed: number;
  defaultValueAsString: string;
  isError: boolean;
  lastDefault: number;
};

export class KeycodeTextInput extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    const {defaultValue} = props;
    let currentValue = anyKeycodeToString(defaultValue);
    this.state = {
      lastDefault: defaultValue,
      defaultValueAsString: currentValue,
      currentParsed: defaultValue,
      currentValue,
      isError: false
    };
  }

  // It's usually best to avoid this function, but we're actually using it properly
  // We want to maintain state here for validation purposes.
  // But if we get a new prop, it means our change has made it up to where it matters
  // And we should use it to represent what's actually coming from the kb
  static getDerivedStateFromProps(props, state) {
    if (
      state.lastDefault !== props.defaultValue &&
      state.currentParsed !== props.defaultValue
    ) {
      return {
        ...state,
        currentValue: anyKeycodeToString(props.defaultValue),
        currentParsed: props.defaultValue,
        lastDefault: props.defaultValue
      };
    }
    return state;
  }

  handleChange = (e): void => {
    const value = e.target.value;
    this.setState({currentValue: value});
  };

  handleBlur = (e): void => {
    const {onBlur} = this.props;
    const {lastDefault} = this.state;
    const value = e.target.value.trim().toUpperCase();
    const advancedParsed = advancedStringToKeycode(value);
    if (Object.keys(basicKeyToByte).includes(value)) {
      if (lastDefault !== basicKeyToByte[value]) {
        onBlur(basicKeyToByte[value]);
      }
      this.setState({isError: false});
    } else if (advancedParsed !== 0) {
      if (lastDefault !== advancedParsed) {
        onBlur(advancedParsed);
      }
      this.setState({isError: false});
    } else if (
      new RegExp(/^0x[0-9A-Fa-f]{1,4}$/g).test(e.target.value.trim())
    ) {
      onBlur(parseInt(e.target.value.trim(), 16));
      this.setState({isError: false});
    } else {
      this.setState({isError: true});
    }
  };

  render() {
    const {currentValue, isError} = this.state;
    const InputComponent = isError ? ErrorInput : NormalInput;
    return (
      <InputComponent
        type="text"
        placeholder={
          this.props.defaultValue
            ? this.state.defaultValueAsString
            : 'KC_NO, 0xFF, etc.'
        }
        value={currentValue}
        onChange={this.handleChange}
        onBlur={this.handleBlur}
        className={this.props.className}
      />
    );
  }
}

export default KeycodeTextInput;
