/**
 * useClock Hook
 * @description Real-time clock with formatted output
 */

import { useState, useCallback } from 'react';
import { useInterval } from './useInterval';
import { formatTime, formatDateFull } from '../utils';
import { REFRESH_INTERVALS } from '../constants';

interface ClockState {
  time: string;
  date: string;
  timestamp: Date;
}

export const useClock = (): ClockState => {
  const [state, setState] = useState<ClockState>(() => {
    const now = new Date();
    return {
      time: formatTime(now),
      date: formatDateFull(now),
      timestamp: now,
    };
  });

  const updateClock = useCallback(() => {
    const now = new Date();
    setState({
      time: formatTime(now),
      date: formatDateFull(now),
      timestamp: now,
    });
  }, []);

  useInterval(updateClock, REFRESH_INTERVALS.clock);

  return state;
};

