/*
 * Used to label controls (like selecting layers and actions)
 */

import React from 'react';

interface Props {
  children?: React.ReactNode;
}

export default function ControlLabel(props: Props) {
  return <div className="uppercase tracking-label mr-4">{props.children}</div>;
}
