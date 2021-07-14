import * as React from 'react';
import Select from 'react-select';
const customStyles = {
  option: (provided, state) => {
    return {
      ...provided,
      '&:hover': {
        backgroundColor: state.isSelected
          ? 'var(--color_accent)'
          : 'var(--color_dark-grey)'
      },
      ':active': {
        backgroundColor: 'var(--color_dark-grey)'
      },
      background: state.isSelected
        ? 'var(--color_accent)'
        : state.isFocused
        ? 'var(--color_dark-grey)'
        : 'var(--color_light-jet)',
      color: state.isSelected
        ? 'var(--color_light-jet)'
        : state.isFocused
        ? 'var(--color_accent)'
        : 'var(--color_accent)'
    };
  },
  container: provided => ({
    ...provided,
    lineHeight: 'initial',
    flex: 1
  }),
  input: provided => ({
    ...provided,
    color: 'var(--color_accent)',
    opacity: 0.5
  }),
  singleValue: provided => ({
    ...provided,
    color: 'var(--color_accent)'
  }),
  dropdownIndicator: provided => ({
    ...provided,
    color: 'var(--color_accent)'
  }),
  indicatorSeparator: provided => ({
    ...provided,
    backgroundColor: 'var(--color_accent)'
  }),
  menuList: provided => ({
    ...provided,
    borderColor: 'var(--color_accent)',
    backgroundColor: 'var(--color_light-jet)'
  }),
  placeholder: provided => ({
    ...provided,
    color: 'var(--color_accent)'
  }),
  valueContainer: provided => ({
    ...provided,
    ':active': {
      backgroundColor: 'var(--color_dark-grey)',
      borderColor: 'var(--color_accent)'
    },
    '&:hover': {
      borderColor: 'var(--color_accent)'
    },
    color: 'var(--color_accent)',
    background: 'var(--color_light-jet)'
  }),
  control: (provided, state) => {
    const res = {
      ...provided,
      boxShadow: 'none',
      ':active': {
        backgroundColor: 'transparent',
        borderColor: 'var(--color_accent)'
      },
      '&:hover': {
        borderColor: 'var(--color_accent)'
      },
      color: 'var(--color_accent)',
      borderColor: '1px solid var(--color_accent)',
      background: 'var(--color_light-jet)',
      overflow: 'hidden',
      width: state.selectProps.width || 250
    };
    return res;
  }
};

export const AccentSelect = props => (
  <Select {...props} styles={customStyles} />
);
