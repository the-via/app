import styled from 'styled-components';

export enum Direction {
  Left,
  Right
}

export const CarouselButton = styled.button<{direction: Direction}>`
  display: block;
  margin: 0;
  padding: 0;
  background: none;
  border-color: transparent;
  text-decoration: none;
  color: #ffffff;
  cursor: pointer;
  text-align: center;
  transition: background 250ms ease-in-out, transform 150ms ease;
  -webkit-appearance: none;
  -moz-appearance: none;
  border-left: 24px solid transparent;
  border-right: 24px solid transparent;
  border-bottom: 15px solid #717070;
  position: absolute;
  outline: none;

  ${props =>
    props.direction === Direction.Right
      ? 'transform: rotate(90deg); right: -6px;'
      : 'transform: rotate(-90deg); left: -6px;'}

  :hover {
    border-bottom-color: #505050;
  }

  :disabled {
    border-bottom-color: #d8d8d8;
    cursor: initial;
  }
`;
