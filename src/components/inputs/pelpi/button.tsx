import * as React from 'react';
import {AccentButton} from '../accent-button';
import {PelpiInput} from './input';

export const PelpiToggleInput: React.FC<PelpiInput<{
  label: string;
}>> = props => {
  return (
    <AccentButton onClick={props.setValue}>{props.meta.label}</AccentButton>
  );
};
