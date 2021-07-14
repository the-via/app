import * as React from 'react';
import styled from 'styled-components';
import {AccentButton} from './accent-button';

import {basicKeyToByte} from '../../utils/key';
import {anyKeycodeToString, advancedStringToKeycode} from '../../utils/advanced-keys';

import TextInput from './text-input';

const ModalBackground = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.75);
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ModalContainer = styled.div`
  width: 480px;
  height: 200px;
  background-color: var(--color_jet);
  border-radius: 2px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`;

const PromptText = styled.h4`
  font-weight: 500;
  color: var(--color_medium-grey);
  font-size: 20px;
  margin: 0 0 20px 0;
`;

const RowDiv = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 220px;
`;

type KeycodeModalProps = {
  defaultValue?: number;
  onChange: (number) => void;
  onExit: () => void;
  onConfirm: (keycode: number) => void;
};

function isHex(input: string): boolean {
  const lowercased = input.toLowerCase();
  const parsed = parseInt(lowercased, 16);
  return `0x${parsed.toString(16).toLowerCase()}` === lowercased;
}

// This is hella basic 💁‍♀️💁‍♂️
function inputIsBasicByte(input: string): boolean {
  const keyCode = input.trim().toUpperCase();
  return keyCode in basicKeyToByte;
}

function basicByteFromInput(input: string): number {
  const keyCode = input.trim().toUpperCase();
  return basicKeyToByte[keyCode];
}

function inputIsAdvancedKeyCode(input: string): boolean {
  const keyCode = input.trim().toUpperCase();
  return advancedStringToKeycode(keyCode) !== 0;
}

function advancedKeyCodeFromInput(input: string): number {
  const keyCode = input.trim().toUpperCase();
  return advancedStringToKeycode(keyCode);
}

function inputIsHex(input: string): boolean {
  return isHex(input.trim());
}

function hexFromInput(input: string): number {
  const lowercased = input.toLowerCase();
  return parseInt(lowercased, 16);
}

function inputIsValid(input: string): boolean {
  return (
    inputIsBasicByte(input) ||
    inputIsAdvancedKeyCode(input) ||
    inputIsHex(input)
  );
}

function keycodeFromInput(input: string): number {
  if (inputIsBasicByte(input)) {
    return basicByteFromInput(input);
  }

  if (inputIsAdvancedKeyCode(input)) {
    return advancedKeyCodeFromInput(input);
  }

  if (inputIsHex(input)) {
    return hexFromInput(input);
  }

  return null;
}

export const KeycodeModal: React.FC<KeycodeModalProps> = props => {
  const inputRef = React.useRef<HTMLInputElement>();
  const [isValid, setIsValid] = React.useState(false);
  const defaultInput = anyKeycodeToString(props.defaultValue);

  return (
    <ModalBackground>
      <ModalContainer>
        <PromptText>
          Please enter your desired QMK keycode or hex code:
        </PromptText>
        <TextInput
          defaultValue={defaultInput}
          ref={inputRef}
          type="text"
          placeholder={defaultInput || 'KC_NO, 0xFF, etc.'}
          onChange={() => {
            if (inputRef.current) {
              const isValid = inputIsValid(inputRef.current.value);
              setIsValid(isValid);
            }
          }}
        />
        <RowDiv>
          <AccentButton
            disabled={!isValid}
            onClick={() => {
              const input = inputRef.current.value;
              props.onConfirm(keycodeFromInput(input));
            }}
          >
            Confirm
          </AccentButton>
          <AccentButton onClick={props.onExit}>Cancel</AccentButton>
        </RowDiv>
      </ModalContainer>
    </ModalBackground>
  );
};

export default KeycodeModal;
