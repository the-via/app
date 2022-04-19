import React from 'react';
import cntl from 'cntl';

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  isSelected?: boolean;
}

const outlineButtonClassName = cntl`
  border-2
  font-medium
  px-4
  py-2
  rounded-md
  transition-button
`;

function CoreOutlineButton(props: Props) {
  const {className, isSelected = false, ...buttonProps} = props;

  const buttonClassName = cntl`
    ${outlineButtonClassName}
    ${isSelected ? 'bg-primary' : ''}
    ${isSelected ? 'text-secondary' : 'text-primary'}
    ${className}
  `;

  return <button className={buttonClassName} {...buttonProps} />;
}

export default function OutlineButton(props: Props) {
  const { className: propsClassName, ...restProps } = props;

  const className = cntl`
    border-primary
    hover:bg-primary
    hover:text-secondary
    ${propsClassName}
  `;

  return <CoreOutlineButton className={className} {...restProps } />
}

// FIXME: The name of this component sucks.
export function OutlineButtonSecondary(props: Props) {
  const { className: propsClassName, ...restProps } = props;

  const className = cntl`
    active:bg-primary
    active:text-secondary
    border-secondary
    ease-out
    hover:border-primary
    ${propsClassName}
  `;

  return <CoreOutlineButton className={className} {...restProps } />
}
