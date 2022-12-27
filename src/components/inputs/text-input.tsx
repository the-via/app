import styled from 'styled-components';

const TextInput = styled.input`
  background: none;
  border: none;
  border-bottom: 1px solid var(--color_dark-accent);
  color: var(--color_accent);
  font-size: 1rem;
  margin-bottom: 1.5rem;
  padding: 0.5rem;
  transition: all 0.4s ease-out;

  &:focus {
    border-color: var(--color_accent);
    color: var(--color_accent);
    outline: none;
  }

  &::placeholder {
    color: var(--color_dark-grey);
  }
`;

export default TextInput;

export const ErrorInput = styled(TextInput)`
  // FIXME: Use standard colors
  border-color: #d15e5e;
  color: #d15e5e;
`;
