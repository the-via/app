import React from 'react';

interface Props {
  children?: React.ReactNode;
}

export default function KeycodeCategoryLabel(props: Props) {
  const { children } = props;

  return (
    <div className="flex relative sticky top-0 items-center mb-4 bg-secondary-accent">
      <div className="h-px bg-secondary flex-1" />
      <div className="uppercase text-center text-sm tracking-widest z-2 relative">
        <span className="bg-background px-4">{children}</span>
      </div>
      <div className="h-px bg-secondary flex-1" />
    </div>
  );
}
