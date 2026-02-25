import apiClient from './client';
import { Hall, HallWithOccupancy, Table, TableWithStatus, SystemStatistics } from '../types';

export const hallsApi = {
  // Tüm salonları getir
  getAll: () => apiClient.get<Hall[]>('/halls'),

  // Salon detayı getir
  getById: (id: string) => apiClient.get<Hall>(`/halls/${id}`),

  // Salonun masalarını getir
  getTables: (hallId: string) => apiClient.get<Table[]>(`/halls/${hallId}/tables`),

  // Salonun doluluk durumunu getir
  getOccupancy: (hallId: string) => apiClient.get<HallWithOccupancy>(`/halls/${hallId}/occupancy`),

  // Tüm salonların doluluk durumunu getir
  getAllOccupancy: () => apiClient.get<HallWithOccupancy[]>('/halls/occupancy'),

  // Masa durumunu getir
  getTableStatus: (tableId: string) => apiClient.get<TableWithStatus>(`/tables/${tableId}/status`),
};

export const statisticsApi = {
  // Genel istatistikleri getir
  getOverview: () => apiClient.get<SystemStatistics>('/statistics/overview'),

  // Gerçek zamanlı doluluk
  getRealtime: () => apiClient.get<SystemStatistics>('/statistics/realtime'),
};

export default hallsApi;

