import React from 'react';
import {AccentButton} from '../accent-button';
import type {PelpiInput} from './input';

export const PelpiToggleInput: React.VFC<
  PelpiInput<{
    label: string;
  }>
> = (props) => {
  return (
    <AccentButton onClick={() => props.setValue(0)}>
      {props.meta.label}
    </AccentButton>
  );
};
