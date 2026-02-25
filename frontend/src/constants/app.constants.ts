/**
 * Application constants
 * @description Global application configuration values
 */

export const APP_CONFIG = {
  name: 'Kütüphane Yönetim Paneli',
  organization: 'Selçuk Üniversitesi',
  version: '1.0.0',
} as const;

export const REFRESH_INTERVALS = {
  statistics: 30_000,      // 30 seconds
  tables: 10_000,          // 10 seconds
  clock: 1_000,            // 1 second
} as const;

export const TABLE_STATUS = {
  available: {
    label: 'Boş',
    color: 'emerald',
    bgClass: 'bg-emerald-500',
    textClass: 'text-emerald-600',
    lightBgClass: 'bg-emerald-50',
  },
  reserved: {
    label: 'Rezerve',
    color: 'amber',
    bgClass: 'bg-amber-500',
    textClass: 'text-amber-600',
    lightBgClass: 'bg-amber-50',
  },
  occupied: {
    label: 'Dolu',
    color: 'rose',
    bgClass: 'bg-rose-500',
    textClass: 'text-rose-600',
    lightBgClass: 'bg-rose-50',
  },
  maintenance: {
    label: 'Bakımda',
    color: 'gray',
    bgClass: 'bg-gray-500',
    textClass: 'text-gray-600',
    lightBgClass: 'bg-gray-50',
  },
} as const;

export const OCCUPANCY_THRESHOLDS = {
  low: 50,
  medium: 80,
} as const;

export const HALL_MAP_CONFIG = {
  defaultWidth: 800,
  defaultHeight: 600,
  gridSize: 20,
  tableGap: {
    x: 90,
    y: 80,
  },
  tableSize: {
    width: 60,
    height: 60,
  },
  padding: 40,
} as const;

