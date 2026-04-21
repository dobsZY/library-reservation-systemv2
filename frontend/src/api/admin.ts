import apiClient from './client';
import type {
  AdminUser,
  AdminReservation,
  AdminHall,
  AdminTable,
  AdminOverview,
  AdminSpecialPeriod,
  AdminSpecialPeriodRules,
} from '../types';

type CreateSpecialPeriodPayload = {
  name: string;
  startDate: string;
  endDate: string;
  is24h?: boolean;
  openingTime?: string;
  closingTime?: string;
  priority?: number;
  rules?: AdminSpecialPeriodRules;
};

type UpdateSpecialPeriodPayload = Partial<CreateSpecialPeriodPayload>;

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

  getSpecialPeriods: () =>
    apiClient.get<AdminSpecialPeriod[]>('/admin/special-periods').then((r) => r.data),
  createSpecialPeriod: (payload: CreateSpecialPeriodPayload) =>
    apiClient.post<AdminSpecialPeriod>('/admin/special-periods', payload).then((r) => r.data),
  updateSpecialPeriod: (id: string, payload: UpdateSpecialPeriodPayload) =>
    apiClient.patch<AdminSpecialPeriod>(`/admin/special-periods/${id}`, payload).then((r) => r.data),
  toggleSpecialPeriodStatus: (id: string, isActive: boolean) =>
    apiClient
      .patch<AdminSpecialPeriod>(`/admin/special-periods/${id}/status`, { isActive })
      .then((r) => r.data),
};
