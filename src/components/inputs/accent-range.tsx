import React, {useState} from 'react';
import styled from 'styled-components';
import {NumberInput} from 'src/components/panes/configure-panes/submenus/macros/keycode-sequence-components';

const Container = styled.span`
  display: flex;
  gap: 10px;
  align-items: space-between;
  line-height: initial;
  width: 200px;
`;

const SliderInput = styled.input.attrs({type: 'range'})<any>`
  accent-color: var(--color_accent);
  width: 100%;
`;

export const AccentRange: React.FC<
  Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> & {
    onChange: (x: number) => void;
  }
> = (props) => {
  const [value, setValue] = useState<number>(
    (props.defaultValue as number) || 0,
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = +e.target.value;
    setValue(newValue);
    props.onChange && props.onChange(newValue);
  };

  return (
    <Container>
      <SliderInput {...props} value={value} onChange={handleChange} />
      <NumberInput {...props} value={value} onChange={handleChange} />
    </Container>
  );
};
