import React from 'react';
import ControlLabel from 'src/components/controls/ControlLabel';
import cntl from 'cntl';

export interface ControlCategoryLabelProps {
  className?: string;
  children?: React.ReactNode;
}

export default function ControlCategoryLabel(props: ControlCategoryLabelProps) {
  const { className, children } = props;

  const controlCategoryLabelClassName = cntl`
    bg-background
    flex
    items-center
    mb-4
    relative
    ${className}
  `;

  return (
    <div className={controlCategoryLabelClassName}>
      <div className="h-px bg-outline flex-1" />
      <ControlLabel>
        <span className="bg-background px-4">{children}</span>
      </ControlLabel>
      <div className="h-px bg-outline flex-1" />
    </div>
  );
}
