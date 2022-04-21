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
    hover:border-primary
    px-2
    rounded-md
    transition-button
    ${isSelected ? 'bg-primary' : ''}
    ${isSelected ? 'focus-visible:underline' : 'focus-visible:border-primary'}
    ${isSelected ? 'text-secondary' : 'text-primary'}
    ${className}
  `;

  return <button className={buttonClassName} {...buttonProps} />;
}
