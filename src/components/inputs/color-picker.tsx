import React, {Component} from 'react';
import styled from 'styled-components';

import {getHSV, getHex} from '../../utils/color-math';

type Color = {
  hue: number;
  sat: number;
};

type Props = {
  isSelected?: boolean;
  color: Color;
  setColor: (hue: number, sat: number) => void;
};

const ColorInput = styled.input`
  display: inline-block;
  height: 30px;
  width: 30px;
  border-radius: 50%;
  border: 4px solid var(--border_color_cell);
  cursor: pointer;
  padding: 0;

  &:hover {
    opacity: 0.8;
  }

  &::-webkit-color-swatch-wrapper,
  &::-webkit-color-swatch {
    border: none;
    padding: 0;
  }
`;

export class ColorPicker extends Component<Props, State> {
  handleHexChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    let value = e.target.value;
    if (!value) {
      return;
    }
    const [h, s] = getHSV(value);
    this.props.setColor(Math.round(255 * (h / 360)), Math.round(255 * s));
  };

  render() {
    const color = getHex(this.props.color);
    const {isSelected = false} = this.props;
    return (
      <>
        <ColorInput
          type="color"
          value={color}
          onInput={this.handleHexChange}
          style={{
            borderColor: !isSelected
              ? 'var(--border_color_cell)'
              : 'var(--color_accent)',
          }}
        />
      </>
    );
  }
}

export const ArrayColorPicker: React.FC<{
  color: [number, number];
  setColor: Props['setColor'];
}> = (props) => {
  const {color, setColor} = props;
  return (
    <ColorPicker color={{hue: color[0], sat: color[1]}} setColor={setColor} />
  );
};
