import React from 'react';
import Slider, { SliderProps} from 'rc-slider';

export const AccentRange: React.VFC<SliderProps> = (props) => (
  <Slider
    railStyle={{backgroundColor: 'var(--color-outline)'}}
    trackStyle={{backgroundColor: 'var(--color-action)'}}
    handleStyle={{
      borderColor: 'var(--color-action)',
      backgroundColor: 'var(--color-action)',
    }}
    {...props}
  />
);
