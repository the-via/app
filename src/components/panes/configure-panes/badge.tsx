import * as React from 'react';
import styled from 'styled-components';
import {
  actions,
  selectConnectedDeviceByPath,
  getConnectedDevices,
  getDefinitions,
  getSelectedDefinition,
  getSelectedDevicePath,
  offsetKeyboard,
} from '../../../redux/modules/keymap';
import type {RootState} from '../../../redux';
import {connect, MapDispatchToPropsFunction} from 'react-redux';
import {bindActionCreators} from 'redux';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faAngleDown, faPlus} from '@fortawesome/free-solid-svg-icons';
import {HID} from '../../../shims/node-hid';
import type {VIADefinitionV2, VIADefinitionV3} from 'via-reader';
import type {ConnectedDevice} from 'src/types/types';

type OwnProps = {};

const mapStateToProps = (state: RootState) => ({
  selectedDefinition: getSelectedDefinition(state.keymap),
  connectedDevices: getConnectedDevices(state.keymap),
  definitions: getDefinitions(state.keymap),
  selectedPath: getSelectedDevicePath(state.keymap),
});

const mapDispatchToProps: MapDispatchToPropsFunction<
  any,
  ReturnType<typeof mapStateToProps>
> = (dispatch) =>
  bindActionCreators(
    {
      offsetKeyboard,
      setLayer: actions.setLayer,
      selectConnectedDeviceByPath,
    },
    dispatch,
  );

const Container = styled.div`
  position: absolute;
  right: 15px;
  top: 0px;
  font-size: 18px;
  pointer-events: none;
`;

const SlideContainer = styled.div<{showButtons?: boolean}>`
  transition: 0.4s ease-out;
  transform: translate3d(${(props) => (props.showButtons ? 0 : 66)}px, 0, 0);
`;

const KeyboardTitle = styled.label`
  pointer-events: all;
  display: inline-block;
  background: var(--color_accent);
  border-bottom-left-radius: 6px;
  border-bottom-right-radius: 6px;
  font-size: 18px;
  text-transform: uppercase;
  color: var(--color_light-grey);
  padding: 1px 10px;
  margin-right: 10px;
  border: solid 1px var(--color_dark-grey);
  border-top: none;
  cursor: pointer;
  &:hover {
    background: var(--color_dark-accent);
  }
`;
const KeyboardList = styled.ul<{show: boolean}>`
  padding: 0;
  border: 1px solid var(--color_dark-grey);
  width: 160px;
  border-radius: 6px;
  background-color: var(--color_light-jet);
  margin: 0;
  margin-top: 5px;
  right: 10px;
  position: absolute;
  pointer-events: ${(props) => (props.show ? 'all' : 'none')};
  transition: all 0.2s ease-out;
  opacity: ${(props) => (props.show ? 1 : 0)};
  overflow: hidden;
  transform: ${(props) => (props.show ? 0 : `translateY(-5px)`)};
`;
const KeyboardButton = styled.button<{selected?: boolean}>`
  display: block;
  text-align: center;
  outline: none;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
  border: none;
  background: ${(props) =>
    props.selected ? 'var(--color_light-grey)' : 'transparent'};
  color: ${(props) =>
    props.selected ? 'var(--color_jet)' : 'var(--color_light-grey)'};
  cursor: pointer;
  text-align: left;
  font-size: 14px;
  text-transform: uppercase;
  padding: 5px 10px;
  &:hover {
    border: none;
    background: ${(props) =>
      props.selected ? 'var(--color_light-grey)' : 'var(--color_dark-grey)'};
    color: ${(props) =>
      props.selected ? 'var(--color_jet)' : 'var(--color_light-grey)'};
  }
`;

const ClickCover = styled.div`
  position: fixed;
  pointer-events: all;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0.4;
  background: var(--color_jet);
`;

type Props = OwnProps &
  ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

type ConnectedKeyboardDefinition = [string, VIADefinitionV2 | VIADefinitionV3];

const KeyboardSelectors: React.FC<{
  show: boolean;
  keyboards: ConnectedKeyboardDefinition[];
  selectedPath: string;
  onClickOut: () => void;
  selectKeyboard: (kb: string) => void;
}> = (props) => {
  const requestAndChangeDevice = async () => {
    const device = await HID.requestDevice();
    if (device) {
      props.selectKeyboard((device as any).__path);
    }
  };
  return (
    <>
      {props.show && <ClickCover onClick={props.onClickOut} />}
      <KeyboardList show={props.show}>
        {props.keyboards.map(([path, keyboard]) => {
          return (
            <KeyboardButton
              selected={path === props.selectedPath}
              key={path}
              onClick={() => props.selectKeyboard(path as string)}
            >
              {keyboard.name}
            </KeyboardButton>
          );
        })}
        <KeyboardButton onClick={requestAndChangeDevice}>
          Authorize New
          <FontAwesomeIcon icon={faPlus} style={{marginLeft: '10px'}} />
        </KeyboardButton>
      </KeyboardList>
    </>
  );
};

export const BadgeComponent: React.FC<Props> = (props) => {
  const {
    connectedDevices,
    definitions,
    selectedDefinition,
    selectConnectedDeviceByPath,
    selectedPath,
  } = props;
  const [showList, setShowList] = React.useState(false);

  const connectedKeyboardDefinitions: ConnectedKeyboardDefinition[] =
    React.useMemo(
      () =>
        Object.entries(connectedDevices).map(([path, device]) => [
          path,
          definitions[(device as ConnectedDevice).vendorProductId][
            (device as ConnectedDevice).requiredDefinitionVersion
          ],
        ]),
      [connectedDevices, definitions],
    );

  return (
    <>
      <Container>
        <KeyboardTitle onClick={() => setShowList(!showList)}>
          {selectedDefinition.name}
          <FontAwesomeIcon
            icon={faAngleDown}
            style={{
              transform: showList ? 'rotate(180deg)' : '',
              transition: 'transform 0.2s ease-out',
              marginLeft: '5px',
            }}
          />
        </KeyboardTitle>
        <KeyboardSelectors
          show={showList}
          selectedPath={selectedPath}
          keyboards={connectedKeyboardDefinitions}
          onClickOut={() => setShowList(false)}
          selectKeyboard={(path) => {
            selectConnectedDeviceByPath(path);
            setShowList(false);
          }}
        />
      </Container>
    </>
  );
};

export const Badge = connect(
  mapStateToProps,
  mapDispatchToProps,
)(BadgeComponent) as any;
