import apiClient from './client';
import type { Hall, HallAvailabilityResponse } from '../types';

export const hallsApi = {
  // Tüm salonları getir
  getAll: async (): Promise<Hall[]> => {
    const { data } = await apiClient.get('/halls');
    return data;
  },

  // Salon detayını getir
  getById: async (id: string): Promise<Hall> => {
    const { data } = await apiClient.get(`/halls/${id}`);
    return data;
  },

  // Salon masalarıyla birlikte getir
  getWithTables: async (id: string): Promise<Hall> => {
    const { data } = await apiClient.get(`/halls/${id}/tables`);
    return data;
  },

  // Salon doluluk durumunu getir
  getAvailability: async (id: string, date?: string): Promise<HallAvailabilityResponse> => {
    const params = date ? { date } : {};
    const { data } = await apiClient.get(`/halls/${id}/availability`, { params });
    return data;
  },
};

