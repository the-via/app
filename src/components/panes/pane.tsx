import styled from 'styled-components';

export const Pane = styled.div`
  background: var(--gradient);
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  background: var(--gradient);
`;

export const CenterPane = styled(Pane)`
  overflow: auto;
  display: block;
`;
