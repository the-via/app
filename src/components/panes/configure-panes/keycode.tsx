import * as React from 'react';
import {Component} from 'react';
import styled from 'styled-components';
import styles from '../../menus/keycode-menu.module.css';
import {Button} from '../../inputs/button';
import {KeycodeModal} from '../../inputs/custom-keycode-modal';
import {title, component} from '../../icons/keyboard';
import {
  keycodeInMaster,
  getByteForCode,
  getKeycodes,
  getOtherMenu,
  IKeycode,
  IKeycodeMenu,
} from '../../../utils/key';
import {ErrorMessage} from '../../styled';
import type {RootState} from '../../../redux';
import {connect, MapDispatchToPropsFunction} from 'react-redux';
import {saveMacros} from '../../../redux/modules/macros';
import {
  getSelectedKeymap,
  getSelectedDevice,
  getSelectedKey,
  getSelectedDefinition,
  getSelectedKeyDefinitions,
  updateKey,
  actions,
  getSelectedProtocol,
} from '../../../redux/modules/keymap';
import {bindActionCreators} from 'redux';
import {KeycodeType, getLightingDefinition} from 'via-reader';
import {OverflowCell, SubmenuOverflowCell, Row} from '../grid';
import {getNextKey} from '../../positioned-keyboard';
const KeycodeList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, 54px);
  grid-auto-rows: 54px;
  justify-content: center;
  grid-gap: 10px;
`;

const MenuContainer = styled.div`
  padding: 15px 20px 20px 10px;
`;

const SubmenuRow = styled(Row)`
  padding-left: 8px;
`;

const Keycode = styled(Button)`
  border-radius: 2px;
  width: 50px;
  height: 50px;
  line-height: 18px;
  font-size: 14px;
  box-shadow: none;
  background: var(--color_dark-grey);
  color: var(--color_light_grey);
  margin: 0;
`;

const CustomKeycode = styled(Button)`
  border-radius: 2px;
  width: 50px;
  height: 50px;
  line-height: 18px;
  font-size: 14px;
  box-shadow: none;
  background: var(--color_accent);
  border-color: var(--color_light-grey);
  color: var(--color_light_grey);
  margin: 0;
`;

const KeycodeContainer = styled.div`
  padding: 12px;
  padding-bottom: 30px;
`;

const KeycodeDesc = styled.div`
  position: fixed;
  bottom: 0;
  background: #d9d9d97a;
  box-sizing: border-box;
  transition: opacity 0.4s ease-out;
  height: 25px;
  width: 100%;
  line-height: 14px;
  padding: 5px;
  font-size: 14px;
  opacity: 1;
  &:empty {
    opacity: 0;
  }
`;

const Link = styled.a`
  font-size: 16x !important;
  color: var(--color_accent);
  text-decoration: underline;
