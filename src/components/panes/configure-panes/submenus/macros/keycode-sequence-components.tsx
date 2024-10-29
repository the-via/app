import {faPlus} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import React, {ChangeEvent, PropsWithChildren, useRef} from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import {IKeycode} from 'src/utils/key';
import {
  OptimizedKeycodeSequenceItem,
  RawKeycodeSequenceAction,
} from 'src/utils/macro-api/types';
import styled from 'styled-components';

const CharacterStreamContainer = styled.div`
  border: 2px solid var(--bg_control);
  transition: border-color 0.2s ease-in-out;
  margin: 15px 0px;
  display: inline-block;
  &:focus-within {
    border-color: var(--color_accent);
  }
  border-radius: 4px;
  font-size: 16px;
`;

const KeycodeSequenceLabel = styled.div`
  display: inline-flex;
  user-select: none;
  color: #717070;
  padding: 6px 4px;
  text-overflow: ellipsis;
  min-width: 30px;
  font-size: 12px;
  text-align: center;
  border-radius: 4px;
  justify-content: center;
  align-items: center;
  white-space: pre-wrap;
  font-size: 16px;
  border: 2px solid var(--border_color_icon);
  background: var(--bg_control);
  color: var(--color_label-highlighted);
  margin: 0;
  box-shadow: none;
  position: relative;
  border-radius: 2px;
  white-space: nowrap;
  position: relative;
  margin: 15px 0px;
`;
export const KeycodeDownLabel = styled(KeycodeSequenceLabel)`
  &::after {
    border-style: solid;
    border-color: transparent;
    content: '';
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-top: 6px solid var(--color_accent);
    position: absolute;
    margin-top: 55px;
    width: 0;
  }
`;

export const SequenceLabelSeparator = styled.div`
  width: 20px;
  display: inline-flex;
  vertical-align: middle;
  border: 1px solid var(--color_accent);
`;

export const CharacterStreamLabel = styled(KeycodeSequenceLabel)`
  border-color: var(--border_color_cell);
  background: var(--bg_menu);
  white-space: pre-wrap;
  min-height: 1.25em;
  letter-spacing: 2px;
`;

export const KeycodePressLabel = styled(KeycodeSequenceLabel)`
  border-color: var(--color_accent);
`;

export const KeycodeUpLabel = styled(KeycodeSequenceLabel)`
  &::after {
    content: '';
    border-style: solid;
    margin-top: -55px;
    border-color: transparent;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-bottom: 6px solid var(--color_accent);
    position: absolute;
    width: 0;
  }
`;

export const KeycodeSequenceWait = styled.div`
  display: inline-flex;
  font-weight: bold;
  user-select: none;
  color: #717070;
  text-overflow: ellipsis;
  min-width: 30px;
  text-align: center;
  justify-content: center;
  align-items: center;
  white-space: pre-wrap;
  font-size: 16px;
  color: var(--color_label-highlighted);
  box-shadow: none;
  position: relative;
  white-space: nowrap;
  position: relative;
  margin: 15px 0px;
  box-sizing: border-box;
  border: 2px solid;
  padding: 4px 4px;
  border-color: var(--color_accent);
  border-radius: 2px;
`;
export const NumberInput = styled.input.attrs({
  type: 'number',
  placeholder: 'XXXXX',
})`
  appearance: none;
  background: none;
  border: none;
  border-bottom: 1px solid;
  color: var(--color_label);
  width: 45px;
  text-align: center;
  font-family: inherit;
  font-size: inherit;
  color: var(--color_label-highlighted);
  margin: 0 5px 0 0;
  &:focus {
    color: var(--color_accent);
  }
  &::-webkit-inner-spin-button {
    appearance: none;
    display: none;
  }
  &:invalid {
    color: red;
  }
  &:placeholder-shown {
    color: red;
  }
`;

export const WaitInput: React.FC<{
  value: number | string;
  index: number;
  updateValue: (id: number, wait: number) => void;
}> = (props) => {
  const inputRef = useRef(null);
  const onBeforeInput = (evt: InputEvent) => {
    if (!evt.data || !/^\d$/.test(evt.data)) {
      evt.preventDefault();
    }
  };
  const onChange = (evt: ChangeEvent<HTMLInputElement>) => {
    if (+evt.target.value > 0 && +evt.target.value < 100000) {
      // Update external value
      props.updateValue(props.index, +evt.target.value);
    }
  };

  return (
    <KeycodeSequenceWait>
      <NumberInput
        ref={inputRef}
        onBeforeInput={onBeforeInput as any}
        value={props.value}
        onChange={onChange}
      />
      ms
    </KeycodeSequenceWait>
  );
};

export const getSequenceItemComponent = (
  action: OptimizedKeycodeSequenceItem[0],
) =>
  action === RawKeycodeSequenceAction.Down
    ? KeycodeDownLabel
    : action === RawKeycodeSequenceAction.Up
      ? KeycodeUpLabel
      : action === RawKeycodeSequenceAction.CharacterStream
        ? CharacterStreamLabel
        : KeycodePressLabel;

function capitalize(string: string) {
  return string[0].toUpperCase() + string.slice(1);
}

export const getSequenceLabel = (keycode: IKeycode) => {
  const label = keycode?.keys ?? keycode?.shortName ?? keycode?.name ?? '';
  return label.length > 1 ? capitalize(label) : label;
};
