/**
 * useInterval Hook
 * @description Declarative interval hook with proper cleanup
 */

import { useEffect, useRef } from 'react';

type IntervalCallback = () => void;

export const useInterval = (
  callback: IntervalCallback,
  delay: number | null
): void => {
  const savedCallback = useRef<IntervalCallback>(callback);

  // Remember the latest callback
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval
  useEffect(() => {
    if (delay === null) return;

    const tick = () => savedCallback.current();
    const id = setInterval(tick, delay);

    return () => clearInterval(id);
  }, [delay]);
};

