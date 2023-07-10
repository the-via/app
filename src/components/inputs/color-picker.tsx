import React, {Component, KeyboardEventHandler} from 'react';
import styled from 'styled-components';

import {
  toDegrees,
  calcRadialHue,
  calcRadialMagnitude,
  getHSV,
  getRGB,
  getHex,
} from '../../utils/color-math';

type Color = {
  hue: number;
  sat: number;
};

type Props = {
  isSelected?: boolean;
  color: Color;
  setColor: (hue: number, sat: number) => void;
  onOpen?: () => void;
  onMouseUp?: (hue: number, sat: number) => void;
  onClose?: (hue: number, sat: number) => void;
};

type State = {
  lensTransform: string;
  showPicker: boolean;
  offset: [number, number];
  hexColorCode: string;
};

const ColorPickerContainer = styled.div`
  display: flex;
  align-items: center;
`;

const ColorLens = styled.div`
  position: absolute;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid black;
  opacity: 0.7;
  background: rgba(255, 255, 255, 0.2);
  pointer-events: none;
  box-sizing: border-box;
  transform: translate3d(195px, 195px, 0);
`;
const ColorInner = styled.div`
  width: 100%;
  height: 100%;
  background: linear-gradient(to top, white, rgba(0, 0, 0, 0));
`;

const ColorOuter = styled.div`
  width: 100%;
  height: 100%;
  background: linear-gradient(
    to right,
    red,
    yellow,
    lime,
    aqua,
    blue,
    magenta,
    red
  );
`;

const ColorThumbnail = styled.div`
  display: inline-block;
  height: 25px;
  width: 25px;
  border-radius: 50%;
  border: 4px solid var(--border_color_cell);
  cursor: pointer;
  &:hover {
    opacity: 0.8;
  }
`;

const Container = styled.div`
  border: 4px solid var(--border_color_cell);
  width: 180px;
  height: 180px;
  position: relative;
`;

const PickerContainer = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  z-index: 1;
  box-shadow: rgba(0, 0, 0, 0.11) 0 1px 1px 1px;
  position: absolute;
  transform: translate3d(-205px, 50px, 0);

  &::after {
    content: '';
    position: absolute;
    width: 0px;
    height: 0px;
    border: 11px solid var(--border_color_cell);
    border-top-color: transparent;
    border-bottom-color: transparent;
    border-right-color: transparent;
    right: -22px;
    top: 66px;
  }
`;

const ColorPreview = styled.div`
  width: 180px;
  height: 24px;
  border: 4px solid var(--border_color_cell);
  border-bottom: none;
`;

const ColorHexContainer = styled.div`
  border: 4px solid var(--border_color_cell);
  border-bottom: none;
  width: 180px;
  height: 32px;
  line-height: 32px;
  text-align: center;
  background: var(--bg_menu);
`;

const ColorHexInput = styled.input`
  text-align: center;
  border: none;
  color: var(--color_accent);
  background: var(--bg_menu);
  font-size: 20px;
  font-weight: 300;
  padding: 0;
  width: 100%;
  &:focus {
    outline: none;
    color: var(--color_accent);
    border-color: var(--color_accent);
  }
