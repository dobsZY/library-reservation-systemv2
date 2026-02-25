import apiClient from './client';
import type { OverallStatistics, HallOccupancy } from '../types';

export const statisticsApi = {
  // Genel doluluk istatistiklerini getir
  getOverallOccupancy: async (): Promise<OverallStatistics> => {
    const { data } = await apiClient.get('/statistics/occupancy');
    return data;
  },

  // Salon bazlı doluluk
  getHallOccupancy: async (hallId: string): Promise<HallOccupancy> => {
    const { data } = await apiClient.get(`/statistics/occupancy/hall/${hallId}`);
    return data;
  },
};

