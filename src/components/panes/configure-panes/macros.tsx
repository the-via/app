import * as React from 'react';
import styled from 'styled-components';
import {OverflowCell, SubmenuOverflowCell, SubmenuRow} from '../grid';
import {CenterPane} from '../pane';
import {Component} from 'react';
import {getSelectedDevice} from '../../../redux/modules/keymap';
import {saveMacros} from '../../../redux/modules/macros';
import {connect} from 'react-redux';
import {RootState} from '../../../redux';
import {bindActionCreators} from 'redux';
import {title, component} from '../../icons/adjust';
import {MacroDetailPane} from './submenus/macros/macro-detail';

const MacroPane = styled(CenterPane)`
  height: 100%;
  background: var(--color_dark_grey);
`;

const Container = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  padding: 12px;
`;

type OwnProps = {};

type ReduxProps = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;
type Props = ReduxProps & OwnProps;

type State = {
  selectedMacro: number;
};

const MenuContainer = styled.div`
  padding: 15px 20px 20px 10px;
`;

export class MacroMenu extends Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      selectedMacro: 0
    };
  }

  saveMacro = (macro: string) => {
    const {selectedKeyboard, macros, saveMacros} = this.props;
    const newMacros = macros.expressions.map((oldMacro, i) =>
      i === this.state.selectedMacro ? macro : oldMacro
    );

    saveMacros(selectedKeyboard, newMacros);
  };

  render() {
    return (
      <>
        <SubmenuOverflowCell>
          <MenuContainer>
            {Array(16)
              .fill(0)
              .map((_, idx) => idx)
              .map(idx => (
                <SubmenuRow
                  selected={this.state.selectedMacro === idx}
                  onClick={_ => this.setState({selectedMacro: idx})}
                  key={idx}
                >
                  {`Macro ${idx}`}
                </SubmenuRow>
              ))}
          </MenuContainer>
        </SubmenuOverflowCell>
        <OverflowCell>
          <MacroPane>
            <Container>
              <MacroDetailPane
                {...this.props}
                selectedMacro={this.state.selectedMacro}
                saveMacros={this.saveMacro}
                key={this.state.selectedMacro}
              />
            </Container>
          </MacroPane>
        </OverflowCell>
      </>
    );
  }
}

const mapStateToProps = ({keymap, macros}: RootState) => ({
  selectedKeyboard: getSelectedDevice(keymap),
  macros
});

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      saveMacros: saveMacros
    },
    dispatch
  );

export const Icon = component;
export const Title = title;
export const Pane = connect(mapStateToProps, mapDispatchToProps)(MacroMenu);
