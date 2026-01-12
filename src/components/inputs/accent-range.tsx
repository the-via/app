import React, {useState, useEffect} from 'react';
import styled from 'styled-components';
import {useAppSelector} from 'src/store/hooks';
import {getShowSliderValuesMode} from 'src/store/settingsSlice';
import {NumberInput} from 'src/components/panes/configure-panes/submenus/macros/keycode-sequence-components';

const Container = styled.span<{$mode?: number}>`
  display: inline-flex;
  align-items: center; /* Changed from space-between to center */
  line-height: initial;
  gap: ${(props) => (props.$mode === 1 ? '10px' : '8px')};
  width: ${(props) => {
    switch (props.$mode) {
      case 0:
        return '200px'; // Slider only
      case 1:
        return 'auto'; // Slider + value display
      case 2:
        return '280px'; // Slider + input field
      default:
        return '200px';
    }
  }};
`;

const SliderInput = styled.input.attrs({type: 'range'})<any>`
  accent-color: var(--color_accent);
  width: ${(props) => {
    switch (props.$mode) {
      case 0:
        return '100%'; // Full width when alone
      case 1:
        return '200px'; // Fixed width with value display
      case 2:
        return '180px'; // Smaller with input field
      default:
        return '100%';
    }
  }};
  flex: none;
`;

const ValueDisplay = styled.span`
  text-align: right;
  font-size: 20px;
  color: var(--color_label_highlighted);
  white-space: nowrap;
  min-width: 40px;
`;

const StyledNumberInput = styled(NumberInput)`
  width: 80px;
  flex: none;
`;

export const AccentRange: React.FC<
  Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> & {
    onChange: (x: number) => void;
  }
> = (props) => {
  // Get the display mode from Redux store (0, 1, or 2)
  const displayMode = useAppSelector(getShowSliderValuesMode);

  // Convert string mode to numeric mode
  const numericMode =
    displayMode === 'Slider Only'
      ? 0
      : displayMode === 'Slider & Show Value'
      ? 1
      : displayMode === 'Slider & Input Field'
      ? 2
      : 0;

  const [currentValue, setCurrentValue] = useState<number>(
    Number(props.defaultValue || props.value || props.min || 0),
  );

  useEffect(() => {
    const newValue = Number(
      props.defaultValue || props.value || props.min || 0,
    );
    setCurrentValue(newValue);
  }, [props.defaultValue, props.value, props.min]);

  const handleChange = (newValue: number) => {
    setCurrentValue(newValue);
    props.onChange && props.onChange(newValue);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = +e.target.value;
    handleChange(newValue);
  };

  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = +e.target.value;
    handleChange(newValue);
  };

  return (
    <Container $mode={numericMode}>
      {/* Mode 1: Show value display */}
      {numericMode === 1 && <ValueDisplay>{currentValue}</ValueDisplay>}

      {/* Always show slider */}
      <SliderInput
        {...props}
        $mode={numericMode} /* Pass numeric mode here too */
        value={currentValue}
        onChange={handleSliderChange}
      />

      {/* Mode 2: Show input field */}
      {numericMode === 2 && (
        <StyledNumberInput
          {...props}
          type="number"
          value={currentValue}
          onChange={handleNumberInputChange}
        />
      )}
    </Container>
  );
};
