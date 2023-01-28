import React from 'react';
import styled from 'styled-components';
import {ControlRow, Label, Detail} from '../../../grid';
import {AccentSlider} from '../../../../inputs/accent-slider';
import {ErrorMessage} from '../../../../styled';
import {AccentButton} from '../../../../inputs/accent-button';
import ReactTextareaAutocomplete from '@webscopeio/react-textarea-autocomplete';
import {
  AutocompleteItem,
  AutocompleteLoading,
  findKeycodes,
} from '../../../../../components/inputs/autocomplete-keycode';
import {getMacroValidator} from 'src/utils/macro-api';

const ToastErrorMessage = styled(ErrorMessage)`
  margin: 0;
  width: 100%;
  font-size: 14px;
  display: block;
  &:empty {
    display: none;
  }
`;
const Message = styled.div`
  color: var(--color_accent);
`;
const Link = styled.a`
  font-size: 18x !important;
  color: var(--color_accent);
  text-decoration: underline;
`;

const DescriptionLabel = styled(Label)`
  font-size: 14px;
  line-height: 18px;
  font-style: oblique;
  color: var(--color_dark-grey);
  padding-left: 5px;
`;

const AutoHeightRow = styled(ControlRow)`
  height: auto;
`;

const TextArea = styled.textarea`
  box-sizing: border-box;
  background: var(--color_jet);
  padding: 5px 10px;
  border-color: var(--color_medium-grey);
  color: var(--color_medium-grey);
  width: 100%;
  height: 200px;
  font-size: 16px;
  line-height: 18px;
  resize: none;
  font-family: 'Source Code Pro';
  font-weight: 500;
  &::placeholder {
    color: var(--color_dark-grey);
  }
  &:focus {
    color: var(--color_accent);
    outline-color: var(--color_accent);
  }
`;

type Props = {
  macroExpressions: string[];
  selectedMacro: number;
  saveMacros: (macro: string) => void;
  protocol: number;
};
export const MacroDetailPane: React.VFC<Props> = (props) => {
  const enterToken = '{KC_ENTER}';
  const currentMacro = props.macroExpressions[props.selectedMacro] || '';
  const textareaInitialValue = currentMacro
    .trimRight()
    .replace(new RegExp(`${enterToken}$`), '');
  const [currentValue, setCurrentValue] = React.useState(textareaInitialValue);
  const [appendEnter, setAppendEnter] = React.useState(
    currentMacro.trimRight().endsWith(enterToken),
  );
  const [errorMessage, setErrorMessage] = React.useState<string | undefined>(
    undefined,
  );
  const saveMacro = () => {
    const value = appendEnter ? currentValue + enterToken : currentValue;
    const validate = getMacroValidator(props.protocol);
    const validationResult = validate(value);
    if (validationResult.isValid) {
      props.saveMacros(value);
      setErrorMessage(undefined);
    } else {
      setErrorMessage(validationResult.errorMessage);
    }
  };
  const hasError = errorMessage !== undefined;
  return (
    <>
      <AutoHeightRow>
        <ReactTextareaAutocomplete
          value={currentValue}
          onChange={(e) => setCurrentValue(e.target.value)}
          loadingComponent={AutocompleteLoading}
          style={{
            fontSize: '16px',
            lineHeight: '18px',
            width: '100%',
            height: '140px',
            resize: 'none',
            borderColor: hasError ? '#d15e5e' : 'var(--color_medium-grey)',
          }}
          containerStyle={{
            border: 'none',
            lineHeight: '20px',
          }}
          itemStyle={{
            borderColor: 'var(--color_dark-grey)',
            backgroundColor: 'var(-color_light-jet)',
          }}
          dropdownStyle={{
            zIndex: 999,
            backgroundColor: 'var(--color_light-jet)',
          }}
          listStyle={{
            position: 'fixed',
            backgroundColor: 'var(--color_light-jet)',
            maxHeight: '210px',
            overflow: 'auto',
            border: '1px solid var(--color_dark-grey)',
          }}
          minChar={0}
          textAreaComponent={TextArea as any}
          movePopupAsYouType={true}
          placeholder={`Enter the macro you want M${props.selectedMacro} to execute...`}
          trigger={{
            '?': {
              dataProvider: findKeycodes,
              component: AutocompleteItem,
              output: (item: any) => ({
                text: item.code,
                caretPosition: 'end',
              }),
            },
            '{': {
              dataProvider: findKeycodes,
              component: AutocompleteItem,
              output: (item: any) => ({
                text: `{${item.code},`,
                caretPosition: 'end',
              }),
            },
            ',': {
              dataProvider: findKeycodes,
              component: AutocompleteItem,
              output: (item: any) => {
                return {
                  text: `,${item.code},`,
                  caretPosition: 'end',
                };
              },
            },
          }}
        />
      </AutoHeightRow>
      <AutoHeightRow>
        <DescriptionLabel>
          <ToastErrorMessage>{errorMessage}</ToastErrorMessage>
          <Message>
            Enter text directly, or wrap{' '}
            <Link href="https://docs.qmk.fm/#/keycodes_basic" target="_blank">
              Basic Keycodes
            </Link>{' '}
            in {'{}'}
          </Message>
          <Message>Single tap: {'{KC_XXX}'}</Message>
          <Message>Chord: {'{KC_XXX, KC_YYY, KC_ZZZ}'}</Message>
          {props.protocol >= 11 ? (
            <Message>Delay (ms): {'{NNNN}'} </Message>
          ) : (
            ''
          )}
          <Message>Type ? to search for keycodes</Message>
        </DescriptionLabel>
        <Detail>
          <AccentButton
            disabled={
              currentMacro ===
              (appendEnter ? currentValue + enterToken : currentValue)
            }
            onClick={saveMacro}
          >
            Save
          </AccentButton>
        </Detail>
      </AutoHeightRow>
      <ControlRow>
        <Label>Tap 'Enter' at end of macro</Label>
        <Detail>
          <AccentSlider isChecked={appendEnter} onChange={setAppendEnter} />
        </Detail>
      </ControlRow>
    </>
  );
};
