import apiClient from './client';
import type { AdminUser, AdminReservation, AdminHall, AdminTable, AdminOverview } from '../types';

export const adminApi = {
  getUsers: () => apiClient.get<AdminUser[]>('/admin/users').then((r) => r.data),
  forceLogout: (userId: string) =>
    apiClient.post<{ message: string }>(`/admin/users/${userId}/force-logout`, {}).then((r) => r.data),
  getReservations: (status?: string) => {
    const qs = status ? `?status=${status}` : '';
    return apiClient.get<AdminReservation[]>(`/admin/reservations${qs}`).then((r) => r.data);
  },
  cancelReservation: (id: string) =>
    apiClient.delete<AdminReservation>(`/admin/reservations/${id}`).then((r) => r.data),
  getHalls: () => apiClient.get<AdminHall[]>('/admin/halls').then((r) => r.data),
  getHallTables: (hallId: string) =>
    apiClient.get<AdminTable[]>(`/admin/halls/${hallId}/tables`).then((r) => r.data),
  getOverview: () =>
    apiClient.get<AdminOverview>('/admin/statistics/overview').then((r) => r.data),
};
