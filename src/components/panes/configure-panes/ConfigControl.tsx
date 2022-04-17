import React from 'react';
import ControlLabel from 'src/components/controls/ControlLabel';
import ControlButton from 'src/components/controls/ControlButton';

interface Props {}

export default function ConfigControl(_props: Props) {
  // TODO: Wire up Save & Load

  return (
    <div className="flex items-center justify-end">
      <ControlLabel>Config</ControlLabel>
      <div className="flex gap-2">
        <ControlButton title="Save configuration">↓</ControlButton>
        <ControlButton title="Load configuration">↑</ControlButton>
      </div>
    </div>
  );
}
