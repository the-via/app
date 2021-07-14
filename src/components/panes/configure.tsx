import * as React from 'react';
import useResize from 'react-resize-observer-hook';
import styled from 'styled-components';
import ChippyLoader from '../chippy-loader';
import LoadingText from '../loading-text';
import {Pane as DefaultPane} from './pane';
import {connect} from 'react-redux';
import {RootState} from '../../redux';
import {
  actions,
  getLoadProgress,
  getSelectedDefinition,
  getSelectedProtocol,
  getCustomMenus
} from '../../redux/modules/keymap';
import * as ReactTooltip from 'react-tooltip';
import {CustomFeatures, getLightingDefinition} from 'via-reader';
import {ConnectedPositionedKeyboard} from '../positioned-keyboard';
import {Grid, Row, FlexCell, IconContainer, MenuCell} from './grid';
import * as Keycode from './configure-panes/keycode';
import * as Lighting from './configure-panes/lighting';
import * as Macros from './configure-panes/macros';
import * as SaveLoad from './configure-panes/save-load';
import * as Layouts from './configure-panes/layouts';
import * as RotaryEncoder from './configure-panes/custom/satisfaction75';
import {makeCustomMenus} from './configure-panes/custom/menu-generator';
import {LayerControl} from './configure-panes/layer-control';
import {Badge} from './configure-panes/badge';
type ReduxState = ReturnType<typeof mapStateToProps>;

type ReduxDispatch = typeof mapDispatchToProps;

type Props = ReduxState & ReduxDispatch;

const mapDispatchToProps = {clearSelectedKey: actions.clearSelectedKey};
const mapStateToProps = ({keymap, macros}: RootState) => ({
  showMacros: macros.isFeatureSupported,
  progress: getLoadProgress(keymap),
  selectedDefinition: getSelectedDefinition(keymap),
  selectedProtocol: getSelectedProtocol(keymap),
  customMenus: getCustomMenus(keymap)
});

const Pane = styled(DefaultPane)`
  flex-direction: column;
  align-items: center;
  justify-content: space-evenly;
`;

const MenuContainer = styled.div`
  padding: 15px 30px 20px 10px;
`;

const Rows = [
  Keycode,
  Macros,
  Layouts,
  Lighting,
  SaveLoad,
  RotaryEncoder,
  ...makeCustomMenus([])
];
function getCustomPanes(customFeatures: CustomFeatures[]) {
  if (
    customFeatures.find(feature => feature === CustomFeatures.RotaryEncoder)
  ) {
    return [RotaryEncoder];
  }
  return [];
}

function getRowsForKeyboard({
  customMenus,
  selectedDefinition,
  showMacros,
  selectedProtocol
}): typeof Rows {
  const {lighting, customFeatures, layouts} = selectedDefinition;
  const {supportedLightingValues} = getLightingDefinition(lighting);
  let titles: typeof Rows = [Keycode];
  if (layouts.optionKeys && Object.entries(layouts.optionKeys).length !== 0) {
    titles = [...titles, Layouts];
  }
  if (showMacros) {
    titles = [...titles, Macros];
  }
  if (selectedProtocol <= 9 && supportedLightingValues.length !== 0) {
    titles = [...titles, Lighting];
  }
  if (customFeatures) {
    titles = [...titles, ...getCustomPanes(customFeatures)];
  }
  if (selectedProtocol >= 10 && customMenus) {
    titles = [...titles, ...makeCustomMenus(customMenus)];
  }

  titles = [...titles, SaveLoad];
  return titles;
}

function Loader(props: Props) {
  return (
    <>
      <ChippyLoader progress={props.progress} />
      <LoadingText isSearching={!props.selectedDefinition} />
    </>
  );
}

function ConfigurePane(props: Props) {
  const showLoader = !props.selectedDefinition || props.progress !== 1;
  return (
    <Pane>
      {showLoader ? <Loader {...props} /> : <ConfigureGrid {...props} />}
    </Pane>
  );
}
function ConfigureGrid(props: Props) {
  const [selectedRow, setRow] = React.useState(0);
  const KeyboardRows = React.useMemo(() => getRowsForKeyboard(props), [props]);
  const SelectedPane = KeyboardRows[selectedRow].Pane;
  const [dimensions, setDimensions] = React.useState({
    width: 1280,
    height: 900
  });
  const flexRef = React.useRef(null);
  useResize(
    flexRef,
    entry =>
      flexRef.current &&
      setDimensions({
        width: entry.width,
        height: entry.height
      })
  );
  return (
    <Grid>
      <MenuCell>
        <MenuContainer>
          {KeyboardRows.map((RowLabel, idx) => (
            <Row
              key={idx}
              onClick={_ => setRow(idx)}
              selected={selectedRow === idx}
            >
              <IconContainer>
                <RowLabel.Icon />
              </IconContainer>
              {RowLabel.Title}
            </Row>
          ))}
        </MenuContainer>
      </MenuCell>

      <FlexCell ref={flexRef} onClick={props.clearSelectedKey}>
        <ConnectedPositionedKeyboard
          containerDimensions={dimensions}
          selectable={KeyboardRows[selectedRow].Title === 'Keymap'}
        />
        <ReactTooltip />
        <LayerControl />
        <Badge />
      </FlexCell>
      <SelectedPane />
    </Grid>
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(ConfigurePane);
