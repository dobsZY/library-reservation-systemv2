import apiClient, { setToken, setStoredUser, clearAuth } from './client';
import type { LoginResponse } from '../types';

export async function login(studentNumber: string, password: string): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>('/auth/login', { studentNumber, password });
  setToken(data.accessToken);
  setStoredUser(data.user);
  return data;
}

export async function logout(): Promise<void> {
  try {
    await apiClient.post('/auth/logout');
  } finally {
    clearAuth();
  }
}

export async function verifySession() {
  try {
    const { data } = await apiClient.get<LoginResponse['user']>('/auth/me');
    setStoredUser(data);
    return data;
  } catch {
    clearAuth();
    return null;
  }
}
