import * as React from 'react';
import {Component} from 'react';
import styled from 'styled-components';
import {getMacroKeycodes} from '../utils/macro-api';
import {validateExpression} from '../utils/macro-api';
import ReactTextareaAutocomplete from '@webscopeio/react-textarea-autocomplete';
import Button from './inputs/button';
import {Row, Message, ErrorMessage} from './styled';

const MacroContainer = styled.div`
  overflow: hidden;
  min-height: calc(100vh - 450px);
  display: flex;
  flex-direction: column;
  color: #717070;
  padding: 24px;
  align-items: center;
`;

const MacroRow = styled(Row)`
  max-width: 700px;
  align-items: center;
`;

const Link = styled.a`
  font-size: 18x !important;
  color: var(--color_accent);
  text-decoration: underline;
`;

const SaveButton = styled(Button)`
  margin-left: 30px;
  flex: 1;
`;

const Keycode = styled.span`
  color: lightgrey;
`;

const AutocompleteItem = ({entity: {label, code}}: any) => (
  <div>
    {label} <Keycode>{code}</Keycode>
  </div>
);
const AutocompleteLoading = () => <div>Loading</div>;
const findKeycodes = (token: string) => {
  const uToken = token.toUpperCase();
  return getMacroKeycodes()
    .filter(({name, title, code}) =>
      title
        ? title.toUpperCase().indexOf(uToken) > -1
        : name.toUpperCase().indexOf(uToken) > -1 ||
          code.toUpperCase().indexOf(uToken) > -1,
    )
    .slice(0, 10)
    .map(({name, code, title}) => {
      const label = title ? title : name;
      return {label, code};
    });
};

const enterToken = '{KC_ENT}';

type Props = {
  unsupported: boolean;
  initialValue: string;
  onSaveMacro: (macro: string) => void;
  onBarrelRoll: () => void;
};

type State = {
  value: string;
  appendEnter: boolean;
  errorMessage?: string;
};

export class EditMacro extends Component<Props, State> {
  private textarea: HTMLTextAreaElement | undefined;

  constructor(props: Props) {
    super(props);

    const {initialValue} = this.props;

    this.state = {
      value:
        initialValue &&
        initialValue.trimRight().replace(new RegExp(`${enterToken}$`), ''),
      appendEnter: !!(
        initialValue && initialValue.trimRight().endsWith(enterToken)
      ),
      errorMessage: undefined,
    };
  }

  onChange: React.ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    this.setState({
      ...this.state,
      value: e.target.value,
    });
  };

  onAppendEnterChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    this.setState((prevState) => ({
      ...this.state,
      appendEnter: !prevState.appendEnter,
    }));
  };

  saveMacro = () => {
    if (this.textarea) {
      const value = this.state.appendEnter
        ? this.textarea.value + enterToken
        : this.textarea.value;
      const validationResult = validateExpression(value);
      if (validationResult.isValid) {
        this.props.onSaveMacro(value);
        this.setState((prevState, props) => ({
          ...prevState,
          errorMessage: undefined,
        }));
      } else {
        this.setState((prevState, props) => ({
          ...prevState,
          errorMessage: validationResult.errorMessage,
        }));
      }
      switch (this.textarea.value.trim().toLowerCase()) {
        case 'do a barrel roll':
          this.props.onBarrelRoll();
          break;
        case 'twilight zone':
          document.body.style.filter = 'invert(100%)';
          break;
      }
    }
  };

  render() {
    const {errorMessage, value} = this.state;
    return this.props.unsupported ? (
      <MacroContainer>
        <Row>
          <ErrorMessage>
            It looks like your current firmware doesn't support macros.{' '}
            <Link href="https://beta.docs.qmk.fm/newbs" target="_blank">
              How do I update my firmware?
            </Link>
          </ErrorMessage>
        </Row>
      </MacroContainer>
    ) : (
      <MacroContainer>
        <MacroRow>
          <ReactTextareaAutocomplete
            value={value}
            onChange={this.onChange}
            className="my-textarea"
            loadingComponent={AutocompleteLoading}
            style={{
              fontSize: '18px',
              lineHeight: '20px',
              width: '100%',
              height: '70px',
              resize: 'none',
            }}
            containerStyle={{
              flex: 11,
            }}
            dropdownStyle={{
              zIndex: 999,
            }}
            listStyle={{
              position: 'fixed',
            }}
            minChar={0}
            innerRef={(textarea: HTMLTextAreaElement) => {
              this.textarea = textarea;
            }}
            movePopupAsYouType={true}
            trigger={{
              '?': {
                dataProvider: findKeycodes,
                component: AutocompleteItem,
                output: (item, trigger) => ({
                  text: (item as any).code,
                  caretPosition: 'end',
                }),
              },
              '{': {
                dataProvider: findKeycodes,
                component: AutocompleteItem,
                output: (item, trigger) => ({
                  text: `{${(item as any).code}`,
                  caretPosition: 'end',
                }),
              },
            }}
          />

          <SaveButton onClick={() => this.saveMacro()}>Save</SaveButton>
        </MacroRow>
        <label>
          <input
            type="checkbox"
            onChange={this.onAppendEnterChange}
            defaultChecked={this.state.appendEnter}
          />
          Tap 'Enter' at end of macro
        </label>

        <ErrorMessage>{errorMessage}</ErrorMessage>
        <Message>
          Enter text directly, or wrap{' '}
          <Link
            href="https://beta.docs.qmk.fm/features/keycodes_basic"
            target="_blank"
          >
            Basic Keycodes
          </Link>{' '}
          in {'{}'}.
        </Message>
        <Message>
          Single tap: {'{KC_XXX}'}. Chord: {'{KC_XXX, KC_YYY, KC_ZZZ}'}.
        </Message>
        <Message>Type ? to search for keycodes.</Message>
      </MacroContainer>
    );
  }
}
