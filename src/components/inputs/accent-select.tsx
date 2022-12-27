import React from 'react';
import Select, {Props} from 'react-select';
const customStyles = {
  option: (provided: any, state: any) => {
    return {
      ...provided,
      '&:hover': {
        backgroundColor: state.isSelected
          ? 'var(--color_accent)'
          : 'var(--bg_control)',
      },
      ':active': {
        backgroundColor: 'var(--bg_control)',
      },
      background: state.isSelected
        ? 'var(--color_accent)'
        : state.isFocused
        ? 'var(--bg_control)'
        : 'var(--bg_menu)',
      color: state.isSelected
        ? 'var(--color_inside-accent)'
        : state.isFocused
        ? 'var(--color_accent)'
        : 'var(--color_accent)',
    };
  },
  container: (provided: any) => ({
    ...provided,
    lineHeight: 'initial',
    flex: 1,
  }),
  input: (provided: any) => ({
    ...provided,
    color: 'var(--color_accent)',
    opacity: 0.5,
  }),
  singleValue: (provided: any) => ({
    ...provided,
    color: 'var(--color_accent)',
  }),
  dropdownIndicator: (provided: any) => ({
    ...provided,
    color: 'var(--color_accent)',
  }),
  indicatorSeparator: (provided: any) => ({
    ...provided,
    backgroundColor: 'var(--color_accent)',
  }),
  menuList: (provided: any) => ({
    ...provided,
    borderColor: 'var(--color_accent)',
    backgroundColor: 'var(--bg_menu)',
  }),
  placeholder: (provided: any) => ({
    ...provided,
    color: 'var(--color_accent)',
  }),
  valueContainer: (provided: any) => ({
    ...provided,
    ':active': {
      backgroundColor: 'var(--bg_control)',
      borderColor: 'var(--color_accent)',
    },
    '&:hover': {
      borderColor: 'var(--color_accent)',
    },
    color: 'var(--color_accent)',
    background: 'var(--bg_menu)',
  }),
  control: (provided: any, state: any) => {
    const res = {
      ...provided,
      boxShadow: 'none',
      ':active': {
        backgroundColor: 'transparent',
        borderColor: 'var(--color_accent)',
      },
      '&:hover': {
        borderColor: 'var(--color_accent)',
      },
      color: 'var(--color_accent)',
      borderColor: '1px solid var(--color_accent)',
      background: 'var(--bg_menu)',
      overflow: 'hidden',
      width: state.selectProps.width || 250,
    };
    return res;
  },
};

export const AccentSelect: React.VFC<Props> = (props) => (
  <Select {...props} styles={customStyles} />
);
