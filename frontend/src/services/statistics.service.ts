/**
 * Statistics Service
 * @description API operations for dashboard statistics
 */

import { apiService } from './api.service';
import type { DashboardStatistics } from '../types';

class StatisticsService {
  private readonly basePath = '/statistics';

  async getOverview(): Promise<DashboardStatistics> {
    return apiService.get<DashboardStatistics>(`${this.basePath}/overview`);
  }

  async getRealtime(): Promise<DashboardStatistics> {
    return apiService.get<DashboardStatistics>(`${this.basePath}/realtime`);
  }
}

export const statisticsService = new StatisticsService();

