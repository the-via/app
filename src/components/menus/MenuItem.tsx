import React from 'react';
import cntl from 'cntl';
import ControlButton, {
  ControlButtonProps,
} from 'src/components/controls/ControlButton';

interface Props extends ControlButtonProps {
  children?: React.ReactNode;
}

export default function MenuItem(props: Props) {
  const {className, ...buttonProps} = props;

  const buttonClassName = cntl`
    text-lg
    ${className}
  `;

  return <ControlButton className={buttonClassName} {...buttonProps} />;
}
