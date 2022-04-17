import React from 'react';
import cntl from 'cntl';

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  isSelected?: boolean;
}

export default function MenuItem(props: Props) {
  const {className, isSelected = false, ...buttonProps} = props;

  const buttonClassName = cntl`
    border-2
    border-transparent
    font-bold
    text-lg
    hover:border-primary
    px-2
    rounded-md
    transition-button
    ${isSelected ? 'bg-primary' : ''}
    ${isSelected ? 'text-secondary' : 'text-light'}
    ${className}
  `;

  return <button className={buttonClassName} {...buttonProps} />;
}
