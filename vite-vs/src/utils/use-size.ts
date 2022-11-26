import * as React from 'react';
import useResizeObserver from '@react-hook/resize-observer';

export const useSize = (target: React.MutableRefObject<HTMLElement | null>) => {
  const [size, setSize] = React.useState<DOMRect>();

  React.useLayoutEffect(() => {
    if (target.current) {
      setSize(target.current.getBoundingClientRect());
    }
  }, [target]);

  // Where the magic happens
  useResizeObserver(target, (entry: any) => setSize(entry.contentRect));
  return size;
};
