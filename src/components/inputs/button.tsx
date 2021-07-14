import styled from 'styled-components';

export const Button = styled.div`
  display: flex;
  transition: transform 0.2s ease-out;
  user-select: none;
  color: #717070;
  border: 1px #717070 solid;
  width: 45px;
  height: 45px;
  padding: 2px;
  margin: 2px;
  text-overflow: ellipsis;
  overflow: hidden;
  cursor: pointer;
  font-size: 12px;
  text-align: center;
  border-radius: 4px;
  justify-content: center;
  align-items: center;
  white-space: pre-wrap;
  box-shadow: #8c8c8c 0 1px 0 0;
  &:hover {
    transform: translate3d(0, -2px, 0);
  }
`;

export default Button;
