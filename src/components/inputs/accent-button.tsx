import styled from 'styled-components';

type AccentButtonProps = {
  disabled?: boolean;
  onClick?: (...a: any[]) => void;
};

const AccentButtonBase = styled.button<AccentButtonProps>`
  height: 40px;
  padding: 0 15px;
  line-height: 40px;
  min-width: 100px;
  text-align: center;
  outline: none;
  font-size: 20px;
  border-radius: 5px;
  color: var(--color_accent);
  border: 1px solid var(--color_accent);
  display: inline-block;
  box-sizing: border-box;
  pointer-events: ${(props) => (props.disabled ? 'none' : 'auto')};
  cursor: ${(props) => (props.disabled ? 'not-allowed' : 'pointer')};

  &:hover {
    border: 1px solid var(--color_accent);
  }
`;
export const AccentButton = styled(AccentButtonBase)`
  background-color: ${(props) =>
    props.disabled ? 'var(--bg_control-disabled)' : 'var(--bg_outside-accent)'};
  color: ${(props) =>
    props.disabled ? 'var(--bg_control)' : 'var(--color_accent)'};
  border-color: ${(props) =>
    props.disabled ? 'var(--bg_control)' : 'var(--color_accent)'};

  &:hover {
    filter: brightness(0.7);
  }
`;
export const AccentButtonLarge = styled(AccentButton)`
  font-size: 24px;
  line-height: 60px;
  height: 60px;
`;

export const PrimaryAccentButton = styled(AccentButtonBase)`
  color: ${(props) =>
    props.disabled ? 'var(--bg_control)' : 'var(--color_inside-accent)'};
  border-color: ${(props) =>
    props.disabled ? 'var(--bg_control)' : 'var(--color_accent)'};
  background-color: ${(props) =>
    props.disabled ? 'transparent' : 'var(--color_accent)'};
  &:hover {
    filter: brightness(0.7);
  }
`;
