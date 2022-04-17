import React from 'react';
import cntl from 'cntl';

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  isSelected?: boolean;
}

export default function OutlineButton(props: Props) {
  const {className, isSelected = false, ...buttonProps} = props;

  const buttonClassName = cntl`
    border-2
    border-primary
    font-medium
    hover:bg-primary
    hover:text-secondary
    px-4
    py-2
    rounded-md
    transition-button
    ${isSelected ? 'bg-primary' : ''}
    ${isSelected ? 'text-secondary' : 'text-primary'}
    ${className}
  `;

    return <button className={buttonClassName} {...buttonProps} />;
}
