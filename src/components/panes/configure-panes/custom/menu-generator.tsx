import * as React from 'react';
import styled from 'styled-components';
import {OverflowCell, SubmenuCell, SubmenuRow} from '../../grid';
import {CenterPane} from '../../pane';
import {Component} from 'react';
import {
  getSelectedDefinition,
  getSelectedCustomMenuData,
  updateCustomMenuValue
} from '../../../../redux/modules/keymap';
import {connect} from 'react-redux';
import {RootState} from '../../../../redux';
import {bindActionCreators} from 'redux';
import {title, component} from '../../../icons/lightbulb';
import {VIACustomItem} from './custom-control';
import CustomIcon from './icon';
import {evalExpr} from 'pelpi';
import {
  VIADefinitionV2,
  VIAMenu,
  VIASubmenu,
  VIASubmenuSlice,
  VIAItem,
  VIAItemSlice
} from 'via-reader';

type Category = {
  label: string;
  Menu: React.FC;
};

const CustomPane = styled(CenterPane)`
  height: 100%;
  background: var(--color_dark_grey);
`;

const Container = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  padding: 0 12px;
`;

type OwnProps = {
  viaMenu: VIAMenu;
};

type ReduxProps = {
  selectedDefinition: VIADefinitionV2;
};
type Props = ReduxProps & OwnProps;

type State = {
  selectedCategory: Category | null;
};

function isItem(
  elem: VIAMenu | VIAItem | VIAItemSlice | VIASubmenu | VIASubmenuSlice
): boolean {
  return 'type' in elem;
}

function isSlice(
  elem: VIAMenu | VIAItem | VIAItemSlice | VIASubmenu | VIASubmenuSlice
): boolean {
  return !('label' in elem);
}

export function categoryGenerator(props): Category[] {
  return props.viaMenu.content.flatMap(menu => submenuGenerator(menu, props));
}

function itemGenerator(elem: TagWithId<VIAItem, VIAItemSlice>, props: any) {
  if (
    'showIf' in elem &&
    !evalExpr(elem.showIf, props.selectedCustomMenuData)
  ) {
    return [];
  }
  if ('label' in elem) {
    return {...elem, key: elem._id};
  } else {
    return elem.content.flatMap(e =>
      itemGenerator(e as TagWithId<VIAItem, VIAItemSlice>, props)
    );
  }
}

const MenuComponent = React.memo((props: any) => (
  <>
    {props.elem.content
      .flatMap(elem => itemGenerator(elem, props))
      .map(itemProps => (
        <VIACustomItem
          {...itemProps}
          updateValue={props.updateCustomMenuValue}
          value={props.selectedCustomMenuData[itemProps.content[0]]}
        />
      ))}
  </>
));

const MenuBuilder = elem => props => (
  <MenuComponent {...props} key={elem._id} elem={elem} />
);

function submenuGenerator(
  elem: TagWithId<VIASubmenu, VIASubmenuSlice>,
  props: any
) {
  if (
    'showIf' in elem &&
    !evalExpr(elem.showIf, props.selectedCustomMenuData)
  ) {
    return [];
  }
  if ('label' in elem) {
    return {
      label: elem.label,
      Menu: MenuBuilder(elem)
    };
  } else {
    return elem.content.flatMap(e =>
      submenuGenerator(e as TagWithId<VIASubmenu, VIASubmenuSlice>, props)
    );
  }
}

export class CustomMenu extends Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      selectedCategory: null
    };
  }

  get menus() {
    return categoryGenerator(this.props);
  }

  render() {
    const selectedCategory = this.state.selectedCategory ||
      this.menus[0] || {label: '', Menu: () => <div />};
    const SelectedMenu = selectedCategory.Menu;
    return (
      <>
        <SubmenuCell>
          <MenuContainer>
            {this.menus.map(menu => (
              <SubmenuRow
                selected={selectedCategory.label === menu.label}
                onClick={_ => this.setState({selectedCategory: menu})}
                key={menu.label}
              >
                {menu.label}
              </SubmenuRow>
            ))}
          </MenuContainer>
        </SubmenuCell>
        <OverflowCell>
          <CustomPane>
            <Container>{SelectedMenu(this.props)}</Container>
          </CustomPane>
        </OverflowCell>
      </>
    );
  }
}

const mapStateToProps = (state: RootState) => ({
  selectedDefinition: getSelectedDefinition(state.keymap),
  selectedCustomMenuData: getSelectedCustomMenuData(state.keymap)
});

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      updateCustomMenuValue
    },
    dispatch
  );

export const Icon = component;
export const Title = title;
export const Pane = connect(mapStateToProps, mapDispatchToProps)(CustomMenu);

export type IdTag = {_id: string};
export type MapIntoArr<A, C> = A extends (infer B)[] ? (C & B)[] : any;
export type IntersectKey<A, B extends keyof A, C> = A &
  {[K in B]: MapIntoArr<A[B], C>};
export type TagWithId<A, B extends {content: any}> =
  | (IdTag & A)
  | IntersectKey<B, 'content', IdTag>;

export const MenuContainer = styled.div`
  padding: 15px 20px 20px 10px;
`;

export type LabelProps = {
  _type?: 'slice' | 'submenu' | 'menu';
  _id?: string;
  _renderIf?: (props: any) => boolean;
  content: any;
};

export function sliceLabeler(elem: any) {
  //TODO
  return elem;
}

export function elemLabeler(elem: any, prefix: string = ''): any {
  if (isItem(elem)) {
    return {
      ...elem,
      ...(elem.showIf
        ? {_renderIf: props => evalExpr(elem.showIf, props)}
        : {}),
      _id: prefix,
      _type: 'item'
    };
  } else if (isSlice(elem)) {
    return {
      ...elem,
      ...(elem.showIf
        ? {_renderIf: props => evalExpr(elem.showIf, props)}
        : {}),
      _id: prefix,
      _type: 'slice',
      content: menuLabeler(elem.content, prefix)
    };
  } else {
    return {
      ...elem,
      ...(elem.showIf
        ? {_renderIf: props => evalExpr(elem.showIf, props)}
        : {}),
      _id: prefix,
      _type: 'menu',
      content: menuLabeler(elem.content, prefix)
    };
  }
}

export function menuLabeler(menus: any, prefix: string = ''): any {
  return menus.map((menu, idx) => elemLabeler(menu, `${prefix}-${idx}`));
}

export function menuComponentGenerator(menus: any) {
  const labeledMenus = menuLabeler(menus, 'cmenu');
  return labeledMenus.map(menu => ({
    Icon: component,
    Title: title,
    Pane: props => <Pane {...props} key={menu._id} viaMenu={menu} />
  }));
}

export const makeCustomMenus = (menus: VIAMenu[]) =>
  menus.map((menu, idx) => ({
    Title: menu.label,
    // Allow icon to be configurable
    Icon: CustomIcon,
    Pane: props => (
      <Pane {...props} key={`${menu.label}-${idx}`} viaMenu={menu} />
    )
  }));
