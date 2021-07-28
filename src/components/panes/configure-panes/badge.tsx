import * as React from 'react';
import styled from 'styled-components';
import {
  getConnectedDevices,
  getSelectedDefinition,
  offsetKeyboard,
} from '../../../redux/modules/keymap';
import {actions} from '../../../redux/modules/keymap';
import type {RootState} from '../../../redux';
import {connect, MapDispatchToPropsFunction} from 'react-redux';
import LeftArrow from '../../icons/left-arrow';
import RightArrow from '../../icons/right-arrow';
import {bindActionCreators} from 'redux';

type OwnProps = {};

const mapStateToProps = (state: RootState) => ({
  selectedDefinition: getSelectedDefinition(state.keymap),
  connectedDevices: getConnectedDevices(state.keymap),
});

const mapDispatchToProps: MapDispatchToPropsFunction<
  any,
  ReturnType<typeof mapStateToProps>
> = (dispatch) =>
  bindActionCreators(
    {
      offsetKeyboard,
      setLayer: actions.setLayer,
    },
    dispatch,
  );

const Container = styled.div`
  position: absolute;
  right: 15px;
  top: 0px;
  font-size: 18px;
  overflow: hidden;
`;

const SlideContainer = styled.div<{showButtons?: boolean}>`
  transition: 0.4s ease-out;
  transform: translate3d(${(props) => (props.showButtons ? 0 : 66)}px, 0, 0);
`;

const KeyboardTitle = styled.label`
  display: inline-block;
  background: var(--color_accent);
  border-bottom-left-radius: 6px;
  border-bottom-right-radius: 6px;
  font-size: 18px;
  text-transform: uppercase;
  color: var(--color_light-grey);
  padding: 0 10px;
  margin-right: 10px;
`;

const IconButton = styled.button`
  border: 1px solid var(--color_dark-grey);
  outline: none;
  background: none;
  padding: 0 8px;
  vertical-align: top;
  border-top: none;
  cursor: pointer;
  height: 26px;
  color: var(--color-dark-grey);
  &:active {
    outline: none;
  }

  &:hover {
    background: var(--color_medium-grey);
  }
`;

const LeftIconButton = styled(IconButton)`
  border-bottom-left-radius: 6px;
`;

const RightIconButton = styled(IconButton)`
  margin-left: -1px;
  border-bottom-right-radius: 6px;
`;

type Props = OwnProps &
  ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

export class BadgeComponent extends React.Component<Props> {
  render() {
    const {connectedDevices, offsetKeyboard, selectedDefinition} = this.props;
    const showPrevNext = Object.values(connectedDevices).length > 1;

    return (
      <Container>
        <SlideContainer showButtons={showPrevNext}>
          <KeyboardTitle>{selectedDefinition.name}</KeyboardTitle>
          <LeftIconButton onClick={() => offsetKeyboard(-1)}>
            <LeftArrow />
          </LeftIconButton>
          <RightIconButton onClick={() => offsetKeyboard(1)}>
            <RightArrow />
          </RightIconButton>
        </SlideContainer>
      </Container>
    );
  }
}

export const Badge = connect(
  mapStateToProps,
  mapDispatchToProps,
)(BadgeComponent) as any;
