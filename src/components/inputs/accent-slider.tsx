import * as React from 'react';
import styled from 'styled-components';

export const HiddenInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;
`;

const Switch = styled.label`
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
`;
const Slider = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${props =>
    props.isChecked ? 'var(--color_accent)' : 'var(--color_dark-grey)'};
  -webkit-transition: 0.4s;
  transition: 0.4s;
  border-radius: 4px;
  &:before {
    position: absolute;
    content: '';
    height: 26px;
    width: 26px;
    left: 4px;
    bottom: 4px;
    border-radius: 4px;
    background-color: ${props =>
      !props.isChecked
        ? 'var(--color_medium-grey)'
        : 'var(--color_light-grey)'};
    -webkit-transition: 0.4s;
    transition: 0.4s;
    ${props => (props.isChecked ? 'transform: translateX(26px)' : '')};
  }
`;

type Props = {
  isChecked: boolean;
  onChange: (val: boolean) => void;
};

export function AccentSlider(props: Props) {
  const { isChecked, onChange } = props;

  const [isHiddenChecked, setIsHiddenChecked] = React.useState(isChecked);

  // If the parent isChecked changes, update our local checked state
  React.useEffect(() => {
    setIsHiddenChecked(isChecked);
  }, [isChecked]);

  const hiddenOnChange = () => {
    setIsHiddenChecked(!isChecked);
    onChange(!isChecked);
  };

  return (
    <Switch>
      <HiddenInput type="checkbox" checked={isHiddenChecked} onChange={hiddenOnChange} />
      <Slider isChecked={isHiddenChecked} />
    </Switch>
  );
}
