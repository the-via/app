import React from 'react';
import ControlLabel from 'src/components/controls/ControlLabel';

interface Props {
  children?: React.ReactNode;
}

export default function KeycodeCategoryLabel(props: Props) {
  const { children } = props;

  return (
    <div className="flex relative sticky top-0 items-center mb-4 bg-secondary-accent">
      <div className="h-px bg-secondary flex-1" />
      <ControlLabel>
        <span className="bg-background px-4">{children}</span>
      </ControlLabel>
      <div className="h-px bg-secondary flex-1" />
    </div>
  );
}
