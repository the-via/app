import React from 'react';
import cntl from 'cntl';
import {getKeycodes, getOtherMenu} from 'src/utils/key';
import ControlButton from 'src/components/controls/ControlButton';
import KeymapPane from './keycode/KeymapPane';
import LayoutPane from './LayoutPane';

const floatingPaneClassName = cntl`
  border
  border-secondary
  bottom-4
  flex
  flex-col
  left-5
  m-8
  rounded
  w-1/3
`;

enum ConfigurePanes {
  KEYMAP,
  LIGHTING,
  LAYOUTS,
}

export default function FloatingPane() {
  const [activePane, setActivePane] = React.useState<ConfigurePanes>(
    ConfigurePanes.KEYMAP,
  );

  let ActivePaneComponent = null;
  if (activePane === ConfigurePanes.KEYMAP) {
    ActivePaneComponent = <KeymapPane />;
  } else if (activePane === ConfigurePanes.LIGHTING) {
    ActivePaneComponent = <div>Lighting</div>;
  } else if (activePane === ConfigurePanes.LAYOUTS) {
    ActivePaneComponent = <LayoutPane />;
  }

  return (
    <div className={floatingPaneClassName}>
      <div className="flex items-center justify-between border-b-2 border-secondary p-4">
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
      </div>
      {ActivePaneComponent}
    </div>
  );
}
