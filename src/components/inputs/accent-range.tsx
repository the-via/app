import React from 'react';
import styled from 'styled-components';

const Container = styled.span`
  display: inline-block;
  line-height: initial;
  width: 200px;
`;

const SliderInput = styled.input.attrs({type: 'range'})<any>`
  accent-color: var(--color_accent);
  width: 100%;
`;

export const AccentRange: React.VFC<
  React.InputHTMLAttributes<HTMLInputElement> & {onChange: (x: number) => void}
> = (props) => (
  <Container>
    <SliderInput
      {...props}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
        props.onChange && props.onChange(+e.target.value);
      }}
    />
  </Container>
);
