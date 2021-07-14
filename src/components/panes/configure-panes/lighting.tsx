import * as React from 'react';
import styled from 'styled-components';
import {OverflowCell, SubmenuCell, SubmenuRow} from '../grid';
import {CenterPane} from '../pane';
import {Component} from 'react';
import {
  updateCustomColor,
  getSelectedLightingData,
  updateBacklightValue,
  getSelectedDefinition
} from '../../../redux/modules/keymap';
import {connect} from 'react-redux';
import {RootState} from '../../redux';
import {bindActionCreators} from 'redux';
import {title, component} from '../../icons/lightbulb';
import {GeneralPane} from './submenus/lighting/general';
import {LayoutConfigValues, LayoutPane} from './submenus/lighting/layout';
import {
  AdvancedLightingValues,
  AdvancedPane
} from './submenus/lighting/advanced';
import {
  LightingValue,
  VIADefinitionV2,
  getLightingDefinition
} from 'via-reader';

export const Category = {
  General: {label: 'General', Menu: GeneralPane},
  Layout: {label: 'Layout', Menu: LayoutPane},
  Advanced: {label: 'Advanced', Menu: AdvancedPane}
};

type HIDColor = {
  hue: number;
  sat: number;
};

export type LightingData = {
  customColors?: HIDColor[];
};
const LightingPane = styled(CenterPane)`
  height: 100%;
  background: var(--color_dark_grey);
`;

const Container = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  padding: 0 12px;
`;

type OwnProps = {};

type ReduxProps = {
  lightingData: LightingData;
  selectedDefinition: VIADefinitionV2;
  updateBacklightValue: (command: LightingValue, ...args: number[]) => void;
  updateCustomColor: (num: number, hue: number, sat: number) => void;
};
type Props = ReduxProps & OwnProps;

type State = {
  selectedCategory: {label: string; Menu: (props: Props) => JSX.Element};
};

const MenuContainer = styled.div`
  padding: 15px 20px 20px 10px;
`;

export class LightingMenu extends Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      selectedCategory: Category.General
    };
  }

  renderSelectedCategory(category) {
    const {lightingData} = this.props;

    if (lightingData) {
      switch (category) {
        case Category.General:
          return <GeneralPane {...this.props} />;
      }
    }
    return null;
  }

  get menus() {
    const {selectedDefinition} = this.props;

    const hasLayouts = LayoutConfigValues.some(
      value =>
        getLightingDefinition(
          selectedDefinition.lighting
        ).supportedLightingValues.indexOf(value) !== -1
    );
    const hasAdvanced = AdvancedLightingValues.some(
      value =>
        getLightingDefinition(
          selectedDefinition.lighting
        ).supportedLightingValues.indexOf(value) !== -1
    );

    return [
      Category.General,
      ...(hasLayouts ? [Category.Layout] : []),
      ...(hasAdvanced ? [Category.Advanced] : [])
    ];
  }

  render() {
    const SelectedMenu = this.state.selectedCategory.Menu;
    return (
      <>
        <SubmenuCell>
          <MenuContainer>
            {this.menus.map(menu => (
              <SubmenuRow
                selected={this.state.selectedCategory === menu}
                onClick={_ => this.setState({selectedCategory: menu})}
                key={menu.label}
              >
                {menu.label}
              </SubmenuRow>
            ))}
          </MenuContainer>
        </SubmenuCell>
        <OverflowCell>
          <LightingPane>
            <Container>
              <SelectedMenu {...this.props} />
            </Container>
          </LightingPane>
        </OverflowCell>
      </>
    );
  }
}

const mapStateToProps = (state: RootState) => ({
  selectedDefinition: getSelectedDefinition(state.keymap),
  lightingData: getSelectedLightingData(state.keymap)
});

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      updateCustomColor,
      updateBacklightValue
    },
    dispatch
  );

export const Icon = component;
export const Title = title;
export const Pane = connect(mapStateToProps, mapDispatchToProps)(LightingMenu);
