import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';

const Container = styled.span`
  display: flex;
  align-items: center;
  line-height: initial;
  width: 250px; // Increase the width
`;

const SliderInput = styled.input.attrs({type: 'range'})`
  accent-color: var(--color_accent);
  width: 100%;
`;

const ValueDisplay = styled.span`
  margin-right: 10px;
  width: 50px; // Set a fixed width
  text-align: right; // Align the text to the right
  flex-shrink: 0; // Prevent it from shrinking
`;

export const AccentRange: React.FC<
  Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'type'> & {
    onChange: (x: number) => void;
  }
> = (props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [sliderValue, setSliderValue] = useState(0); // Initialize with 0

  useEffect(() => {
    if (inputRef.current) {
      setSliderValue(+inputRef.current.value || 0); // Provide a default value
    }
  }, [props.value]);

  return (
    <Container>
      <ValueDisplay>{sliderValue}</ValueDisplay>
      <SliderInput
        ref={inputRef}
        {...props}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          const value = +e.target.value;
          setSliderValue(value);
          props.onChange?.(value);
        }}
      />
    </Container>
  );
};
