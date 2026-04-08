import apiClient from './client';
import type { Hall, HallAvailabilityResponse, HallSlotsResponse, OverallStatistics, HallOccupancy } from '../types';

export const hallsApi = {
  getAll: () => apiClient.get<Hall[]>('/halls').then((r) => r.data),
  getById: (id: string) => apiClient.get<Hall>(`/halls/${id}`).then((r) => r.data),
  getAvailability: (hallId: string, date?: string) => {
    const qs = date ? `?date=${encodeURIComponent(date)}` : '';
    return apiClient.get<HallAvailabilityResponse>(`/halls/${hallId}/availability${qs}`).then((r) => r.data);
  },
  getSlots: (hallId: string, date?: string) => {
    const qs = date ? `?date=${date}` : '';
    return apiClient.get<HallSlotsResponse>(`/halls/${hallId}/slots${qs}`).then((r) => r.data);
  },
};

export const statisticsApi = {
  getOverallOccupancy: () =>
    apiClient.get<OverallStatistics>('/statistics/occupancy').then((r) => r.data),
  getHallOccupancy: (hallId: string) =>
    apiClient.get<HallOccupancy>(`/statistics/occupancy/hall/${hallId}`).then((r) => r.data),
};
