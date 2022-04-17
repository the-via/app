import React from 'react';
import getIconColor from '../icons/get-icon-color';
import styled from 'styled-components';
import cntl from 'cntl';
import type {ButtonHTMLAttributes} from 'react';

export const Grid1Col = styled.div`
  height: 100%;
  width: 100%;
  display: grid;
  grid-template-rows: minmax(350px, min-content) minmax(0, 1fr);
  grid-template-columns: 100vw;
`;
export const Grid = styled.div`
  height: 100%;
  width: 100%;
  display: grid;
  grid-template-rows: minmax(350px, min-content) minmax(0, 1fr);
  grid-template-columns: min-content minmax(0, 1fr);
`;

export const Cell = styled.div`
  background: var(--color_light-jet);
  border-right: 1px solid var(--color_dark-grey);
`;

export const OverflowCell = styled(Cell)`
  border-top: 1px solid var(--color_dark-grey);
  overflow: auto;
  background: var(--color_light-jet);
`;

export const SubmenuCell = styled(Cell)`
  border-top: 1px solid var(--color_dark-grey);
  grid-area: 2 / 1 / 3 / 2;
`;

export const SubmenuOverflowCell = styled(SubmenuCell)`
  overflow: auto;
`;

export const FlexCell = styled(Cell)`
  display: flex;
  overflow: hidden;
  justify-content: center;
  align-items: center;
  padding: 50px 10px;
  position: relative;
  background: var(--gradient);
`;

const iconContainerClassName = cntl`
  flex
  justify-center
  text-center
  w-full
`;

interface IconContainerProps extends React.HTMLProps<HTMLSpanElement> {}

export function IconContainer(props: IconContainerProps) {
  const {className = '', ...rest} = props;

  return (
    <span className={`${iconContainerClassName} ${className}`} {...rest} />
  );
}

export const ControlRow = styled.div`
  position: relative;
  width: 100%;
  max-width: 960px;
  border-bottom: 1px solid var(--color_light-jet);
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
  color: var(--color_medium-grey);
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

const rowClassName = ({isSelected}: {isSelected: boolean}) => cntl`
  appearance-none
  gap-4
  grid
  grid-cols-[2rem_1fr]
  items-center
  justify-center
  text-left
  text-xl
  uppercase
  ${isSelected ? 'hover:color-medium' : 'hover:color-dark'}
  ${isSelected ? 'text-light' : 'text-medium'}
`;

interface RowProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  isSelected?: boolean;
}

export function Row(props: RowProps) {
  const {className = '', isSelected = false, ...buttonProps} = props;

  return (
    <button
      className={`${rowClassName({isSelected})} ${className}`}
      {...buttonProps}
    />
  );
}

interface RowIconProps extends React.SVGProps<SVGSVGElement> {
  children: React.SVGProps<SVGSVGElement>;
}

export const SubmenuRow = styled(Row)`
  padding-left: 8px;
`;
