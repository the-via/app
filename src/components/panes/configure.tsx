import React, {useState, useRef, useEffect} from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faPlus} from '@fortawesome/free-solid-svg-icons';
import {useSize} from '../../utils/use-size';
import styled from 'styled-components';
import ChippyLoader from '../chippy-loader';
import LoadingText from '../loading-text';
import {CenterPane, ConfigureBasePane} from './pane';
import ReactTooltip from 'react-tooltip';
import {
  CustomFeaturesV2,
  getLightingDefinition,
  isVIADefinitionV2,
  isVIADefinitionV3,
  VIADefinitionV2,
  VIADefinitionV3,
} from '@the-via/reader';
import {Grid, Row, IconContainer, MenuCell, ConfigureFlexCell} from './grid';
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
import {
  clearSelectedKey,
  getLoadProgress,
  getNumberOfLayers,
  setConfigureKeyboardIsSelectable,
} from 'src/store/keymapSlice';
import {useDispatch} from 'react-redux';
import {reloadConnectedDevices} from 'src/store/devicesThunks';
import {getV3MenuComponents} from 'src/store/menusSlice';
import {getIsMacroFeatureSupported} from 'src/store/macrosSlice';
import {getConnectedDevices, getSupportedIds} from 'src/store/devicesSlice';
import {isElectron} from 'src/utils/running-context';
import {useAppDispatch} from 'src/store/hooks';
import {useProgress} from '@react-three/drei';
import {MenuTooltip} from '../inputs/tooltip';

const MenuContainer = styled.div`
  padding: 15px 10px 20px 10px;
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
  const showMacros = useAppSelector(getIsMacroFeatureSupported);
  const v3Menus = useAppSelector(getV3MenuComponents);
  const selectedDefinition = useAppSelector(getSelectedDefinition);
  const numberOfLayers = useAppSelector(getNumberOfLayers);

  if (!selectedDefinition) {
    return [];
  } else if (isVIADefinitionV2(selectedDefinition)) {
    return getRowsForKeyboardV2(selectedDefinition, showMacros, numberOfLayers);
  } else if (isVIADefinitionV3(selectedDefinition)) {
    return [
      ...filterInferredRows(selectedDefinition, showMacros, numberOfLayers, [
        Keycode,
        Layouts,
        Macros,
        SaveLoad,
      ]),
      ...v3Menus,
    ];
  } else {
    return [];
  }
};

const filterInferredRows = (
  selectedDefinition: VIADefinitionV3 | VIADefinitionV2,
  showMacros: boolean,
  numberOfLayers: number,
  rows: typeof Rows,
): typeof Rows => {
  const {layouts} = selectedDefinition;
  let removeList: typeof Rows = [];
  // LAYOUTS IS INFERRED, filter out if doesn't exist
  if (
    !(layouts.optionKeys && Object.entries(layouts.optionKeys).length !== 0)
  ) {
    removeList = [...removeList, Layouts];
  }

  if (numberOfLayers === 0) {
    removeList = [...removeList, Keycode, SaveLoad];
  }

  if (!showMacros) {
    removeList = [...removeList, Macros];
  }
  let filteredRows = rows.filter(
    (row) => !removeList.includes(row),
  ) as typeof Rows;
  return filteredRows;
};

const getRowsForKeyboardV2 = (
  selectedDefinition: VIADefinitionV2,
  showMacros: boolean,
  numberOfLayers: number,
): typeof Rows => {
  let rows: typeof Rows = [Keycode, Layouts, Macros, SaveLoad];
  if (isVIADefinitionV2(selectedDefinition)) {
    const {lighting, customFeatures} = selectedDefinition;
    const {supportedLightingValues} = getLightingDefinition(lighting);
    if (supportedLightingValues.length !== 0) {
      rows = [...rows, Lighting];
    }
    if (customFeatures) {
      rows = [...rows, ...getCustomPanes(customFeatures)];
    }
  }
  return filterInferredRows(
    selectedDefinition,
    showMacros,
    numberOfLayers,
    rows,
  );
};

function Loader(props: {
  loadProgress: number;
  selectedDefinition: VIADefinitionV2 | VIADefinitionV3 | null;
}) {
  const {loadProgress, selectedDefinition} = props;
  const dispatch = useAppDispatch();

  const connectedDevices = useAppSelector(getConnectedDevices);
  const supportedIds = useAppSelector(getSupportedIds);
  const noSupportedIds = !Object.values(supportedIds).length;
  const noConnectedDevices = !Object.values(connectedDevices).length;
  const [showButton, setShowButton] = useState<boolean>(false);
  const {progress} = useProgress();
  const chippyProgress =
    loadProgress > 0 ? (loadProgress + progress / 100) / 2 : loadProgress;
  useEffect(() => {
    // TODO: Remove the timeout because it is funky
    const timeout = setTimeout(() => {
      if (!selectedDefinition) {
        setShowButton(true);
      }
    }, 3000);
    return () => clearTimeout(timeout);
  }, [selectedDefinition]);
  return (
    <>
      {<ChippyLoader progress={chippyProgress || null} />}
      {(showButton || noConnectedDevices) && !noSupportedIds && !isElectron ? (
        <AccentButtonLarge onClick={() => dispatch(reloadConnectedDevices())}>
          Authorize device
          <FontAwesomeIcon style={{marginLeft: '10px'}} icon={faPlus} />
        </AccentButtonLarge>
      ) : (
        <LoadingText isSearching={!selectedDefinition} />
      )}
    </>
  );
}

const LoaderPane = styled(CenterPane)`
  display: flex;
  align-items: center;
  justify-content: center;
  row-gap: 100px;
