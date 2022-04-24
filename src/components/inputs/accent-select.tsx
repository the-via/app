import React from 'react';
import Select, { Props as SelectProps } from 'react-select';

const customStyles = {
  option: (provided: any, state: any) => {
    return {
      ...provided,
      '&:hover': {
        backgroundColor: state.isSelected
          ? 'var(--color-action)'
          : null,
      },
      ':active': {
        backgroundColor: 'var(--color-action)',
      },
      background: state.isSelected
        ? 'var(--color-action)'
        : state.isFocused
        ? 'var(--color_dark-grey)'
        : 'var(--color_light-jet)',
      color: state.isSelected
        ? 'var(--color_light-jet)'
        : state.isFocused
        ? 'var(--color-action)'
        : 'var(--color-action)',
    };
  },
  container: (provided: any) => ({
    ...provided,
    lineHeight: 'initial',
  }),
  input: (provided: any) => ({
    ...provided,
    color: 'var(--color-action)',
    opacity: 0.5,
  }),
  singleValue: (provided: any) => ({
    ...provided,
    color: 'var(--color-action)',
  }),
  dropdownIndicator: (provided: any) => ({
    ...provided,
    color: 'var(--color-action)',
  }),
  indicatorSeparator: (provided: any) => ({
    ...provided,
    backgroundColor: 'var(--color-action)',
  }),
  menuList: (provided: any) => ({
    ...provided,
    borderColor: 'var(--color-action)',
  }),
  placeholder: (provided: any) => ({
    ...provided,
    color: 'var(--color-action)',
  }),
  valueContainer: (provided: any) => ({
    ...provided,
    ':active': {
      backgroundColor: 'var(--color_dark-grey)',
      borderColor: 'var(--color-action)',
    },
    '&:hover': {
      borderColor: 'var(--color-action)',
    },
    color: 'var(--color-action)',
  }),
  control: (provided: any, state: any) => {
    const res = {
      ...provided,
      boxShadow: 'none',
      ':active': {
        backgroundColor: 'transparent',
        borderColor: 'var(--color-action)',
      },
      '&:hover': {
        borderColor: 'var(--color-action)',
      },
      color: 'var(--color-outline)',
      borderColor: '1px solid var(--color-action)',
      overflow: 'hidden',
      width: '100%',
    };
    return res;
  },
};

export const AccentSelect: React.VFC<SelectProps> = (props) => (
  <Select {...props} styles={customStyles} />
);
