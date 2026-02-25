import apiClient from './client';
import type { Reservation, UserStats } from '../types';

export interface CreateReservationDto {
  tableId: string;
  startTime: string;
  durationHours: number;
}

export interface CheckInDto {
  qrCode: string;
  latitude?: number;
  longitude?: number;
}

export const reservationsApi = {
  // Yeni rezervasyon oluştur
  create: async (dto: CreateReservationDto): Promise<Reservation> => {
    const { data } = await apiClient.post('/reservations', dto);
    return data;
  },

  // Kullanıcının rezervasyonlarını getir
  getMyReservations: async (): Promise<Reservation[]> => {
    const { data } = await apiClient.get('/reservations/my');
    return data;
  },

  // Aktif rezervasyonu getir
  getActiveReservation: async (): Promise<Reservation | null> => {
    const { data } = await apiClient.get('/reservations/my/active');
    return data;
  },

  // Kullanıcı istatistiklerini getir
  getMyStats: async (): Promise<UserStats> => {
    const { data } = await apiClient.get('/reservations/my/stats');
    return data;
  },

  // Rezervasyon detayını getir
  getById: async (id: string): Promise<Reservation> => {
    const { data } = await apiClient.get(`/reservations/${id}`);
    return data;
  },

  // QR ile check-in
  checkIn: async (id: string, dto: CheckInDto): Promise<Reservation> => {
    const { data } = await apiClient.post(`/reservations/${id}/check-in`, dto);
    return data;
  },

  // QR kod doğrula
  validateQr: async (qrCode: string): Promise<{ isValid: boolean; table?: any; message?: string }> => {
    const { data } = await apiClient.post('/reservations/validate-qr', { qrCode });
    return data;
  },

  // Rezervasyonu uzat
  extend: async (id: string, additionalHours: number): Promise<Reservation> => {
    const { data } = await apiClient.put(`/reservations/${id}/extend`, { additionalHours });
    return data;
  },

  // Rezervasyonu iptal et
  cancel: async (id: string, reason?: string): Promise<Reservation> => {
    const { data } = await apiClient.delete(`/reservations/${id}`, {
      data: { reason },
    });
    return data;
  },
};

