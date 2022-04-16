import React, {useState, useRef, useEffect} from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faPlus} from '@fortawesome/free-solid-svg-icons';
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
import {reloadConnectedDevices} from 'src/store/devicesThunks';
import {getCustomMenus} from 'src/store/menusSlice';
import {getIsMacroFeatureSupported} from 'src/store/macrosSlice';
import FloatingPane from 'src/components/panes/configure-panes/keycode/FloatingPane';

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
  const showMacros = useAppSelector(getIsMacroFeatureSupported);
  const customMenus = useAppSelector(getCustomMenus);
  const selectedDefinition = useAppSelector(getSelectedDefinition);

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
  const selectedDefinition = useAppSelector(getSelectedDefinition);
  const loadProgress = useAppSelector(getLoadProgress);

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
  const KeyboardRows = getRowsForKeyboard();
  const SelectedPane = KeyboardRows[selectedRow].Pane;
  const [dimensions, setDimensions] = useState({
    width: 1280,
    height: 900,
  });
  const flexRef = useRef(null);

  useResize(flexRef, (entry) => {
    if (entry && flexRef.current) {
      console.info('hi', entry.width, entry.height);
      setDimensions({
        width: entry.width,
        height: entry.height,
      });
    }
  });

  return (
    <div className="flex h-full w-full">
      <div
        className="flex flex-col flex-1"
        onClick={() => dispatch(clearSelectedKey())}
      >
        <div className="m-4 p-2 border-dark border-2 rounded" ref={flexRef}>
          <PositionedKeyboard
            containerDimensions={dimensions}
            selectable={KeyboardRows[selectedRow].Title === 'Keymap'}
          />
          <ReactTooltip />
          {/*
            <LayerControl />
          */}
          <Badge />
          {/*
            <SelectedPane />
            */}
        </div>
        <div className="flex-1 italic">additional settings</div>
      </div>
      <FloatingPane />
      {/*
      <div className="flex flex-col align-flex-start gap-4 p-4 border-r border-dark border-solid">
        {KeyboardRows.map(
          ({Icon, Title}: {Icon: any; Title: string}, idx: number) => (
            <Row
              key={idx}
              onClick={(_) => setRow(idx)}
              isSelected={selectedRow === idx}
            >
              <IconContainer>
                <Icon />
              </IconContainer>
              <span className="whitespace-nowrap">{Title}</span>
            </Row>
          ),
        )}
      </div>
*/}
    </div>
  );
};
