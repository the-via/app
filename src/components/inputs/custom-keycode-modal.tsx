import {useState} from 'react';
import styled from 'styled-components';
import {AccentButton, PrimaryAccentButton} from './accent-button';
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
  getKeycodeDict,
  getSelectedDefinition,
} from 'src/store/definitionsSlice';
import {
  ModalBackground,
  ModalContainer,
  PromptText,
  RowDiv,
} from './dialog-base';
import type {KeycodeDict} from 'src/utils/keycode-dict';

const AutocompleteContainer = styled.ul`
  position: fixed;
  background-color: var(--bg_menu);
  max-height: 210px;
  overflow: auto;
  border: 1px solid var(--bg_control);
  margin: 0;
  padding: 0;
  width: auto;
  margin-top: -24px;
  line-height: normal;
`;

const AutocompleteItemRow = styled.li`
  &:not(:last-child) {
    border-bottom: 1px solid var(--bg_control);
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
function inputIsBasicByte(input: string, keycodeDict: KeycodeDict): boolean {
  const keyCode = input.trim().toUpperCase();
  return keycodeDict.keycodes[keyCode] !== undefined;
}

function basicByteFromInput(input: string, keycodeDict: KeycodeDict): number {
  const keyCode = input.trim().toUpperCase();
  return keycodeDict.keycodes[keyCode].byte;
}

function inputIsAdvancedKeyCode(
  input: string,
  keycodeDict: KeycodeDict,
): boolean {
  const keyCode = input.trim().toUpperCase();
  return advancedStringToKeycode(keyCode, keycodeDict) !== 0;
}

function advancedKeyCodeFromInput(
  input: string,
  keycodeDict: KeycodeDict,
): number {
  const keyCode = input.trim().toUpperCase();
  return advancedStringToKeycode(keyCode, keycodeDict);
}

function inputIsHex(input: string): boolean {
  return isHex(input.trim());
}

function hexFromInput(input: string): number {
  const lowercased = input.toLowerCase();
  return parseInt(lowercased, 16);
}

function inputIsValid(input: string, keycodeDict: KeycodeDict): boolean {
  return (
    inputIsBasicByte(input, keycodeDict) ||
    inputIsAdvancedKeyCode(input, keycodeDict) ||
    inputIsHex(input)
  );
}

function keycodeFromInput(
  input: string,
  keycodeDict: KeycodeDict,
): number | null {
  if (inputIsBasicByte(input, keycodeDict)) {
    return basicByteFromInput(input, keycodeDict);
  }

  if (inputIsAdvancedKeyCode(input, keycodeDict)) {
    return advancedKeyCodeFromInput(input, keycodeDict);
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
export const KeycodeModal: React.FC<KeycodeModalProps> = (props) => {
  const selectedDefinition = useAppSelector(getSelectedDefinition);
  const keycodeDict = useAppSelector(getKeycodeDict);
  if (!selectedDefinition) {
    return null;
  }
  const supportedInputItems = getInputItems(
    getKeycodesForKeyboard(selectedDefinition),
  );
  const [inputItems, setInputItems] = useState(supportedInputItems);
  const defaultInput = anyKeycodeToString(
    props.defaultValue as number,
    keycodeDict,
  );

  const {
    getMenuProps,
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

  const isValid = inputIsValid(inputValue, keycodeDict);
  return (
    <ModalBackground>
      <ModalContainer>
        <PromptText>
          Please enter your desired QMK keycode or hex code:
        </PromptText>
        <div>
          <div>
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
                <AutocompleteItemRow
                  {...getItemProps({item, index})}
                  key={item.code}
                >
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
          <AccentButton onClick={props.onExit}>Cancel</AccentButton>
          <PrimaryAccentButton
            disabled={!isValid}
            onClick={() => {
              props.onConfirm(
                keycodeFromInput(inputValue as any, keycodeDict) as any,
              );
            }}
          >
            Confirm
          </PrimaryAccentButton>
        </RowDiv>
      </ModalContainer>
    </ModalBackground>
  );
};
