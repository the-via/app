import styled from 'styled-components';
export const IconButton = styled.button`
  border: 1px solid var(--color_dark-grey);
  outline: none;
  background: none;
  padding: 0 8px;
  vertical-align: top;
  border-top: none;
  cursor: pointer;
  height: 26px;
  color: var(--color-dark-grey);
  &:active {
    outline: none;
  }

  &:hover {
    background: var(--color_medium-grey);
  }
`;

export const LeftIconButton = styled(IconButton)`
  border-bottom-left-radius: 6px;
`;

export const RightIconButton = styled(IconButton)`
  margin-left: -1px;
  border-bottom-right-radius: 6px;
`;
