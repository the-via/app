import React from 'react';

interface Props {
  children?: React.ReactNode;
}

export default function KeycodeCategoryLabel(props: Props) {
  const { children } = props;

  return (
    <div className="relative sticky top-0 bg-inherit">
      <div className="absolute top-[calc(50%_-_1px)] left-0 right-0 bg-secondary h-px" />
      <div className="uppercase text-center text-sm tracking-widest mb-2 z-2 relative">
        <span className="bg-background px-4">{children}</span>
      </div>
    </div>
  );
}
