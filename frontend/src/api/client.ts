import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

// Test user ID (gerçek uygulamada auth'dan gelecek)
const TEST_USER_ID = '2024123456'; // Örnek öğrenci no

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'x-user-id': TEST_USER_ID,
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Kullanıcı ID'sini her istekte ekle
    const userId = localStorage.getItem('userId') || TEST_USER_ID;
    config.headers['x-user-id'] = userId;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // API hata mesajını düzenle
      const message = error.response.data?.message || 'Bir hata oluştu';
      console.error('API Error:', message);
    }
    return Promise.reject(error);
  }
);

export default apiClient;

