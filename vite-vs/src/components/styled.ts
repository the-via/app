import styled from 'styled-components';

export const Row = styled.div`
  display: flex;
  flex-direction: row;
  flex-flow: wrap;
  width: 100%;
  margin: 0 auto;
  max-width: 1000px;
`;

export const Message = styled.span`
  font-size: 18px;
  margin: 8px;
  text-align: center;
`;

export const ErrorMessage = styled(Message)`
  color: #d15e5e;
`;

export const SuccessMessage = styled(Message)`
  color: #9ab46a;
`;
