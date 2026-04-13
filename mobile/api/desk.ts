import apiClient from './client';

export interface DeskTableSnapshot {
  calendarDate: string;
  table: {
    id: string;
    tableNumber: string;
    hall: { id: string; name: string };
  };
  activeReservation: DeskReservationRow | null;
  todayReservations: DeskReservationRow[];
}

export interface DeskReservationRow {
  id: string;
  status: string;
  startTime: string;
  endTime: string;
  user: {
    id: string;
    studentNumber: string;
    fullName: string;
    deskAvatarUrl: string;
  };
}

export const deskApi = {
  getTableSnapshot: (qrCode: string) =>
    apiClient.post<DeskTableSnapshot>('/desk/table-snapshot', { qrCode }),
};
