import React from 'react';
import Slider from 'rc-slider';
import type {SliderProps} from 'rc-slider';
import styled from 'styled-components';

const Container = styled.span`
  display: inline-block;
  line-height: initial;
  width: 200px;
`;

export const AccentRange: React.VFC<SliderProps> = (props) => (
  <Container>
    <Slider
      {...props}
      railStyle={{backgroundColor: 'var(--color-secondary)'}}
      trackStyle={{backgroundColor: 'var(--color-action)'}}
      handleStyle={{
        borderColor: 'var(--color-action)',
        backgroundColor: 'var(--color-action)',
      }}
    />
  </Container>
);
