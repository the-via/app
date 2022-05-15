import React from 'react';
import Slider, { SliderProps} from 'rc-slider';
import styled from 'styled-components';

const Container = styled.span`
  display: inline-block;
  line-height: initial;
  width: 200px;
`;

export const AccentRange: React.VFC<SliderProps> = (props) => (
  <Container>
    <Slider
      railStyle={{backgroundColor: 'var(--color-outline)'}}
      trackStyle={{backgroundColor: 'var(--color-action)'}}
      handleStyle={{
        borderColor: 'var(--color-action)',
        backgroundColor: 'var(--color-action)',
      }}
      {...props}
    />
  </Container>
);
