import {PropsWithChildren, useCallback, useEffect, useRef} from 'react';
import styled from 'styled-components';
import {AccentButton} from './accent-button';
import {ModalContainer, PromptText} from './dialog-base';
import {useTranslation} from 'react-i18next';

const MessageDialogContainer = styled.dialog`
  padding: 0;
  border-width: 0;

  background: transparent;
  &::backdrop {
    background: rgba(0, 0, 0, 0.75);
  }

  & > div {
    transition: transform 0.2s ease-out;
    transform: translateY(-20px);
  }

  &[open] > div {
    transform: translateY(0px);
  }
`;
const Controls = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;
export const MessageDialog: React.FC<
  PropsWithChildren<{
    isOpen: boolean;
    onConfirm?(): void;
    onCancel?(): void;
    confirmLabel?: string;
  }>
> = (props) => {
  const {t} = useTranslation();
  const ref = useRef<HTMLDialogElement>(null);
  const closeModal = useCallback(() => {
    if (ref.current) {
      ref.current.close();
    }
  }, [ref.current]);
  useEffect(() => {
    if (ref.current) {
      if (props.isOpen) {
        ref.current.showModal();
      } else {
        ref.current.close();
      }
    }
    return () => {
      closeModal();
    };
  }, [props.isOpen]);
  return (
    <MessageDialogContainer
      ref={ref}
      onCancel={(evt) => {
        evt.preventDefault();
        props.onCancel?.();
      }}
    >
      <ModalContainer>
        <PromptText>{props.children}</PromptText>
        <Controls>
          <AccentButton
            onClick={() => {
              props.onConfirm?.();
              closeModal();
            }}
          >
            {t(props.confirmLabel || 'Confirm')}
          </AccentButton>
        </Controls>
      </ModalContainer>
    </MessageDialogContainer>
  );
};
