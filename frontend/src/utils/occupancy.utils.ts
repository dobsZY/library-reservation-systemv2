/**
 * Occupancy utilities
 * @description Helper functions for occupancy calculations and status
 */

import { OCCUPANCY_THRESHOLDS, TABLE_STATUS } from '../constants';
import type { TableStatus } from '../types';

export type OccupancyLevel = 'low' | 'medium' | 'high';

export const getOccupancyLevel = (rate: number): OccupancyLevel => {
  if (rate < OCCUPANCY_THRESHOLDS.low) return 'low';
  if (rate < OCCUPANCY_THRESHOLDS.medium) return 'medium';
  return 'high';
};

export const getOccupancyColor = (rate: number): string => {
  const level = getOccupancyLevel(rate);
  const colorMap: Record<OccupancyLevel, string> = {
    low: 'emerald',
    medium: 'amber',
    high: 'rose',
  };
  return colorMap[level];
};

export const getOccupancyBgClass = (rate: number): string => {
  const color = getOccupancyColor(rate);
  return `bg-${color}-500`;
};

export const getOccupancyTextClass = (rate: number): string => {
  const color = getOccupancyColor(rate);
  return `text-${color}-600`;
};

export const getOccupancyLightBgClass = (rate: number): string => {
  const color = getOccupancyColor(rate);
  return `bg-${color}-50`;
};

export const getTableStatusConfig = (status: TableStatus) => {
  return TABLE_STATUS[status] ?? TABLE_STATUS.available;
};

export const calculateOccupancyRate = (
  occupied: number,
  reserved: number,
  total: number
): number => {
  if (total === 0) return 0;
  return Math.round(((occupied + reserved) / total) * 100);
};

export const formatPercentage = (value: number): string => {
  return `%${Math.round(value)}`;
};

