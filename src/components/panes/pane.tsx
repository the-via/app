import styled from 'styled-components';

export const Pane = styled.div`
  background: var(--gradient);
  display: flex;
  flex: 1;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background: var(--gradient);
`;

export const CenterPane = styled(Pane)`
  overflow: auto;
  display: block;
`;
