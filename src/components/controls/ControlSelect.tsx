import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import cntl from 'cntl';
import ChevronDown from 'src/components/icons/chevron-down';
import {useAppSelector} from 'src/store/hooks';
import {getTheme} from 'src/store/settingsSlice';

type SelectProps = Omit<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  'onChange'
>;

interface ControlSelectProps extends SelectProps {
  onChange: (value: HTMLOptionElement['value']) => void;
  options: React.OptionHTMLAttributes<HTMLOptionElement>[];
}

// All bg- styles are used for displaying the down chevron
const controlSelectClassName = cntl`
  appearance-none
  bg-[length:0.8rem]
  bg-[right_1rem_center]
  bg-background
  bg-no-repeat
  border-2
  border-action
  font-medium
  pl-4
  pr-12
  py-2
  rounded-md
  text-action
  truncate
`;

export default function ControlSelect(props: ControlSelectProps) {
  const {className, options, defaultValue, style, onChange, ...restProps} =
    props;
  const [selectedOption, setSelectedOption] = React.useState(defaultValue);
  const theme = useAppSelector(getTheme);

  const selectClassName = cntl`
    ${controlSelectClassName}
    ${className}
  `;

  const Options = React.useMemo(() => {
    return props.options.map((option) => {
      const {value: optionValue, ...restOption} = option;

      return (
        <option
          selected={selectedOption === optionValue}
          value={optionValue}
          {...restOption}
        />
      );
    });
  }, [props.options]);

  const handleChange = React.useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedValue = e.target.options[e.target.selectedIndex].value;
      setSelectedOption(selectedValue);
      props.onChange?.(selectedValue);
    },
    [props.onChange],
  );

  const selectStyle = React.useMemo(() => {
    const bodyStyle = getComputedStyle(document.body);
    const actionColor = bodyStyle.getPropertyValue('--color-action').trim();

    const ChevronDownFillAction = (
      <ChevronDown
        style={{
          // # is reserved for URLs
          fill: actionColor.replace(/#/, '%23'),
        }}
      />
    );
    const chevronDownString = renderToStaticMarkup(ChevronDownFillAction);

    return {
      ...style,
      backgroundImage: `url('data:image/svg+xml;utf8,${chevronDownString}')`,
    };
  }, [theme]);

  return (
    <select
      className={selectClassName}
      onChange={handleChange}
      style={selectStyle}
      {...restProps}
    >
      {Options}
    </select>
  );
}
