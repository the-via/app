import * as React from 'react';
import Slider from 'rc-slider';
import type {SliderProps} from 'rc-slider';
import styled from 'styled-components';

const Container = styled.span`
  display: inline-block;
  line-height: initial;
  width: 200px;
`;

export const AccentRange: React.FC<SliderProps> = props => (
  <Container>
    <Slider
      {...props}
      railStyle={{backgroundColor: 'var(--color_dark-grey)'}}
      trackStyle={{backgroundColor: 'var(--color_accent)'}}
      handleStyle={{
        borderColor: 'var(--color_accent)',
        backgroundColor: 'var(--color_accent)'
      }}
    />
  </Container>
);
