import apiClient from './client';
import {
  Reservation,
  CreateReservationDto,
  CheckInDto,
  UserReservationStatus,
  ValidateQrResponse,
} from '../types';

export const reservationsApi = {
  // Kullanıcının rezervasyon yapabilme durumunu kontrol et
  getStatus: () =>
    apiClient.get<UserReservationStatus>('/reservations/my/status'),

  // Yeni rezervasyon oluştur
  create: (data: CreateReservationDto) =>
    apiClient.post<Reservation>('/reservations', data),

  // Rezervasyon detayı getir
  getById: (id: string) =>
    apiClient.get<Reservation>(`/reservations/${id}`),

  // Kullanıcının aktif rezervasyonunu getir
  getActive: () =>
    apiClient.get<Reservation | null>('/reservations/my/active'),

  // Kullanıcının tüm rezervasyonlarını getir (geçmiş dahil)
  getHistory: () =>
    apiClient.get<Reservation[]>('/reservations/my'),

  // Kullanıcının tüm geçmiş rezervasyonlarını getir (filtreleme sayfası için)
  getHistoryAll: () =>
    apiClient.get<Reservation[]>('/reservations/my/history'),

  // QR kod ile check-in yap (aktif RESERVED rezervasyon için)
  checkIn: (data: CheckInDto) =>
    apiClient.post('/reservations/check-in', data),

  // QR kodun sistemde gecerli bir masaya ait olup olmadigini dogrula
  validateQr: (qrCode: string) =>
    apiClient.post<ValidateQrResponse>('/reservations/validate-qr', { qrCode }),

  // Rezervasyonu iptal et (backend DELETE + optional reason body)
  cancel: (id: string, reason?: string) =>
    // Bazı backend/validation akışlarında DELETE body'si hiç gelmemesi sorun çıkarabiliyor.
    // Reason yoksa bile en az `{}` göndererek `@Body()` parametresini tutarlı hale getiriyoruz.
    apiClient.delete<Reservation>(`/reservations/${id}`, reason !== undefined ? { reason } : {}),

  // Rezervasyonu uzat
  extend: (id: string) =>
    apiClient.put<Reservation>(`/reservations/${id}/extend`),
};

export default reservationsApi;
