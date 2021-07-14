import * as React from 'react';
import styled from 'styled-components';
import {getKeycodeForByte} from '../utils/key';

type Props = {
  selectedKeycode: number;
};

type State = {
  keycode: string;
};

const Overlay = styled.div`
  position: absolute;
  font-size: 30px;
  text-align: center;
  background: black;
  color: #dddfe0;
  opacity: 0.8;
  bottom: 0;
  width: 100%;
  height: 50px;
  vertical-align: middle;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: translate3d(0, 50px, 0);
  transition: transform 0.2s ease-out;
  ${props => (props.selected ? 'transform: translate3d(0, 0, 0);' : '')}
`;

export class KeyOverlay extends React.Component<Props, State> {
  el: HTMLDivElement | null = null;

  constructor(props) {
    super(props);

    this.state = {
      keycode: null
    };
  }

  animateSuccess() {
    return (this.el as any).animate(
      [
        {background: 'black', easing: 'ease-out'},
        {background: '#98b79a', easing: 'ease-out'},
        {background: 'black', easing: 'ease-out'}
      ],
      {duration: 300}
    );
  }

  componentDidUpdate(prevProps) {
    const {selectedKeycode} = this.props;
    if (this.props.selectedKeycode === prevProps.selectedKeycode) {
      return;
    }

    if (!selectedKeycode) {
      const animation = this.animateSuccess();
      animation.onfinish = () =>
        this.setState({
          keycode: null
        });
    } else {
      const keycode = getKeycodeForByte(selectedKeycode);
      this.setState({
        keycode
      });
    }
  }

  render() {
    const {keycode} = this.state;
    return (
      <Overlay selected={keycode !== null} ref={el => (this.el = el)}>
        {keycode}
      </Overlay>
    );
  }
}
