import React from 'react';
import styled from 'styled-components';
import { AccentButtonLarge } from '../inputs/accent-button';

interface InformationModalProps {
  children?: React.ReactNode;
  closeModal: Function;
}

const ModalBackgroundDiv = styled.div`
  background-color: rgba(0,0,0,0.7);
  display: flex;
  flex-wrap: wrap;
  position: fixed;
  right: 0;
  top: 0;
  justify-content: center;
  align-content: center;
  height: 100%;
  width: 100%;
  z-index: 2;
  padding: 0;
  margin: 0;
`;

const ModalDiv = styled.div`
  background: var(--bg_gradient);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-content: center;
  height: wrap-content;
  max-width: 80em;
  border: 0.5em solid var(--border_color_cell);
  border-radius: 0.5em;
  padding: 1em;
`;

export const InformationModal: React.FC<InformationModalProps> = ({ children, closeModal }) => (
  <ModalBackgroundDiv>
    <ModalDiv>
      {children}
      <AccentButtonLarge onClick={() => closeModal()}>Okay</AccentButtonLarge>
    </ModalDiv>
  </ModalBackgroundDiv>
);
