import styled from 'styled-components';

export const KeyboardRouteGroup = styled.div<{
  $position: number;
}>`
  position: absolute;
  left: 0;
  transform: translateX(${(p) => p.$position * 100}vw);
  height: 500px;
  width: 100vw;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;
