/*
 * nOTE: This component isn't complete and isn't intended to. Instead, it's
 * used to show that you should be using the <ControlSelect> component instead.
 */

import React from 'react';
import { useSelect } from 'downshift';
import cntl from 'cntl';
import { OutlineButtonSecondary } from 'src/components/controls/OutlineButton';

interface AccentSelectOption {
  label: string;
  value: number | string;
}

interface AccentSelectProps {
  className?: string;
  initialSelectedItem?: AccentSelectOption;
  onChange?: (option: AccentSelectOption) => void;
  options: AccentSelectOption[];
}


export function AccentSelect(props: AccentSelectProps) {
  const {
    isOpen,
    selectedItem,
    getToggleButtonProps,
    getLabelProps,
    getMenuProps,
    highlightedIndex,
    getItemProps,
  } = useSelect({
    initialSelectedItem: props.initialSelectedItem,
    items: props.options,
    itemToString: (option) => option?.label ?? '',
    onSelectedItemChange: (change) => {
      if (change.selectedItem) {
        props.onChange?.(change.selectedItem);
      }
    },
  });

  return (
    <div className={cntl`relative ${props.className ?? ''}`}>
      <OutlineButtonSecondary {...getToggleButtonProps()} className="w-full">
        {selectedItem?.label ?? 'Elements'}
      </OutlineButtonSecondary>
      {isOpen && (
        <div
          {...getMenuProps()}
          className={cntl`
          absolute
          bg-outline
          flex
          flex-col
          max-h-32
          overflow-y-auto
          top-full
          w-full
          z-10
        `}
        >
          {props.options.map((option, index) => (
            <button
              style={
                highlightedIndex === index ? { backgroundColor: '#bde4ff' } : {}
              }
              key={`${option.value}${index}`}
              {...getItemProps({ item: option, index })}
              className={cntl`
                px-2
                py-1
              `}
            >
              <span {...getLabelProps(option)}>{option.label}</span>
            </button>
          ))}
        </div>
      )}
      <div tabIndex={0} />
    </div>
  );
}
