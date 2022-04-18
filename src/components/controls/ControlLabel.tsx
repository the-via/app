/*
 * Used to label controls (like selecting layers and actions)
 */

import React from 'react';
import cntl from 'cntl';

interface Props {
  className?: string;
  children?: React.ReactNode;
}

export default function ControlLabel(props: Props) {
  const {className} = props;

  const controlLabelClassName = cntl`
    mr-6
    text-sm
    tracking-label  
    font-medium
    uppercase
    ${className}
  `;

  return <div className={controlLabelClassName}>{props.children}</div>;
}
