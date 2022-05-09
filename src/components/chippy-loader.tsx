import React from 'react';
import cntl from 'cntl';

const defaultChippy = {
  height: 175,
  src: '/images/chippy.png',
  width: 175,
};

const progressClassName = cntl`
  absolute
  bg-outline
  h-full
  left-0
  top-full
  w-full
  transition-button
  -z-[1]
`;

type Props = {
  progress?: number;
  width?: number;
  height?: number;
};

export default function ChippyLoader(props: Props) {
  const {
    height = defaultChippy.height,
    progress = 0.5,
    width = defaultChippy.width,
  } = props;

  return (
    <div className="items-center flex mb-6 justify-center w-full">
      <div className="animate-bob p-12 relative overflow-hidden rounded-full">
        <img
          className="z-10"
          style={{
            height: `${height}px`,
            width: `${width}px`,
          }}
          src={defaultChippy.src}
        />
        <div
          className={progressClassName}
          style={{
            transform: `translateY(-${progress * 100}%)`,
          }}
        />
      </div>
    </div>
  );
}
