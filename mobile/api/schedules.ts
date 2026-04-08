import apiClient from './client';

export interface CurrentScheduleResponse {
  id: string;
  name: string;
  scheduleType: string;
  startDate: string;
  endDate: string;
  is24h: boolean;
  openingTime: string;
  closingTime: string;
  maxDurationHours: number;
  chainQrTimeoutMinutes: number;
  isActive: boolean;
  createdAt: string;
}

export const schedulesApi = {
  getCurrent: () => apiClient.get<CurrentScheduleResponse>('/schedules/current'),
};

export default schedulesApi;
