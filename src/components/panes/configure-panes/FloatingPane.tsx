import React from 'react';
import cntl from 'cntl';
import {getKeycodes, getOtherMenu} from 'src/utils/key';
import ControlButton from 'src/components/controls/ControlButton';
import KeymapPane from './keycode/KeymapPane';
import LayoutPane from './LayoutPane';
import LightingPane from './LightingPane';
import { getSelectedLayoutOptions } from 'src/store/definitionsSlice';
import { useAppSelector } from 'src/store/hooks';

const floatingPaneClassName = cntl`
  border-2
  border-outline
  bottom-4
  flex
  flex-col
  left-5
  m-4
  xl:m-8
  rounded
  w-1/3
`;

enum ConfigurePanes {
  KEYMAP,
  MACRO,
  LIGHTING,
  LAYOUTS,
}

export default function FloatingPane() {
  const [activePane, setActivePane] = React.useState<ConfigurePanes>(
    ConfigurePanes.KEYMAP,
  );
  const selectedLayoutOptions = useAppSelector(getSelectedLayoutOptions);

  let ActivePaneComponent = null;
  if (activePane === ConfigurePanes.KEYMAP) {
    ActivePaneComponent = <KeymapPane />;
  } else if (activePane === ConfigurePanes.LIGHTING) {
    ActivePaneComponent = <LightingPane />;
  } else if (activePane === ConfigurePanes.LAYOUTS) {
    ActivePaneComponent = <LayoutPane />;
  } else if (activePane === ConfigurePanes.CONFIG) {
    ActivePaneComponent = <div>Config</div>;
  }

  const hasLayouts = selectedLayoutOptions.length > 0;

  return (
    <div className={floatingPaneClassName}>
      <div className="flex items-center justify-around p-4">
        <ControlButton
          isSelected={activePane === ConfigurePanes.KEYMAP}
          onClick={() => {
            setActivePane(ConfigurePanes.KEYMAP);
          }}
        >
          Keymap
        </ControlButton>
        <ControlButton
          isSelected={activePane === ConfigurePanes.LIGHTING}
          onClick={() => {
            setActivePane(ConfigurePanes.LIGHTING);
          }}
        >
          Lighting
        </ControlButton>
        { hasLayouts && (
          <ControlButton
            isSelected={activePane === ConfigurePanes.LAYOUTS}
            onClick={() => {
              setActivePane(ConfigurePanes.LAYOUTS);
            }}
          >
            Layouts
          </ControlButton>
        )}
        <ControlButton
          isSelected={activePane === ConfigurePanes.LIGHTING}
          onClick={() => {
            setActivePane(ConfigurePanes.LIGHTING);
          }}
        >
          Macros
        </ControlButton>
      </div>
      {ActivePaneComponent}
    </div>
  );
}
