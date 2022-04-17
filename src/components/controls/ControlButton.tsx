import React from 'react';
import cntl from 'cntl';

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  isSelected?: boolean;
}

export default function ControlButton(props: Props) {
  const {className, isSelected = false, ...buttonProps} = props;

  const buttonClassName = cntl`
    border-2
    border-transparent
    font-bold
    hover:border-primary
    px-2
    rounded-md
    transition-button
    ${isSelected ? 'bg-primary' : ''}
    ${isSelected ? 'text-secondary' : 'text-primary'}
    ${className}
  `;

    return <button className={buttonClassName} {...buttonProps} />;
}
