import styled from 'styled-components';

export const Pane = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
`;

export const CenterPane = styled(Pane)`
  overflow: auto;
  display: block;
`;
