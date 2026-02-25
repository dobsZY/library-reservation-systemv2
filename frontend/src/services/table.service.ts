/**
 * Table Service
 * @description API operations for library tables
 */

import { apiService } from './api.service';
import type { TableWithOccupancy, TableListResponse } from '../types';

class TableService {
  private readonly basePath = '/tables';

  async getByHallId(hallId: string): Promise<TableWithOccupancy[]> {
    const response = await apiService.get<TableListResponse>(
      `${this.basePath}/hall/${hallId}`
    );
    return response.data;
  }

  async getById(id: string): Promise<TableWithOccupancy> {
    return apiService.get<TableWithOccupancy>(`${this.basePath}/${id}`);
  }
}

export const tableService = new TableService();

