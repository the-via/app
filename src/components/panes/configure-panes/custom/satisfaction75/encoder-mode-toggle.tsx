import React from 'react';
import styled from 'styled-components';

const MODES = {
  ENC_MODE_VOLUME: 0,
  ENC_MODE_MEDIA: 1,
  ENC_MODE_SCROLL: 2,
  ENC_MODE_BRIGHTNESS: 3,
  ENC_MODE_BACKLIGHT: 4,
  ENC_MODE_CUSTOM0: 5,
  ENC_MODE_CUSTOM1: 6,
  ENC_MODE_CUSTOM2: 7,
};

const MODE_LABELS = {
  ENC_MODE_VOLUME: 'Volume',
  ENC_MODE_MEDIA: 'Media',
  ENC_MODE_SCROLL: 'Scroll',
  ENC_MODE_BRIGHTNESS: 'Brightness',
  ENC_MODE_BACKLIGHT: 'Backlight',
  ENC_MODE_CUSTOM0: 'Custom 0',
  ENC_MODE_CUSTOM1: 'Custom 1',
  ENC_MODE_CUSTOM2: 'Custom 2',
};

const CenteredColumnDiv = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ColumnDiv = styled.div`
  display: flex;
  flex-direction: column;
`;

type Props = {
  enabledModes: number;
  onChange: (value: number) => void;
};

export class EncoderModeToggle extends React.Component<Props> {
  handleInputChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const {enabledModes, onChange} = this.props;
    const {
      target: {checked: value, name},
    } = event;
    /* eslint-disable no-bitwise */
    const flagBit = 1 << MODES[name as keyof typeof MODES];
    const newEnabledModes = value
      ? enabledModes | flagBit
      : enabledModes & ~flagBit;
    /* eslint-enable no-bitwise */
    onChange(newEnabledModes);
  };

  isChecked = (modeIdx: number): boolean =>
    ((1 << modeIdx) & this.props.enabledModes) > 0; // eslint-disable-line no-bitwise

  render() {
    return (
      <CenteredColumnDiv>
        <h3>Enabled Encoder Modes:</h3>
        <p>Only the selected encoder modes will be available on the keyboard</p>
        <ColumnDiv>
          {Object.entries(MODES).map(([key, value]) => (
            <label
              key={value}
              htmlFor={MODE_LABELS[key as keyof typeof MODE_LABELS]}
            >
              <input
                name={key}
                id={MODE_LABELS[key as keyof typeof MODE_LABELS]}
                type="checkbox"
                checked={this.isChecked(value)}
                onChange={this.handleInputChange}
                key={value}
              />
              {MODE_LABELS[key as keyof typeof MODE_LABELS]}
            </label>
          ))}
        </ColumnDiv>
      </CenteredColumnDiv>
    );
  }
}

export default EncoderModeToggle;
