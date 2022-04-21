import React from 'react';
import {GeneralPane} from './submenus/lighting/general';
import {
  Pane as LayoutPane,
} from './submenus/lighting/layout';
import {
  AdvancedPane,
} from './submenus/lighting/advanced';

export default function LightingPane() {
  return (
    <div>
      <GeneralPane />
      <LayoutPane />
      <AdvancedPane />
    </div>
  );
};
