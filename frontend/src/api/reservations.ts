import apiClient from './client';
import type { Reservation, CreateReservationDto, UserReservationStatus } from '../types';

export const reservationsApi = {
  getStatus: () =>
    apiClient.get<UserReservationStatus>('/reservations/my/status').then((r) => r.data),
  create: (dto: CreateReservationDto) =>
    apiClient.post<Reservation>('/reservations', dto).then((r) => r.data),
  getActive: () =>
    apiClient.get<Reservation | null>('/reservations/my/active').then((r) => r.data),
  getHistory: () =>
    apiClient.get<Reservation[]>('/reservations/my').then((r) => r.data),
  getHistoryAll: () =>
    apiClient.get<Reservation[]>('/reservations/my/history').then((r) => r.data),
  cancel: (id: string, reason?: string) =>
    apiClient.delete<Reservation>(`/reservations/${id}`, { data: reason ? { reason } : {} }).then((r) => r.data),
  extend: (id: string) =>
    apiClient.put<Reservation>(`/reservations/${id}/extend`).then((r) => r.data),
};
