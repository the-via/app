/*
 * Port of react-resize-observer-hook that bails if the ref is null
 */
import React from 'react';

export default function useResize(
  ref: React.RefObject<HTMLElement>,
  callback: (entries: ResizeObserverEntry) => void,
) {
  React.useEffect(() => {
    if (!ref?.current) {
      return;
    }

    const resizeObserver = new ResizeObserver((entries) => {
      callback(entries[0]);
    });

    resizeObserver?.observe(ref.current);

    return () => {
      resizeObserver.disconnect();
    }
  }, [ref?.current]);
}
