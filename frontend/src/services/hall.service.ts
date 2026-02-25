/**
 * Hall Service
 * @description API operations for library halls
 */

import { apiService } from './api.service';
import type { HallStatistics, HallListResponse } from '../types';

class HallService {
  private readonly basePath = '/halls';

  async getAll(): Promise<HallStatistics[]> {
    const response = await apiService.get<HallListResponse>(this.basePath);
    return response.data;
  }

  async getById(id: string): Promise<HallStatistics> {
    return apiService.get<HallStatistics>(`${this.basePath}/${id}`);
  }

  async getOccupancy(): Promise<HallStatistics[]> {
    const response = await apiService.get<HallListResponse>(`${this.basePath}/occupancy`);
    return response.data;
  }
}

export const hallService = new HallService();

