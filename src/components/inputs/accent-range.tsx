import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const Container = styled.span`
  display: inline-flex;
  align-items: center;
  line-height: initial;
  gap: 10px;
`;

const SliderInput = styled.input.attrs({type: 'range'})<any>`
  accent-color: var(--color_accent);
  width: 200px;
  flex: none;
`;

const ValueDisplay = styled.span`
  text-align: right;
  font-size: 20px;
  color: var(--color_label_highlighted);
  white-space: nowrap;
`;

export const AccentRange: React.FC<
  Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> & {
    onChange: (x: number) => void;
  }
> = (props) => {
  const [currentValue, setCurrentValue] = useState<number>(
    Number(props.defaultValue || props.value || props.min || 0)
  );

  useEffect(() => {
    const newValue = Number(props.defaultValue || props.value || props.min || 0);
    setCurrentValue(newValue);
  }, [props.defaultValue, props.value, props.min]);

  return (
    <Container>
      <ValueDisplay>{currentValue}</ValueDisplay>
      <SliderInput
        {...props}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          const newValue = +e.target.value;
          setCurrentValue(newValue);
          props.onChange && props.onChange(newValue);
        }}
      />
    </Container>
  );
};
