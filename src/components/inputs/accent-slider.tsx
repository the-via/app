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
    ${
      isChecked
        ? 'group-hover:-translate-x-[calc(100%_+_3px)]'
        : 'group-hover:translate-x-[3px]'
    }
  `;
}

export interface AccentSliderProps extends Omit<
  React.HTMLProps<HTMLLabelElement>,
  'onChange'
> {
  /** @deprecated: prefer defaultChecked */
  isChecked?: boolean;
  onChange: (val: boolean) => void;
}

export function AccentSlider(props: AccentSliderProps) {
  const {className, defaultChecked, onChange} = props;
  const [isChecked, setIsChecked] = React.useState(
    defaultChecked || props.isChecked || false,
  );

  const handleChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const isChecked = e.target.checked;

      setIsChecked(isChecked);
      onChange(isChecked);
    },
    [setIsChecked, onChange],
  );

  const labelClassName = cntl`
    bg-outline
    border-2
    cursor-pointer
    duration-200
    ease-out
    group
    p-1
    relative
    rounded
    rounded-lg
    transition-[border-color]
    w-16
    ${isChecked ? 'border-action' : 'border-outline'}
    ${className}
  `;

  return (
    <label className={labelClassName}>
      <input
        checked={isChecked}
        className="display-none opacity-0 w-0 h-0 absolute"
        onChange={handleChange}
        type="checkbox"
      />
      <div className={sliderClassName({isChecked})} />
    </label>
  );
}
