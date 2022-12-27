import getIconColor from '../icons/get-icon-color';
import styled from 'styled-components';
export const Grid1Col = styled.div`
  height: 100%;
  width: 100%;
  display: grid;
  grid-template-columns: 100vw;
`;
export const Grid = styled.div`
  height: 100%;
  width: 100%;
  display: grid;
  grid-template-columns: min-content min-content minmax(0, 1fr);
  > div {
    pointer-events: all;
  }
`;

export const Cell = styled.div`
  border-right: 1px solid var(--border_color_cell);
`;

export const MenuCell = styled(Cell)`
  background: var(--bg_menu);
`;

export const OverflowCell = styled(Cell)`
  border-top: 1px solid var(--border_color_cell);
  overflow: auto;
`;

export const SpanOverflowCell = styled(Cell)`
  border-top: 1px solid var(--border_color_cell);
  overflow: auto;
  grid-column: span 2;
`;

export const SubmenuCell = styled(Cell)`
  border-top: 1px solid var(--border_color_cell);
`;

export const SubmenuOverflowCell = styled(SubmenuCell)`
  overflow: auto;
`;

export const SinglePaneFlexCell = styled(Cell)`
  display: flex;
  overflow: hidden;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
`;

export const ConfigureFlexCell = styled(SinglePaneFlexCell)`
  pointer-events: none;
  height: 500px;
`;

export const IconContainer = styled.span`
  display: inline-block;
  text-align: center;
  width: 35px;
  position: relative;
  &:hover > span > div {
    background-color: red;
  }
`;

export const ControlRow = styled.div`
  position: relative;
  width: 100%;
  max-width: 960px;
  border-bottom: 1px solid var(--border_color_cell);
  font-size: 20px;
  justify-content: space-between;
  display: flex;
  line-height: 50px;
  min-height: 50px;
  box-sizing: border-box;
`;

export const SubControlRow = styled(ControlRow)``;

export const IndentedControlRow = styled(ControlRow)`
  padding-left: 12px;
`;

export const Label = styled.label`
  color: var(--color_label);
`;

export const SubLabel = styled(Label)`
  font-size: 18px;
  font-style: italic;
`;

export const Detail = styled.span`
  color: var(--color_accent);
  display: flex;
  align-items: center;
`;

export const Row = styled.div<{selected: boolean}>`
  cursor: pointer;
  white-space: nowrap;
  margin-bottom: 15px;
  font-size: 20px;
  height: 20px;
  line-height: 20px;
  text-transform: uppercase;
  color: ${(props) => getIconColor(props.selected).style.color};
  border-left: 2px solid
    ${(props) =>
      props.selected ? 'var(--bg_icon-highlighted)' : 'transparent'};

  svg {
    height: 20px;
    vertical-align: middle;
  }

  &:hover {
    color: var(--color_label-highlighted);
    & .tooltip {
      transform: scale(1) translateX(0px);
      opacity: 1;
    }
  }
  .tooltip {
    transform: translateX(-5px) scale(0.6);
    opacity: 0;
  }
`;

export const SubmenuRow = styled(Row)`
  padding-left: 8px;
`;
