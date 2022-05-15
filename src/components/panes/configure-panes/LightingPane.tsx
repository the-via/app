import React from 'react';
import {GeneralPane} from './submenus/lighting/general';
import {Pane as LayoutPane} from './submenus/lighting/layout';
import {AdvancedPane} from './submenus/lighting/advanced';

export default function LightingPane() {
  return (
    <div className="flex flex-col gap-4 h-full overflow-y-auto">
      <GeneralPane />
      <LayoutPane />
      <AdvancedPane />
    </div>
  );
}
