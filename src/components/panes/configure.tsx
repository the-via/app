import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faPlus} from '@fortawesome/free-solid-svg-icons';
import {bindActionCreators} from 'redux';
import useResize from 'react-resize-observer-hook';
import styled from 'styled-components';
import ChippyLoader from '../chippy-loader';
import LoadingText from '../loading-text';
import {Pane as DefaultPane} from './pane';
import ReactTooltip from 'react-tooltip';
import {
  CustomFeaturesV2,
  getLightingDefinition,
  isVIADefinitionV2,
  VIADefinitionV2,
  VIADefinitionV3,
} from 'via-reader';
import {PositionedKeyboard} from '../positioned-keyboard';
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
import {useAppSelector} from 'src/store/hooks';
import {getSelectedDefinition} from 'src/store/definitionsSlice';
import {clearSelectedKey, getLoadProgress} from 'src/store/keymapSlice';
import {useDispatch} from 'react-redux';
import {useState, useMemo, useRef, useEffect} from 'react';
import {
  getSelectedConnectedDevice,
  reloadConnectedDevices,
} from 'src/store/devicesSlice';
import {getCustomMenus} from 'src/store/menusSlice';
import {getIsMacroFeatureSupported} from 'src/store/macrosSlice';

// const mapDispatchToProps: MapDispatchToPropsFunction<
//   any,
//   ReturnType<typeof mapStateToProps>
// > = (dispatch) =>
//   bindActionCreators(
//     {
//       clearSelectedKey: actions.clearSelectedKey,
//       reloadConnectedDevices: reloadConnectedDevices,
//     },
//     dispatch,
//   );
// const mapStateToProps = ({keymap, macros}: RootState) => ({
//   showMacros: macros.isFeatureSupported,
//   progress: getLoadProgress(keymap),
//   selectedDefinition: getSelectedDefinition(keymap),
//   selectedProtocol: getSelectedProtocol(keymap),
//   customMenus: getCustomMenus(keymap),
// });

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

const getRowsForKeyboard = (): typeof Rows => {
  const showMacros = useAppSelector((state) =>
    getIsMacroFeatureSupported(state),
  );
  const customMenus = useAppSelector((state) => getCustomMenus(state));
  const selectedDefinition = useAppSelector((state) =>
    getSelectedDefinition(state),
  );

  if (!selectedDefinition) {
    return [];
  }

  const {layouts} = selectedDefinition;
  let titles: typeof Rows = [Keycode];
  if (layouts.optionKeys && Object.entries(layouts.optionKeys).length !== 0) {
    titles = [...titles, Layouts];
  }
  if (showMacros) {
    titles = [...titles, Macros];
  }
  if (isVIADefinitionV2(selectedDefinition)) {
    const {lighting, customFeatures} = selectedDefinition;
    const {supportedLightingValues} = getLightingDefinition(lighting);
    if (supportedLightingValues.length !== 0) {
      titles = [...titles, Lighting];
    }
    if (customFeatures) {
      titles = [...titles, ...getCustomPanes(customFeatures)];
    }
  } else if (customMenus) {
    titles = [...titles, ...makeCustomMenus(customMenus)];
  }

  titles = [...titles, SaveLoad];
  return titles;
};

function Loader(props: {
  loadProgress: number;
  selectedDefinition: VIADefinitionV2 | VIADefinitionV3 | null;
}) {
  const {loadProgress, selectedDefinition} = props;
  const dispatch = useDispatch();

  const [showButton, setShowButton] = useState<boolean>(false);
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!selectedDefinition) {
        setShowButton(true);
      }
    }, 3000);
    return () => clearTimeout(timeout);
  }, [selectedDefinition]);
  return (
    <>
      <ChippyLoader progress={loadProgress || null} />
      {showButton ? (
        <AccentButtonLarge onClick={() => dispatch(reloadConnectedDevices())}>
          Authorize device{' '}
          <FontAwesomeIcon style={{marginLeft: '5px'}} icon={faPlus} />
        </AccentButtonLarge>
      ) : (
        <LoadingText isSearching={!selectedDefinition} />
      )}
    </>
  );
}

export const ConfigurePane = () => {
  const selectedDefinition = useAppSelector((state) =>
    getSelectedDefinition(state),
  );
  const loadProgress = useAppSelector((state) => getLoadProgress(state));

  const showLoader = !selectedDefinition || loadProgress !== 1;
  return (
    <Pane>
      {showLoader ? (
        <Loader
          {...{
            loadProgress,
            selectedDefinition: selectedDefinition ? selectedDefinition : null,
          }}
        />
      ) : (
        <ConfigureGrid />
      )}
    </Pane>
  );
};

const ConfigureGrid = () => {
  const dispatch = useDispatch();

  const [selectedRow, setRow] = useState(0);
  // TODO: getRowsForKeyboard was being memoised with useMemo. Not sure if necessary or what gains it offers in this new context.
  const KeyboardRows = getRowsForKeyboard();
  const SelectedPane = KeyboardRows[selectedRow].Pane; // TODO: This seems like a typing issue because of other broken components that still need fixing. Revisit.
  const [dimensions, setDimensions] = useState({
    width: 1280,
    height: 900,
  });
  const flexRef = useRef(null);

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

      <FlexCell ref={flexRef} onClick={() => dispatch(clearSelectedKey())}>
        <PositionedKeyboard
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
};
