import * as React from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faPlus} from '@fortawesome/free-solid-svg-icons';
import {bindActionCreators} from 'redux';
import useResize from 'react-resize-observer-hook';
import styled from 'styled-components';
import ChippyLoader from '../chippy-loader';
import LoadingText from '../loading-text';
import {Pane as DefaultPane} from './pane';
import {connect, MapDispatchToPropsFunction} from 'react-redux';
import type {RootState} from '../../redux';
import {
  actions,
  getLoadProgress,
  getSelectedDefinition,
  getSelectedProtocol,
  getCustomMenus,
  reloadConnectedDevices,
} from '../../redux/modules/keymap';
import ReactTooltip from 'react-tooltip';
import {CustomFeaturesV2, getLightingDefinition} from 'via-reader';
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
import {AccentButtonLarge} from '../inputs/accent-button';
type ReduxState = ReturnType<typeof mapStateToProps>;

type ReduxDispatch = ReturnType<typeof mapDispatchToProps>;

type Props = ReduxState & ReduxDispatch;

const mapDispatchToProps: MapDispatchToPropsFunction<
  any,
  ReturnType<typeof mapStateToProps>
> = (dispatch) =>
  bindActionCreators(
    {
      clearSelectedKey: actions.clearSelectedKey,
      reloadConnectedDevices: reloadConnectedDevices,
    },
    dispatch,
  );
const mapStateToProps = ({keymap, macros}: RootState) => ({
  showMacros: macros.isFeatureSupported,
  progress: getLoadProgress(keymap),
  selectedDefinition: getSelectedDefinition(keymap),
  selectedProtocol: getSelectedProtocol(keymap),
  customMenus: getCustomMenus(keymap),
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
  ...makeCustomMenus([]),
];
function getCustomPanes(customFeatures: CustomFeaturesV2[]) {
  if (
    customFeatures.find((feature) => feature === CustomFeaturesV2.RotaryEncoder)
  ) {
    return [RotaryEncoder];
  }
  return [];
}

// TODO: need to work out how to type these props
function getRowsForKeyboard({
  customMenus,
  selectedDefinition,
  showMacros,
  selectedProtocol,
}: Props): typeof Rows {
  const {layouts} = selectedDefinition;
  let titles: typeof Rows = [Keycode];
  if (layouts.optionKeys && Object.entries(layouts.optionKeys).length !== 0) {
    titles = [...titles, Layouts];
  }
  if (showMacros) {
    titles = [...titles, Macros];
  }
  if (selectedProtocol <= 9) {
    const {lighting, customFeatures} = selectedDefinition;
    const {supportedLightingValues} = getLightingDefinition(lighting);
    if (supportedLightingValues.length !== 0) {
      titles = [...titles, Lighting];
    }
    if (customFeatures) {
      titles = [...titles, ...getCustomPanes(customFeatures)];
    }
  }

  if (selectedProtocol >= 10 && customMenus) {
    titles = [...titles, ...makeCustomMenus(customMenus)];
  }

  titles = [...titles, SaveLoad];
  return titles;
}

function Loader(props: Props) {
  const [showButton, setShowButton] = React.useState<boolean>(false);
  React.useEffect(() => {
    const timeout = setTimeout(() => {
      if (!props.selectedDefinition) {
        setShowButton(true);
      }
    }, 3000);
    return () => clearTimeout(timeout);
  }, [props.selectedDefinition]);
  return (
    <>
      <ChippyLoader progress={props.progress || null} />
      {showButton ? (
        <AccentButtonLarge onClick={props.reloadConnectedDevices}>
          Authorize device{' '}
          <FontAwesomeIcon style={{marginLeft: '5px'}} icon={faPlus} />
        </AccentButtonLarge>
      ) : (
        <LoadingText isSearching={!props.selectedDefinition} />
      )}
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
    height: 900,
  });
  const flexRef = React.useRef(null);

  useResize(
    flexRef,
    (entry) =>
      flexRef.current &&
      setDimensions({
        width: entry.width,
        height: entry.height,
      }),
  );

  return (
    <Grid>
      <MenuCell>
        <MenuContainer>
          {KeyboardRows.map(
            ({Icon, Title}: {Icon: any; Title: string}, idx: number) => (
              <Row
                key={idx}
                onClick={(_) => setRow(idx)}
                selected={selectedRow === idx}
              >
                <IconContainer>
                  <Icon />
                </IconContainer>
                {Title}
              </Row>
            ),
          )}
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