`;

const KeycodeCategories = getKeycodes()
  .concat(getOtherMenu())
  .filter((menu) => !['Other', 'Mod+_'].includes(menu.label));

const maybeFilter = <M extends Function>(maybe: boolean, filter: M) =>
  maybe ? () => true : filter;

type OwnProps = {};

const mapStateToProps = ({keymap, macros, settings}: RootState) => ({
  selectedDefinition: getSelectedDefinition(keymap),
  displayedKeys: getSelectedKeyDefinitions(keymap),
  disableFastRemap: settings.disableFastRemap,
  selectedKeyboard: getSelectedDevice(keymap),
  selectedProtocol: getSelectedProtocol(keymap),
  selectedKey: getSelectedKey(keymap),
  matrixKeycodes: getSelectedKeymap(keymap),
  macros,
});

const mapDispatchToProps: MapDispatchToPropsFunction<
  any,
  ReturnType<typeof mapStateToProps>
> = (dispatch) =>
  bindActionCreators(
    {
      updateKey,
      updateSelectedKey: actions.updateSelectedKey,
      saveMacros: saveMacros,
      allowGlobalHotKeys: actions.allowGlobalHotKeys,
      disableGlobalHotKeys: actions.disableGlobalHotKeys,
    },
    dispatch,
  );

type Props = OwnProps &
  ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

type State = {
  selectedCategory: string;
  mouseOverDesc: string | null;
  barrelRoll: boolean;
  showKeyTextInputModal: boolean;
  textKeyValue: number;
};

class KeycodeMenuComponent extends Component<Props, State> {
  state = {
    selectedCategory: KeycodeCategories[0].label,
    mouseOverDesc: null,
    barrelRoll: false,
    showKeyTextInputModal: false,
    textKeyValue: 0,
  };

  doABarrelRoll = () => {
    this.setState((prevState) => ({
      ...prevState,
      barrelRoll: true,
    }));
  };

  get enabledMenus(): IKeycodeMenu[] {
    // TODO: type props
    const {selectedDefinition, selectedProtocol} = this.props;
    if (selectedProtocol >= 10) {
      return [];
    }
    const {lighting, customKeycodes} = selectedDefinition;
    const {keycodes} = getLightingDefinition(lighting);
    return KeycodeCategories.filter(
      maybeFilter(
        keycodes === KeycodeType.QMK,
        ({label}) => label !== 'QMK Lighting',
      ),
    )
      .filter(
        maybeFilter(
          keycodes === KeycodeType.WT,
          ({label}) => label !== 'Lighting',
        ),
      )
      .filter(
        maybeFilter(
          typeof customKeycodes !== 'undefined',
          ({label}) => label !== 'Custom',
        ),
      );
  }

  saveMacro = (id: number, macro: string) => {
    const {selectedKeyboard, macros, saveMacros} = this.props;
    const newMacros = (macros.expressions as string[]).map((oldMacro, i) =>
      i === id ? macro : oldMacro,
    );

    saveMacros(selectedKeyboard, newMacros);
  };

  renderMacroError() {
    return (
      <ErrorMessage>
        It looks like your current firmware doesn't support macros.{' '}
        <Link href="https://beta.docs.qmk.fm/newbs" target="_blank">
          How do I update my firmware?
        </Link>
      </ErrorMessage>
    );
  }

  componentWillUnmount() {
    this.props.updateSelectedKey(null);
  }

  renderCategories() {
    const {selectedCategory} = this.state;
    return (
      <MenuContainer>
        {this.enabledMenus.map(({label}) => (
          <SubmenuRow
            selected={label === selectedCategory}
            onClick={(_) => this.setState({selectedCategory: label})}
            key={label}
          >
            {label}
          </SubmenuRow>
        ))}
      </MenuContainer>
    );
  }

  renderKeyInputModal = () => {
    this.props.disableGlobalHotKeys();

    return (
      <KeycodeModal
        defaultValue={this.props.matrixKeycodes[this.props.selectedKey]}
        onChange={(value) => this.setState({textKeyValue: value})}
        onExit={() => {
          this.props.allowGlobalHotKeys();
          this.setState({showKeyTextInputModal: false});
        }}
        onConfirm={(keycode) => {
          this.props.allowGlobalHotKeys();
          this.updateKey(keycode);
          this.setState({showKeyTextInputModal: false});
        }}
      />
    );
  };

  updateKey = (value: number) => {
    const {
      disableFastRemap,
      displayedKeys,
      selectedKey,
      updateSelectedKey,
      updateKey,
    } = this.props;
    if (selectedKey !== null) {
      updateKey(selectedKey, value);
      updateSelectedKey(
        disableFastRemap ? null : getNextKey(selectedKey, displayedKeys),
      );
    }
  };

  handleClick(code: string, i: number) {
    if (code == 'text') {
      this.setState({showKeyTextInputModal: true});
    } else {
      return keycodeInMaster(code) && this.updateKey(getByteForCode(code));
    }
  }

  renderKeycode(keycode: IKeycode, index: number) {
    const {code, title, name} = keycode;
    return (
      <Keycode
        className={[
          !keycodeInMaster(code) && code != 'text' && styles.disabled,
          styles.keycode,
        ].join(' ')}
        key={code}
        onClick={() => this.handleClick(code, index)}
        onMouseOver={(_) => {
          this.setState({
            mouseOverDesc: title ? `${code}: ${title}` : code,
          });
        }}
        onMouseOut={(_) => this.setState({mouseOverDesc: null})}
      >
        <div className={styles.innerKeycode}>
          {this.state.barrelRoll && index < 11 ? (
            <img
              src={`../../../images/_${index}.gif`}
              style={{width: '100%'}}
            />
          ) : (
            name
          )}
        </div>
      </Keycode>
    );
  }

  renderCustomKeycode() {
    return (
      <CustomKeycode
        onClick={() =>
          this.props.selectedKey !== null && this.handleClick('text', 0)
        }
        onMouseOver={(_) => {
          this.setState({
            mouseOverDesc: `Enter any QMK Keycode`,
          });
        }}
        onMouseOut={(_) => this.setState({mouseOverDesc: null})}
      >
        Any
      </CustomKeycode>
    );
  }

  renderSelectedCategory(keycodes: IKeycode[], selectedCategory: string) {
    const keycodeListItems = keycodes.map((keycode, i) =>
      this.renderKeycode(keycode, i),
    );
    switch (selectedCategory) {
      case 'Macro': {
        return !this.props.macros.isFeatureSupported ? (
          this.renderMacroError()
        ) : (
          <KeycodeList>{keycodeListItems}</KeycodeList>
        );
      }
      case 'Special': {
        return (
          <KeycodeList>
            {keycodeListItems.concat(this.renderCustomKeycode())}
          </KeycodeList>
        );
      }
      case 'Custom': {
        const {customKeycodes} = this.props.selectedDefinition;
        return (
          <KeycodeList>
            {customKeycodes.map((keycode: IKeycode, idx: number) => {
              return this.renderKeycode(
                {
                  ...keycode,
                  code: `USER${idx.toLocaleString('en-US', {
                    minimumIntegerDigits: 2,
                    useGrouping: false,
                  })}`,
                },
                idx,
              );
            })}
          </KeycodeList>
        );
      }
      default: {
        return <KeycodeList>{keycodeListItems}</KeycodeList>;
      }
    }
  }

  render() {
    const {mouseOverDesc, showKeyTextInputModal} = this.state;
    const selectedCategoryKeycodes = KeycodeCategories.find(
      ({label}) => label === this.state.selectedCategory,
    )?.keycodes as IKeycode[];

    return (
      <>
        <SubmenuOverflowCell>{this.renderCategories()}</SubmenuOverflowCell>
        <OverflowCell>
          <KeycodeContainer>
            {this.renderSelectedCategory(
              selectedCategoryKeycodes,
              this.state.selectedCategory,
            )}
          </KeycodeContainer>
          <KeycodeDesc>{mouseOverDesc}</KeycodeDesc>
          {showKeyTextInputModal && this.renderKeyInputModal()}
        </OverflowCell>
      </>
    );
  }
}

export const Icon = component;
export const Title = title;
export const Pane = connect(
  mapStateToProps,
  mapDispatchToProps,
)(KeycodeMenuComponent);
