import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from './client';

export interface LoginResponse {
  accessToken: string;
  user: {
    id: string;
    studentNumber: string;
    fullName: string;
    role: string;
  };
}

const TOKEN_KEY = 'authToken';
const USER_KEY = 'authUser';

export async function login(studentNumber: string, password: string): Promise<LoginResponse> {
  const data = await apiClient.post<LoginResponse>('/auth/login', {
    studentNumber,
    password,
  });

  await AsyncStorage.setItem(TOKEN_KEY, data.accessToken);
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(data.user));

  return data;
}

export async function logout(): Promise<void> {
  try {
    await apiClient.post('/auth/logout');
  } catch {
    // network hatasinda da local oturumu temizleyelim
  } finally {
    await AsyncStorage.removeItem(TOKEN_KEY);
    await AsyncStorage.removeItem(USER_KEY);
  }
}

export async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function getCurrentUser(): Promise<LoginResponse['user'] | null> {
  const raw = await AsyncStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Backend'den oturum doğrulaması yapar (GET /auth/me).
 * Başarılıysa güncel kullanıcı verisini döner ve cache'i günceller.
 * 401 veya herhangi bir hata durumunda storage'ı temizler ve null döner.
 */
export async function verifySession(): Promise<LoginResponse['user'] | null> {
  try {
    const user = await apiClient.get<LoginResponse['user']>('/auth/me');
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    return user;
  } catch {
    await AsyncStorage.removeItem(TOKEN_KEY);
    await AsyncStorage.removeItem(USER_KEY);
    return null;
  }
}

