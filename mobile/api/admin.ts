import apiClient from './client';

export interface AdminUser {
  id: string;
  studentNumber: string;
  fullName: string;
  role: string;
  isSuperAdmin?: boolean;
  isActive: boolean;
  hasActiveSession: boolean;
  createdAt: string;
}

export interface AdminReservation {
  id: string;
  userId: string;
  tableId: string;
  hallId: string;
  reservationDate: string;
  startTime: string;
  endTime: string;
  status: string;
  createdAt: string;
  cancelledAt?: string;
  cancelledReason?: string;
  user?: { id: string; studentNumber: string; fullName: string };
  table?: { id: string; tableNumber: string };
  hall?: { id: string; name: string };
}

export interface AdminHall {
  id: string;
  name: string;
  floor: number;
  isActive: boolean;
  totalTables?: number;
  occupiedTables?: number;
  availableTables?: number;
  occupancyRate?: number;
}

export interface AdminTable {
  id: string;
  tableNumber: string;
  positionX: number;
  positionY: number;
  width: number;
  height: number;
  isActive: boolean;
  features: Array<{ id: string; name: string; icon: string }>;
}

export interface AdminOverview {
  totalUsers: number;
  totalReservations: number;
  activeReservations: number;
  noShowCount: number;
  cancelledReservations: number;
  occupancyRate: number;
}

export interface AdminSpecialPeriodRules {
  allowAdvanceBooking?: boolean;
  maxAdvanceDays?: number;
}

export interface AdminSpecialPeriod {
  id: string;
  name: string;
  scheduleType: string;
  periodKind: 'special' | 'standard';
  startDate: string;
  endDate: string;
  is24h: boolean;
  openingTime: string;
  closingTime: string;
  priority: number;
  rules?: AdminSpecialPeriodRules;
  isActive: boolean;
  createdAt: string;
}

export type CreateSpecialPeriodPayload = {
  name: string;
  startDate: string;
  endDate: string;
  is24h?: boolean;
  openingTime?: string;
  closingTime?: string;
  priority?: number;
  rules?: AdminSpecialPeriodRules;
};

export type UpdateSpecialPeriodPayload = Partial<CreateSpecialPeriodPayload>;

export type AdminUserRole = 'student' | 'staff' | 'admin';

export const adminApi = {
  getUsers: () => apiClient.get<AdminUser[]>('/admin/users'),
  forceLogout: (userId: string) =>
    apiClient.post<{ message: string }>(`/admin/users/${userId}/force-logout`, {}),
  updateUserRole: (userId: string, role: AdminUserRole) =>
    apiClient.patch<AdminUser>(`/admin/users/${userId}/role`, { role }),

  getReservations: (status?: string) => {
    const qs = status ? `?status=${status}` : '';
    return apiClient.get<AdminReservation[]>(`/admin/reservations${qs}`);
  },
  cancelReservation: (id: string) =>
    apiClient.delete<AdminReservation>(`/admin/reservations/${id}`),

  getHalls: () => apiClient.get<AdminHall[]>('/admin/halls'),
  getHallTables: (hallId: string) =>
    apiClient.get<AdminTable[]>(`/admin/halls/${hallId}/tables`),
  updateTable: (tableId: string, body: Partial<Pick<AdminTable, 'positionX' | 'positionY' | 'width' | 'height'> & { featureIds: string[] }>) =>
    apiClient.patch<AdminTable>(`/admin/tables/${tableId}`, body),

  getOverview: () => apiClient.get<AdminOverview>('/admin/statistics/overview'),

  getSpecialPeriods: () =>
    apiClient.get<AdminSpecialPeriod[]>('/admin/special-periods'),
  createSpecialPeriod: (payload: CreateSpecialPeriodPayload) =>
    apiClient.post<AdminSpecialPeriod>('/admin/special-periods', payload),
  updateSpecialPeriod: (id: string, payload: UpdateSpecialPeriodPayload) =>
    apiClient.patch<AdminSpecialPeriod>(`/admin/special-periods/${id}`, payload),
  toggleSpecialPeriodStatus: (id: string, isActive: boolean) =>
    apiClient.patch<AdminSpecialPeriod>(`/admin/special-periods/${id}/status`, { isActive }),
  deleteSpecialPeriod: (id: string) =>
    apiClient.delete<{ message: string }>(`/admin/special-periods/${id}`),
};
