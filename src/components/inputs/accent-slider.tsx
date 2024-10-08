import React, {useRef} from 'react';
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
const Slider = styled.span<{$ischecked?: boolean}>`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${(props) =>
    props.$ischecked ? 'var(--color_accent)' : 'var(--bg_control)'};
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
    background-color: ${(props) =>
      !props.$ischecked ? 'var(--bg_icon)' : 'var(--color_inside-accent)'};
    -webkit-transition: 0.4s;
    transition: 0.4s;
    ${(props) => (props.$ischecked ? 'transform: translateX(26px)' : '')};
  }
`;

type Props = {
  isChecked: boolean;
  id?:string
  onChange: (val: boolean) => void;
};

export function AccentSlider(props: Props) {
  const {isChecked, onChange} = props;

  const [isHiddenChecked, setIsHiddenChecked] = React.useState(isChecked);
  const ref = useRef<HTMLInputElement>(null);

  // If the parent isChecked changes, update our local checked state
  React.useEffect(() => {
    setIsHiddenChecked(isChecked);
  }, [isChecked]);

  const hiddenOnChange = () => {
    const newIsChecked = !isChecked;
    setIsHiddenChecked(newIsChecked);
    onChange(newIsChecked);
    if (ref.current) {
      ref.current.blur();
    }
  };

  return (
    <Switch>
      <HiddenInput
        ref={ref}
        role='switch'
        id={props.id}
        type="checkbox"
        checked={isHiddenChecked}
        onChange={hiddenOnChange}
      />
      <Slider $ischecked={isHiddenChecked} />
    </Switch>
  );
}
