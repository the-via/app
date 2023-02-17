import styled from 'styled-components';

export const ModalBackground = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.75);
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2;
`;

export const ModalContainer = styled.div`
  border: 2px solid var(--color_accent);
  min-width: 460px;
  max-width: 550px;
  min-height: 200px;
  background-color: var(--bg_menu);
  border-radius: 6px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  padding: 20px;
  box-sizing: border-box;
`;

export const PromptText = styled.div`
  font-weight: 500;
  user-select: none;
  color: var(--color_label);
  font-size: 20px;
  margin-bottom: 20px;
  text-align: center;
`;

export const RowDiv = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 220px;
  gap: 20px;
`;
