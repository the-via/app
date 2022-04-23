import React from 'react';
import cntl from 'cntl';

export interface ControlButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  isSelected?: boolean;
}

export default function ControlButton(props: ControlButtonProps) {
  const {className, isSelected = false, ...buttonProps} = props;

  const buttonClassName = cntl`
    border-2
    border-transparent
    font-medium
    hover:border-action
    overflow-hidden
    px-2
    rounded-md
    text-ellipsis
    transition-button
    ${isSelected ? 'bg-action' : ''}
    ${isSelected ? 'focus-visible:underline' : 'focus-visible:border-action'}
    ${isSelected ? 'text-outline' : 'text-action'}
    ${className}
  `;

  return <button className={buttonClassName} {...buttonProps} />;
}
