import React, {useState, VFC} from 'react';
import styled from 'styled-components';
import {AccentButton} from './accent-button';
import {AutocompleteItem} from './autocomplete-keycode';
import {
  anyKeycodeToString,
  advancedStringToKeycode,
} from '../../utils/advanced-keys';
import {useCombobox} from 'downshift';
import TextInput from './text-input';
import {getKeycodesForKeyboard, IKeycode} from '../../utils/key';
import {useAppSelector} from 'src/store/hooks';
import {
  getBasicKeyToByte,
  getSelectedDefinition,
} from 'src/store/definitionsSlice';

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
  z-index: 2;
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

const AutocompleteContainer = styled.li`
  position: fixed;
  background-color: var(--color_light-jet);
  max-height: 210px;
  overflow: auto;
  border: 1px solid var(--color_dark-grey);
  margin: 0;
  padding: 0;
  width: auto;
  margin-top: -24px;
  line-height: normal;
`;

const AutocompleteItemRow = styled.li`
  &:not(:last-child) {
    border-bottom: 1px solid var(--color_dark-grey);
  }
`;

type KeycodeModalProps = {
  defaultValue?: number;
  onChange?: (val: number) => void;
  onExit: () => void;
  onConfirm: (keycode: number) => void;
};

function isHex(input: string): boolean {
  const lowercased = input.toLowerCase();
  const parsed = parseInt(lowercased, 16);
  return `0x${parsed.toString(16).toLowerCase()}` === lowercased;
}

// This is hella basic 💁‍♀️💁‍♂️
function inputIsBasicByte(
  input: string,
  basicKeyToByte: Record<string, number>,
): boolean {
  const keyCode = input.trim().toUpperCase();
  return keyCode in basicKeyToByte;
}

function basicByteFromInput(
  input: string,
  basicKeyToByte: Record<string, number>,
): number {
  const keyCode = input.trim().toUpperCase();
  return basicKeyToByte[keyCode];
}

function inputIsAdvancedKeyCode(
  input: string,
  basicKeyToByte: Record<string, number>,
): boolean {
  const keyCode = input.trim().toUpperCase();
  return advancedStringToKeycode(keyCode, basicKeyToByte) !== 0;
}

function advancedKeyCodeFromInput(
  input: string,
  basicKeyToByte: Record<string, number>,
): number {
  const keyCode = input.trim().toUpperCase();
  return advancedStringToKeycode(keyCode, basicKeyToByte);
}

function inputIsHex(input: string): boolean {
  return isHex(input.trim());
}

function hexFromInput(input: string): number {
  const lowercased = input.toLowerCase();
  return parseInt(lowercased, 16);
}

function inputIsValid(
  input: string,
  basicKeyToByte: Record<string, number>,
): boolean {
  return (
    inputIsBasicByte(input, basicKeyToByte) ||
    inputIsAdvancedKeyCode(input, basicKeyToByte) ||
    inputIsHex(input)
  );
}

function keycodeFromInput(
  input: string,
  basicKeyToByte: Record<string, number>,
): number | null {
  if (inputIsBasicByte(input, basicKeyToByte)) {
    return basicByteFromInput(input, basicKeyToByte);
  }

  if (inputIsAdvancedKeyCode(input, basicKeyToByte)) {
    return advancedKeyCodeFromInput(input, basicKeyToByte);
  }

  if (inputIsHex(input)) {
    return hexFromInput(input);
  }

  return null;
}

const getInputItems = (arr: IKeycode[]) =>
  arr.map((k) => ({
    code: k.code,
    label: k.title ?? k.name,
  }));

// Connect component with redux here:
export const KeycodeModal: VFC<KeycodeModalProps> = (props) => {
  const selectedDefinition = useAppSelector(getSelectedDefinition);
  const {basicKeyToByte, byteToKey} = useAppSelector(getBasicKeyToByte);
  if (!selectedDefinition) {
    return null;
  }
  const supportedInputItems = getInputItems(
    getKeycodesForKeyboard(selectedDefinition),
  );
  const [inputItems, setInputItems] = useState(supportedInputItems);
  const defaultInput = anyKeycodeToString(
    props.defaultValue as number,
    basicKeyToByte,
    byteToKey,
  );

  const {
    getMenuProps,
    getComboboxProps,
    getInputProps,
    highlightedIndex,
    inputValue,
    getItemProps,
    isOpen,
  } = useCombobox({
    items: inputItems,
    initialIsOpen: defaultInput === '',
    defaultInputValue: defaultInput,
    itemToString: (item) => item?.code ?? '',
    onInputValueChange: ({inputValue}) => {
      setInputItems(
        supportedInputItems.filter(({label, code}) =>
          [label, code]
            .flatMap((s) => s.split(/\s+/))
            .map((s) => s.toLowerCase())
            .some((s) => s.startsWith((inputValue ?? '').toLowerCase())),
        ),
      );
    },
  });

  const isValid = inputIsValid(inputValue, basicKeyToByte);
  return (
    <ModalBackground>
      <ModalContainer>
        <PromptText>
          Please enter your desired QMK keycode or hex code:
        </PromptText>
        <div>
          <div {...getComboboxProps()}>
            <TextInput
              {...getInputProps()}
              type="text"
              placeholder={defaultInput || 'KC_NO, 0xFF, etc.'}
            />
          </div>
          <AutocompleteContainer
            {...getMenuProps()}
            style={{
              display: isOpen && inputItems.length ? 'block' : 'none',
            }}
          >
            {isOpen &&
              inputItems.map((item, index) => (
                <AutocompleteItemRow {...getItemProps({item, index})}>
                  <AutocompleteItem
                    selected={highlightedIndex === index}
                    entity={item}
                    key={item.code}
                  />
                </AutocompleteItemRow>
              ))}
          </AutocompleteContainer>
        </div>
        <RowDiv>
          <AccentButton
            disabled={!isValid}
            onClick={() => {
              props.onConfirm(
                keycodeFromInput(inputValue as any, basicKeyToByte) as any,
              );
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
