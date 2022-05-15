import React from 'react';
import cntl from 'cntl';

function sliderClassName({isChecked}: {isChecked: boolean}) {
  return cntl`
    bg-action
    duration-200
    ease-out
    h-6
    relative
    rounded-lg
    transition-all
    w-6
    ${isChecked ? '-translate-x-full left-full' : 'translate-x-0 left-0'}
  `;
}

type Props = {
  isChecked: boolean;
  onChange: (val: boolean) => void;
};

export function AccentSlider(props: Props) {
  const {isChecked, onChange} = props;

  const [isHiddenChecked, setIsHiddenChecked] = React.useState(isChecked);

  // If the parent isChecked changes, update our local checked state
  React.useEffect(() => {
    setIsHiddenChecked(isChecked);
  }, [isChecked]);

  const hiddenOnChange = React.useCallback(() => {
    setIsHiddenChecked((prevIsHiddenChecked) => !prevIsHiddenChecked);
    onChange(!isHiddenChecked);
  }, [isHiddenChecked]);

  const labelClassName = cntl`
    bg-outline
    border-2
    cursor-pointer
    duration-200
    ease-out
    p-1
    relative
    rounded
    rounded-lg
    transition-[border-color]
    w-16
    ${isHiddenChecked ? 'border-action' : 'border-outline'}
  `;

  return (
    <label className={labelClassName}>
      <input
        checked={isHiddenChecked}
        className="display-none opacity-0 w-0 h-0 absolute"
        onChange={hiddenOnChange}
        type="checkbox"
      />
      <div className={sliderClassName({isChecked: isHiddenChecked})} />
    </label>
  );
}
