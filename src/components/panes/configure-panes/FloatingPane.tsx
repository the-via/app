import React from 'react';
import cntl from 'cntl';
import {getKeycodes, getOtherMenu} from 'src/utils/key';
import ControlButton from 'src/components/controls/ControlButton';
import KeymapPane from './keycode/KeymapPane';
import LayoutPane from './LayoutPane';
import LightingPane from './LightingPane';

const floatingPaneClassName = cntl`
  border
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
  LIGHTING,
  LAYOUTS,
  CONFIG
}

export default function FloatingPane() {
  const [activePane, setActivePane] = React.useState<ConfigurePanes>(
    ConfigurePanes.KEYMAP,
  );

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

  return (
    <div className={floatingPaneClassName}>
      <div className="flex items-center justify-between border-b border-outline p-4">
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
        <ControlButton
          isSelected={activePane === ConfigurePanes.LAYOUTS}
          onClick={() => {
            setActivePane(ConfigurePanes.LAYOUTS);
          }}
        >
          Layouts
        </ControlButton>
        <ControlButton
          isSelected={activePane === ConfigurePanes.CONFIG}
          onClick={() => {
            setActivePane(ConfigurePanes.CONFIG);
          }}
        >
          Config
        </ControlButton>
      </div>
      {ActivePaneComponent}
    </div>
  );
}
