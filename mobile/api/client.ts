import AsyncStorage from '@react-native-async-storage/async-storage';

// Backend API URL - Expo Go için bilgisayarın IP adresini kullan
// NOT: Gerçek cihazda test için localhost yerine bilgisayarın local IP'sini yaz
// Örn: 'http://192.168.1.100:3000/api'
const API_BASE_URL = 'http://10.0.2.2:3000/api'; // Android Emulator için
// const API_BASE_URL = 'http://localhost:3000/api'; // iOS Simulator için

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async getHeaders(): Promise<HeadersInit> {
    const token = await AsyncStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'GET',
      headers: await this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Bir hata oluştu' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: await this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Bir hata oluştu' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PUT',
      headers: await this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Bir hata oluştu' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE',
      headers: await this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Bir hata oluştu' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Base URL'i değiştir (development vs production)
  setBaseUrl(url: string) {
    this.baseUrl = url;
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;

