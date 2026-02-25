/**
 * Statistics types
 * @description Defines the structure for dashboard statistics
 */

import type { HallStatistics } from './hall.types';

export interface OverallStatistics {
  readonly totalHalls: number;
  readonly totalTables: number;
  readonly availableTables: number;
  readonly occupiedTables: number;
  readonly reservedTables: number;
  readonly occupancyRate: number;
}

export interface DashboardStatistics extends OverallStatistics {
  readonly halls: HallStatistics[];
  readonly lastUpdated: string;
}

export interface StatisticsSnapshot {
  readonly timestamp: string;
  readonly statistics: OverallStatistics;
}

