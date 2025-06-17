import React from 'react';
import {getAutocompleteKeycodes} from '../../utils/autocomplete-keycodes';
import styled from 'styled-components';
const Keycode = styled.span`
  color: var(--color_accent);
  display: flex;
  padding-left: 10px;
`;

const KeycodeLabel = styled.span`
  color: var(--color_label);
  display: flex;
`;

const Item = styled.div<{$selected?: boolean}>`
  box-sizing: border-box;
  min-width: 150px;
  max-width: 300px;
  padding: 5px 10px;
  display: flex;
  justify-content: space-between;
  background-color: ${(props) =>
    !props.$selected ? 'var(--bg_menu)' : 'var(--bg_control)'};

  &:hover {
    background-color: var(--bg_control);
  }
`;

export const AutocompleteItem: React.FC<any> = ({
  selected,
  entity: {label, code},
}) => (
  <Item $selected={selected}>
    <KeycodeLabel>{label}</KeycodeLabel> <Keycode>{code}</Keycode>
  </Item>
);

export const AutocompleteLoading: React.FC<{}> = () => <div>Loading</div>;
export const findKeycodes = (token: string) => {
  const uToken = token.toUpperCase();
  return getAutocompleteKeycodes()
    .filter(({name, title, code}) =>
      title
        ? title.toUpperCase().indexOf(uToken) > -1
        : name.toUpperCase().indexOf(uToken) > -1 ||
          code.toUpperCase().indexOf(uToken) > -1,
    )
    .slice(0, 10)
    .map(({name, code, title}) => {
      const label = title ? title : name;
      return {label, code};
    });
};
