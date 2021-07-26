import * as React from 'react';
import {AccentSlider} from '../accent-slider';
import type {PelpiInput} from './input';

export const PelpiToggleInput: React.FC<PelpiInput<{}>> = props => {
  const [, setInternalValue] = React.useState(0);
  React.useEffect(() => {
    setInternalValue(props.value);
  }, [props.value]);

  const onSetValue = (arg: boolean) => {
    setInternalValue(+arg);
    props.setValue(+arg);
  };
  return <AccentSlider isChecked={!!props.value} onChange={onSetValue} />;
};
