import apiClient from './client';
import { 
  Reservation, 
  CreateReservationDto, 
  CheckInDto, 
  UserReservationStatus 
} from '../types';

export const reservationsApi = {
  // Kullanıcının rezervasyon yapabilme durumunu kontrol et
  checkStatus: (userId: string) => 
    apiClient.get<UserReservationStatus>(`/reservations/user/${userId}/status`),

  // Yeni rezervasyon oluştur
  create: (data: CreateReservationDto & { userId: string }) =>
    apiClient.post<Reservation>('/reservations', data),

  // Rezervasyon detayı getir
  getById: (id: string) => 
    apiClient.get<Reservation>(`/reservations/${id}`),

  // Kullanıcının aktif rezervasyonunu getir
  getActive: (userId: string) =>
    apiClient.get<Reservation | null>(`/reservations/user/${userId}/active`),

  // Kullanıcının rezervasyon geçmişi
  getHistory: (userId: string) =>
    apiClient.get<Reservation[]>(`/reservations/user/${userId}/history`),

  // QR kod ile check-in yap
  checkIn: (data: CheckInDto) =>
    apiClient.post<Reservation>('/reservations/check-in', data),

  // Rezervasyonu iptal et
  cancel: (id: string, reason?: string) =>
    apiClient.post<Reservation>(`/reservations/${id}/cancel`, { reason }),

  // Rezervasyonu uzat
  extend: (id: string, additionalHours: number) =>
    apiClient.post<Reservation>(`/reservations/${id}/extend`, { additionalHours }),
};

export default reservationsApi;