`;

export class ColorPicker extends Component<Props, State> {
  ref: HTMLDivElement | null = null;
  refWidth: number = 0;
  refHeight: number = 0;
  mouseDown: boolean = false;

  state = {
    lensTransform: '',
    showPicker: false,
    offset: [5, 5] as [number, number],
    hexColorCode: getHex(this.props.color),
  };

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.onDocumentClick);
    document.removeEventListener('click', this.onDocumentClick);
  }

  componentDidUpdate({color}: {color: Color}, state: State) {
    if (
      this.ref &&
      this.state.showPicker &&
      (!state.showPicker || color !== this.props.color)
    ) {
      const {width, height} = this.ref.getBoundingClientRect();
      this.refWidth = width;
      this.refHeight = height;
      const {hue, sat} = this.props.color;
      const offsetX = (width * hue) / 255;
      const offsetY = height * (1 - sat / 255);
      const lensTransform = `translate3d(${offsetX - 5}px, ${
        offsetY - 5
      }px, 0)`;
      this.setState({lensTransform, offset: [offsetX, offsetY]});
    }
  }
  componentDidMount() {
    document.addEventListener('click', this.onDocumentClick);
    document.addEventListener('mousedown', this.onDocumentClick);
  }

  // For the color picker uses a conical gradient
  getRadialHueSat(evt: React.MouseEvent<Element>) {
    const {offsetX, offsetY} = evt.nativeEvent;
    const hue = toDegrees(calcRadialHue(offsetX, offsetY) ?? 0);
    const sat = Math.min(1, calcRadialMagnitude(offsetX, offsetY) ?? 0);
    return {hue, sat};
  }

  // For standard color picker uses a conical gradient
  getLinearHueSat([offsetX, offsetY]: [number, number]) {
    // calculate later
    const width = this.refWidth;
    const height = this.refHeight;
    const [x, y] = [Math.max(0, offsetX), Math.max(0, offsetY)];
    const hue = 360 * Math.min(1, x / width);
    const sat = 1 - Math.min(1, y / height);
    return {hue, sat};
  }

  onMouseMove: React.MouseEventHandler = (evt) => {
    if (this.mouseDown) {
      const {offsetX, offsetY} = evt.nativeEvent;
      const lensTransform = `translate3d(${offsetX - 5}px, ${
        offsetY - 5
      }px, 0)`;

      const offset = [offsetX, offsetY] as [number, number];
      const {hue, sat} = this.getLinearHueSat(offset);
      const hexColorCode = getHex(this.props.color);
      this.props.setColor(Math.round(255 * (hue / 360)), Math.round(255 * sat));
      this.setState({
        lensTransform,
        offset,
        hexColorCode,
      });
    }
  };

  onMouseDown: React.MouseEventHandler = (evt) => {
    this.mouseDown = true;
    this.onMouseMove(evt);
    if (this.ref) {
      this.ref.style.cursor = 'pointer';
    }
  };

  onMouseUp = () => {
    this.mouseDown = false;
    if (this.ref) {
      this.ref.style.cursor = 'auto';
    }
    if (this.props.onMouseUp) {
      const {hue, sat} = this.getLinearHueSat(this.state.offset);
      this.props.onMouseUp(hue, sat);
    }
  };

  onThumbnailClick = () => {
    if (this.props.onOpen) {
      this.props.onOpen();
    }
    this.setState({showPicker: true});
  };

  pickerContainer = React.createRef<HTMLDivElement>();
  colorThumbnail = React.createRef<HTMLDivElement>();

  onDocumentClick = (evt: MouseEvent) => {
    if (
      this.state.showPicker &&
      this.pickerContainer.current &&
      !this.pickerContainer.current.contains(evt.target as HTMLDivElement) &&
      this.colorThumbnail.current &&
      !this.colorThumbnail.current.contains(evt.target as HTMLDivElement) &&
      !this.mouseDown
    ) {
      if (this.props.onClose) {
        const {hue, sat} = this.getLinearHueSat(this.state.offset);
        this.props.onClose(hue, sat);
      }
      this.mouseDown = false;
      this.setState({
        showPicker: false,
        hexColorCode: getHex(this.props.color),
      });
    } else if (
      this.mouseDown &&
      this.state.showPicker &&
      this.pickerContainer.current &&
      !this.pickerContainer.current.contains(evt.target as HTMLDivElement) &&
      this.colorThumbnail.current &&
      !this.colorThumbnail.current.contains(evt.target as HTMLDivElement)
    ) {
      this.onMouseUp();
    }
  };

  handleHexChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    let value = e.target.value;
    value = value.replace(/[^A-Fa-f0-9]/g, '');
    if (value.length > 0 && value[0] !== '#') {
      value = `#${value}`;
    }
    if (value.length > 7) {
      value = value.substring(0, 7);
    }
    this.setState({hexColorCode: value});
  };

  handleHexBlur: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    this.setState({hexColorCode: getHex(this.props.color)});
  };

  handleHexSubmit: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Enter') {
      const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
      if (hexColorRegex.test(this.state.hexColorCode)) {
        var hexString = this.state.hexColorCode.replace('#', '');
        if (hexString.length == 3) {
          hexString = `${hexString
            .split('')
            .map((char) => char + char)
            .join('')}`;
        }
        const [h, s] = getHSV(hexString);
        this.props.setColor(Math.round(255 * (h / 360)), Math.round(255 * s));
      }
      this.setState({hexColorCode: getHex(this.props.color)});
    }
  };

  render() {
    const color = getRGB(this.props.color);
    const {isSelected = false} = this.props;
    const {offset} = this.state;

    const lensTransform = `translate3d(${offset[0] - 5}px, ${
      offset[1] - 5
    }px, 0)`;
    return (
      <>
        <ColorPickerContainer>
          <ColorThumbnail
            ref={this.colorThumbnail}
            onClick={this.onThumbnailClick}
            style={{
              background: color,
              borderColor: !isSelected
                ? 'var(--border_color_cell)'
                : 'var(--color_accent)',
            }}
          />
          {this.state.showPicker && (
            <PickerContainer
              ref={this.pickerContainer}
              onMouseUp={this.onMouseUp}
            >
              <ColorHexContainer>
                <ColorHexInput
                  type="text"
                  value={this.state.hexColorCode}
                  onChange={this.handleHexChange}
                  onBlur={this.handleHexBlur}
                  onKeyDown={this.handleHexSubmit}
                />
              </ColorHexContainer>
              <ColorPreview style={{background: getRGB(this.props.color)}} />
              <Container>
                <ColorOuter
                  onMouseDown={this.onMouseDown}
                  onMouseMove={this.onMouseMove}
                  ref={(ref: HTMLDivElement | null) => (this.ref = ref)}
                >
                  <ColorInner>
                    <ColorLens style={{transform: lensTransform}} />
                  </ColorInner>
                </ColorOuter>
              </Container>
            </PickerContainer>
          )}
        </ColorPickerContainer>
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
