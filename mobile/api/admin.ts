import apiClient from './client';

export interface AdminUser {
  id: string;
  studentNumber: string;
  fullName: string;
  role: string;
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
  occupancyRate: number;
}

export const adminApi = {
  getUsers: () => apiClient.get<AdminUser[]>('/admin/users'),
  forceLogout: (userId: string) =>
    apiClient.post<{ message: string }>(`/admin/users/${userId}/force-logout`, {}),

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
};
