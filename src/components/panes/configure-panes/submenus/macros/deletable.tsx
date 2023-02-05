import {faXmarkCircle} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {PropsWithChildren} from 'react';
import styled from 'styled-components';
const DeletableContainer = styled.div`
  display: inline-flex;
  vertical-align: middle;
  position: relative;
  svg {
    color: var(--bg_icon-highlighted);
    position: absolute;
    right: -5px;
    top: 6px;
    opacity: 0;
    cursor: pointer;
    transition: transform 0.2s ease-in-out;
    background: var(--bg_icon);
    border-radius: 50%;
    transform: scale(0.8);
  }
  &:hover svg {
    opacity: 1;
    transform: scale(1);
  }
`;

export const Deletable: React.FC<
  PropsWithChildren<{index: number; deleteItem: (index: number) => void}>
> = (props) => {
  return (
    <DeletableContainer>
      {props.children}
      <FontAwesomeIcon
        icon={faXmarkCircle}
        size={'lg'}
        onClick={() => props.deleteItem(props.index)}
      />
    </DeletableContainer>
  );
};
