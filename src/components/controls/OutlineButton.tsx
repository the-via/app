import React from 'react';
import cntl from 'cntl';

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  isSelected?: boolean;
}

const outlineButtonClassName = cntl`
  border-2
  font-medium
  overflow-hidden
  px-4
  py-2
  rounded-md
  text-ellipsis
  transition-button
`;

function CoreOutlineButton(props: Props) {
  const {className, isSelected = false, ...buttonProps} = props;

  const buttonClassName = cntl`
    ${outlineButtonClassName}
    ${isSelected ? 'bg-action' : ''}
    ${isSelected ? 'text-outline' : 'text-action'}
    ${className}
  `;

  return <button className={buttonClassName} {...buttonProps} />;
}

export default function OutlineButton(props: Props) {
  const { className: propsClassName, ...restProps } = props;

  const className = cntl`
    border-action
    focus-visible:underline
    hover:bg-action
    hover:text-outline
    ${propsClassName}
  `;

  return <CoreOutlineButton className={className} {...restProps } />
}

// FIXME: The name of this component sucks.
export function OutlineButtonSecondary(props: Props) {
  const { className: propsClassName, ...restProps } = props;

  const className = cntl`
    active:bg-action
    active:text-outline
    border-outline
    ease-out
    hover:border-action
    ${props.isSelected ? 'focus-visible:underline' : 'focus-visible:border-action'}
    ${propsClassName}
  `;

  return <CoreOutlineButton className={className} {...restProps } />
}
