import React, {useState, useRef, useEffect} from 'react';
import useResize from 'src/hooks/useResize';
import ChippyLoader from '../chippy-loader';
import ReactTooltip from 'react-tooltip';
import Logo from 'src/components/Logo';
import cntl from 'cntl';
import {
  CustomFeaturesV2,
  getLightingDefinition,
  isVIADefinitionV2,
  VIADefinitionV2,
  VIADefinitionV3,
} from 'via-reader';
import {PositionedKeyboard} from '../positioned-keyboard';
import * as Keycode from './configure-panes/keycode';
import * as Lighting from './configure-panes/lighting';
import * as Macros from './configure-panes/macros';
import * as SaveLoad from './configure-panes/save-load';
import * as Layouts from './configure-panes/layouts';
import * as RotaryEncoder from './configure-panes/custom/satisfaction75';
import {makeCustomMenus} from './configure-panes/custom/menu-generator';
import {Badge} from './configure-panes/badge';
import {useAppSelector} from 'src/store/hooks';
import {getSelectedDefinition} from 'src/store/definitionsSlice';
import {clearSelectedKey, getLoadProgress} from 'src/store/keymapSlice';
import {useDispatch} from 'react-redux';
import {reloadConnectedDevices} from 'src/store/devicesThunks';
import {getCustomMenus} from 'src/store/menusSlice';
import {getIsMacroFeatureSupported} from 'src/store/macrosSlice';
import FloatingPane from 'src/components/panes/configure-panes/FloatingPane';
import OutlineButton from 'src/components/controls/OutlineButton';
import ConfigureKeyboardControls from './configure-panes/KeyboardControls';

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

const loaderClassName = cntl`
  absolute
  bg-background
  duration-300
  flex
  flex-col
  gap-6
  h-full
  left-0
  text-center
  top-0
  transition-opacity
  w-full
  z-10
`;

function Loader(props: {
  loadProgress: number;
  selectedDefinition: VIADefinitionV2 | VIADefinitionV3 | null;
}) {
  const {loadProgress, selectedDefinition} = props;
  const [fadeOut, setFadeOut] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(Boolean(selectedDefinition));
  const [showButton, setShowButton] = useState(Boolean(selectedDefinition));
  const dispatch = useDispatch();

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!selectedDefinition) {
        setShowButton(true);
      }
    }, 1000);

    return () => clearTimeout(timeout);
  }, [selectedDefinition]);

  useEffect(() => {
    if (loadProgress === 1) {
      setFadeOut(true);

      setTimeout(() => {
        setFadeOut(false);
        setHasLoaded(true);
      }, 500);
    }
  }, [loadProgress]);

  if (hasLoaded) {
    return null;
  }

  const loaderClassN = cntl`
    ${loaderClassName}
    ${
      fadeOut
        ? cntl`
      opacity-0
    `
        : ''
    }
  `;

  return (
    <div className={loaderClassN}>
      <div className="my-6 mx-auto">
        <Logo className="fill-text w-14" />
      </div>
      <div className="flex-1 flex flex-col justify-center mx-auto gap-6">
        <ChippyLoader progress={selectedDefinition ? 1 : loadProgress} />
        <div>
          {showButton && !selectedDefinition ? (
            <OutlineButton
              className="text-xl"
              onClick={() => dispatch(reloadConnectedDevices())}
            >
              Authorize device
            </OutlineButton>
          ) : (
            <div
              className="text-xl font-medium text-text"
              data-tid="loading-message"
            >
              {selectedDefinition ? 'Loading…' : 'Searching for devices…'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export const ConfigurePane = () => {
  const selectedDefinition = useAppSelector(getSelectedDefinition);
  const loadProgress = useAppSelector(getLoadProgress);

  return (
    <div className="flex flex-col h-full overflow-hidden items-center justify-center">
      <Loader
        loadProgress={loadProgress}
        selectedDefinition={selectedDefinition ? selectedDefinition : null}
      />
      <ConfigureGrid />
    </div>
  );
};

const ConfigureGrid = () => {
  const dispatch = useDispatch();

  const [selectedRow, _setRow] = useState(0);
  const KeyboardRows = getRowsForKeyboard();
  const SelectedPane = KeyboardRows[selectedRow]?.Pane;
  const [dimensions, setDimensions] = useState({
    width: 0,
    height: 0,
  });
  const flexRef = useRef(null);

  useResize(flexRef, (entry) => {
    if (entry && flexRef?.current) {
      requestAnimationFrame(() => {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      });
    }
  });

  if (!KeyboardRows || !SelectedPane) {
    return null;
  }

  return (
    <div className="flex h-full w-full">
      <div
        className="flex flex-col flex-1 min-w-0"
        onClick={() => dispatch(clearSelectedKey())}
      >
        <div className="mx-auto mt-8">
          <Badge />
        </div>
        <div className="m-4 flex justify-center" ref={flexRef}>
          <div
            className="border-2 rounded-lg border-outline p-3 relative"
            ref={flexRef}
          >
            <PositionedKeyboard
              containerDimensions={dimensions}
              selectable={KeyboardRows[selectedRow].Title === 'Keymap'}
            />
            <ReactTooltip />
          </div>
        </div>
        <ConfigureKeyboardControls dimensions={dimensions} />
      </div>
      <FloatingPane />
    </div>
  );
};
