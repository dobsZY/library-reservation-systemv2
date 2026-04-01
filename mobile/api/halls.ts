import apiClient from './client';
import { Hall, HallAvailabilityResponse, HallSlotsResponse } from '../types';

export interface HallOccupancy {
  hallId: string;
  hallName: string;
  floor: number;
  totalTables: number;
  occupiedTables: number;
  availableTables: number;
  occupancyRate: number;
  soonAvailable: number;
}

export interface OverallStatistics {
  totalHalls: number;
  totalTables: number;
  occupiedTables: number;
  availableTables: number;
  overallOccupancyRate: number;
  activeReservations: number;
  hallsOccupancy: HallOccupancy[];
}

export const hallsApi = {
  getAll: () => apiClient.get<Hall[]>('/halls'),

  getById: (id: string) => apiClient.get<Hall>(`/halls/${id}`),

  getTables: (hallId: string) => apiClient.get<Hall>(`/halls/${hallId}/tables`),

  getAvailability: (hallId: string, date?: string) => {
    const q = date ? `?date=${encodeURIComponent(date)}` : '';
    return apiClient.get<HallAvailabilityResponse>(`/halls/${hallId}/availability${q}`);
  },

  getSlots: (hallId: string, date?: string) => {
    const query = date ? `?date=${date}` : '';
    return apiClient.get<HallSlotsResponse>(`/halls/${hallId}/slots${query}`);
  },
};

export const statisticsApi = {
  getOverallOccupancy: () => apiClient.get<OverallStatistics>('/statistics/occupancy'),
  getHallOccupancy: (hallId: string) => apiClient.get<HallOccupancy>(`/statistics/occupancy/hall/${hallId}`),
};

export default hallsApi;

