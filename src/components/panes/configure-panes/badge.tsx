import React, {ButtonHTMLAttributes, useMemo, useState} from 'react';
import cntl from 'cntl';
import styled from 'styled-components';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faAngleDown, faPlus} from '@fortawesome/free-solid-svg-icons';
import {HID} from '../../../shims/node-hid';
import type {VIADefinitionV2, VIADefinitionV3} from 'via-reader';
import type {ConnectedDevice} from '../../../types/types';
import {useAppSelector} from 'src/store/hooks';
import {
  getDefinitions,
  getSelectedDefinition,
} from 'src/store/definitionsSlice';
import {useDispatch} from 'react-redux';
import {
  getConnectedDevices,
  getSelectedDevicePath,
} from 'src/store/devicesSlice';
import {selectConnectedDeviceByPath} from 'src/store/devicesThunks';
import OutlineButton from 'src/components/controls/OutlineButton';

interface BadgeButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

function BadgeButton(props: BadgeButtonProps) {
  return (
    <OutlineButton
      className="flex items-center uppercase font-bold tracking-wide text-sm"
      {...props}
    />
  );
}

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

type ConnectedKeyboardDefinition = [string, VIADefinitionV2 | VIADefinitionV3];

const KeyboardSelectors: React.VFC<{
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

export const Badge = () => {
  const dispatch = useDispatch();
  const definitions = useAppSelector(getDefinitions);
  const selectedDefinition = useAppSelector(getSelectedDefinition);
  const connectedDevices = useAppSelector(getConnectedDevices);
  const selectedPath = useAppSelector(getSelectedDevicePath);
  const [showList, setShowList] = useState(false);

  const connectedKeyboardDefinitions: ConnectedKeyboardDefinition[] = useMemo(
    () =>
      Object.entries(connectedDevices)
        .map<ConnectedKeyboardDefinition>(([path, device]) => [
          path,
          definitions[(device as ConnectedDevice).vendorProductId] &&
            definitions[(device as ConnectedDevice).vendorProductId][
              (device as ConnectedDevice).requiredDefinitionVersion
            ],
        ])
        .filter((i) => i[1]),
    [connectedDevices, definitions],
  );

  if (!selectedDefinition || !selectedPath) {
    return null;
  }

  return (
    <div className="relative mx-auto">
      <BadgeButton onClick={() => setShowList(!showList)}>
        <span>{selectedDefinition.name}</span>
        <FontAwesomeIcon
          icon={faAngleDown}
          className="ml-3"
          style={{
            transform: showList ? 'rotate(180deg)' : '',
            transition: 'transform 0.2s ease-out',
          }}
        />
      </BadgeButton>
      <KeyboardSelectors
        show={showList}
        selectedPath={selectedPath}
        keyboards={connectedKeyboardDefinitions}
        onClickOut={() => setShowList(false)}
        selectKeyboard={(path) => {
          dispatch(selectConnectedDeviceByPath(path));
          setShowList(false);
        }}
      />
    </div>
  );
};
