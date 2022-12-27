import styled from 'styled-components';

const TextInput = styled.input`
  background: none;
  border: none;
  border-bottom: 1px solid var(--color_accent);
  filter: brightness(0.7);
  color: var(--color_accent);
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
  padding: 0.5rem;
  transition: all 0.2s ease-out;

  &:focus {
    filter: brightness(1);
    color: var(--color_accent);
    outline: none;
  }

  &::placeholder {
    color: var(--color_control);
  }
`;

export default TextInput;

export const ErrorInput = styled(TextInput)`
  // FIXME: Use standard colors
  border-color: #d15e5e;
  color: #d15e5e;
`;
