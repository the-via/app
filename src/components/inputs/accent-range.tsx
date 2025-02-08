import React, {useState, useRef, useEffect} from 'react';
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

interface AccentRangeProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'onChange' | 'type'
  > {
  onChange: (x: number) => void;
  showingSliderValue?: boolean; // Make showSliderValue optional
}

export const AccentRange: React.FC<AccentRangeProps> = (props) => {
  const {showingSliderValue = false} = props; // Default showSliderValue to false if not provided
  const inputRef = useRef<HTMLInputElement>(null);
  const [sliderValue, setSliderValue] = useState<number>(0); // Initialize with 0

  useEffect(() => {
    if (inputRef.current) {
      setSliderValue(+inputRef.current.value || 0); // Provide a default value
    }
  }, [props.value]);

  if (!showingSliderValue) {
    // Render original version without value display
    return (
      <Container>
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
  }

  // Render enhanced version with value display
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