`;

export const ConfigurePane = () => {
  const selectedDefinition = useAppSelector(getSelectedDefinition);
  const loadProgress = useAppSelector(getLoadProgress);

  const showLoader = !selectedDefinition || loadProgress !== 1;
  return showLoader ? (
    <LoaderPane>
      <Loader
        {...{
          loadProgress,
          selectedDefinition: selectedDefinition ? selectedDefinition : null,
        }}
      />
    </LoaderPane>
  ) : (
    <ConfigureBasePane>
      <ConfigureGrid />
    </ConfigureBasePane>
  );
};

const ConfigureGrid = () => {
  const dispatch = useDispatch();

  const [selectedRow, setRow] = useState(0);
  const KeyboardRows = getRowsForKeyboard();
  const SelectedPane = KeyboardRows[selectedRow]?.Pane;
  const selectedTitle = KeyboardRows[selectedRow]?.Title;

  useEffect(() => {
    if (selectedTitle !== 'Keymap') {
      dispatch(setConfigureKeyboardIsSelectable(false));
    } else {
      dispatch(setConfigureKeyboardIsSelectable(true));
    }
  }, [selectedTitle]);

  return (
    <>
      <ConfigureFlexCell
        onClick={(evt) => {
          if ((evt.target as any).nodeName !== 'CANVAS')
            dispatch(clearSelectedKey());
        }}
        style={{
          pointerEvents: 'none',
          position: 'absolute',
          top: 50,
          left: 0,
          right: 0,
        }}
      >
        <div style={{pointerEvents: 'all'}}>
          <ReactTooltip />
          <LayerControl />
          <Badge />
        </div>
      </ConfigureFlexCell>
      <Grid style={{pointerEvents: 'none'}}>
        <MenuCell style={{pointerEvents: 'all'}}>
          <MenuContainer>
            {(KeyboardRows || []).map(
              ({Icon, Title}: {Icon: any; Title: string}, idx: number) => (
                <Row
                  key={idx}
                  onClick={(_) => setRow(idx)}
                  selected={selectedRow === idx}
                >
                  <IconContainer>
                    <Icon />
                    <MenuTooltip>{Title}</MenuTooltip>
                  </IconContainer>
                </Row>
              ),
            )}
          </MenuContainer>
        </MenuCell>

        {SelectedPane && <SelectedPane />}
      </Grid>
    </>
  );
};
