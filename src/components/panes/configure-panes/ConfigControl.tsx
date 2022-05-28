import React from 'react';
import ArrowDown from 'src/components/icons/arrow-down';
import ArrowUp from 'src/components/icons/arrow-up';
import ControlButton from 'src/components/controls/ControlButton';
import ControlLabel from 'src/components/controls/ControlLabel';

interface ConfigControlProps {}

export default function ConfigControl(_props: ConfigControlProps) {
  return (
    <div className="flex items-center">
      <ControlLabel className="mr-4">Config</ControlLabel>
      <div className="flex items-center gap-2">
        <ControlButton className="!px-px" title="Save config">
          <ArrowDown />
        </ControlButton>
        <ControlButton className="!px-px" title="Upload config">
          <ArrowUp />
        </ControlButton>
      </div>
    </div>
  );
}
