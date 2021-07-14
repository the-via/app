import * as React from 'react';
import {Component} from 'react';
const styles = require('./color.css');

import {
  getRGBPrime,
  toDegrees,
  calcRadialHue,
  calcRadialMagnitude
} from '../../utils/color-math';

type Color = {
  hue: number;
  sat: number;
};

type Props = {
  color: Color;
  setColor: (hue: number, sat: number) => void;
  label: string;
};

type State = {
  lensTransform: string;
};

export class ColorCategory extends Component<Props, State> {
  ref: HTMLDivElement | null;
  refWidth: number;
  refHeight: number;
  mouseDown: boolean;

  constructor(props) {
    super(props);
    this.state = {
      lensTransform: ''
    };
  }

  componentDidUpdate({color}) {
    if (color !== this.props.color) {
      const {width, height} = this.ref.getBoundingClientRect();
      this.refWidth = width;
      this.refHeight = height;
      const {hue, sat} = this.props.color;
      const offsetX = (width * hue) / 255;
      const offsetY = height * (1 - sat / 255);
      const lensTransform = `translate3d(${offsetX - 5}px, ${offsetY -
        5}px, 0)`;
      this.setState({lensTransform});
    }
  }

  componentDidMount() {
    const {width, height} = this.ref.getBoundingClientRect();
    this.refWidth = width;
    this.refHeight = height;
    const {hue, sat} = this.props.color;
    const offsetX = (width * hue) / 255;
    const offsetY = height * (1 - sat / 255);
    const lensTransform = `translate3d(${offsetX - 5}px, ${offsetY - 5}px, 0)`;
    this.setState({lensTransform});
  }

  // For the color picker uses a conical gradient
  getRadialHueSat(evt) {
    const {offsetX, offsetY} = evt.nativeEvent;
    const hue = toDegrees(calcRadialHue(offsetX, offsetY));
    const sat = Math.min(1, calcRadialMagnitude(offsetX, offsetY));
    return {hue, sat};
  }

  // For standard color picker uses a conical gradient
  getLinearHueSat(evt) {
    // calculate later
    const width = this.refWidth;
    const height = this.refHeight;
    const {offsetX, offsetY} = evt.nativeEvent;
    const [x, y] = [Math.max(0, offsetX), Math.max(0, offsetY)];
    const hue = 360 * Math.min(1, x / width);
    const sat = 1 - Math.min(1, y / height);
    return {hue, sat};
  }

  onMouseMove = evt => {
    if (this.mouseDown) {
      const {offsetX, offsetY} = evt.nativeEvent;
      const lensTransform = `translate3d(${offsetX - 5}px, ${offsetY -
        5}px, 0)`;

      const {hue, sat} = this.getLinearHueSat(evt);
      this.props.setColor(Math.round(255 * (hue / 360)), Math.round(255 * sat));
      this.setState({
        lensTransform
      });
    }
  };

  onMouseDown = evt => {
    this.mouseDown = true;
    this.onMouseMove(evt);
    this.ref.classList.add(styles.mouseDown);
  };

  onMouseUp = evt => {
    this.mouseDown = false;
    this.ref.classList.remove(styles.mouseDown);
  };

  getRGB({hue, sat}) {
    sat = sat / 255;
    hue = Math.round(360 * hue) / 255;
    const c = sat;
    const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
    const m = 1 - c;
    const [r, g, b] = getRGBPrime(hue, c, x).map(n =>
      Math.round(255 * (m + n))
    );
    return `rgba(${r},${g},${b},1)`;
  }

  render() {
    return (
      <div className={styles.colorCategoryContainer}>
        <div className={styles.label}>{this.props.label}</div>
        <div
          className={styles.colorCategory}
          onMouseUp={this.onMouseUp}
          style={{background: this.getRGB(this.props.color)}}
        >
          <div className={styles.container}>
            <div
              onMouseDown={this.onMouseDown}
              onMouseMove={this.onMouseMove}
              ref={ref => (this.ref = ref)}
              className={styles.outer}
            >
              <div className={styles.inner}>
                <div
                  className={styles.lens}
                  style={{transform: this.state.lensTransform}}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
