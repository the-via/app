import React, {useState, useEffect} from 'react';
import styled from 'styled-components';
import {useAppSelector} from 'src/store/hooks';
import {getShowSliderValues} from 'src/store/settingsSlice';

const Container = styled.span<{$showValue?: boolean}>`
  display: inline-flex;
  align-items: center;
  line-height: initial;
  gap: ${(props) => (props.$showValue ? '10px' : '0')};
  width: ${(props) => (props.$showValue ? 'auto' : '200px')};
`;

const SliderInput = styled.input.attrs({type: 'range'})<any>`
  accent-color: var(--color_accent);
  width: ${(props) => (props.$showValue ? '200px' : '100%')};
  flex: none;
`;

const ValueDisplay = styled.span`
  text-align: right;
  font-size: 20px;
  color: var(--color_label_highlighted);
  white-space: nowrap;
  min-width: 40px;
`;

export const AccentRange: React.FC<
  Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> & {
    onChange: (x: number) => void;
  }
> = (props) => {
  // Get the "hide values" setting from Redux (assuming it returns true when values should be hidden)
  const hideValues = useAppSelector(getShowSliderValues);
  const showValue = !hideValues; // Show values when they are NOT hidden

  const [currentValue, setCurrentValue] = useState<number>(
    Number(props.defaultValue || props.value || props.min || 0),
  );

  useEffect(() => {
    const newValue = Number(
      props.defaultValue || props.value || props.min || 0,
    );
    setCurrentValue(newValue);
  }, [props.defaultValue, props.value, props.min]);

  return (
    <Container $showValue={showValue}>
      {showValue && <ValueDisplay>{currentValue}</ValueDisplay>}
      <SliderInput
        {...props}
        $showValue={showValue}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          const newValue = +e.target.value;
          setCurrentValue(newValue);
          props.onChange && props.onChange(newValue);
        }}
      />
    </Container>
  );
};
