import { create } from 'zustand';
import type { Reservation, UserStats, Hall } from '../types';

interface AppState {
  // Kullanıcı
  userId: string;
  setUserId: (id: string) => void;

  // Aktif Rezervasyon
  activeReservation: Reservation | null;
  setActiveReservation: (reservation: Reservation | null) => void;

  // Kullanıcı İstatistikleri
  userStats: UserStats | null;
  setUserStats: (stats: UserStats | null) => void;

  // Seçili Salon
  selectedHall: Hall | null;
  setSelectedHall: (hall: Hall | null) => void;

  // Seçili Masa ID
  selectedTableId: string | null;
  setSelectedTableId: (id: string | null) => void;

  // Rezervasyon formu
  reservationForm: {
    startTime: string;
    durationHours: number;
  };
  setReservationForm: (form: { startTime: string; durationHours: number }) => void;

  // UI State
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  // Hata mesajı
  error: string | null;
  setError: (error: string | null) => void;

  // Başarı mesajı
  successMessage: string | null;
  setSuccessMessage: (message: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Kullanıcı
  userId: localStorage.getItem('userId') || '2024123456',
  setUserId: (id) => {
    localStorage.setItem('userId', id);
    set({ userId: id });
  },

  // Aktif Rezervasyon
  activeReservation: null,
  setActiveReservation: (reservation) => set({ activeReservation: reservation }),

  // Kullanıcı İstatistikleri
  userStats: null,
  setUserStats: (stats) => set({ userStats: stats }),

  // Seçili Salon
  selectedHall: null,
  setSelectedHall: (hall) => set({ selectedHall: hall }),

  // Seçili Masa
  selectedTableId: null,
  setSelectedTableId: (id) => set({ selectedTableId: id }),

  // Rezervasyon formu
  reservationForm: {
    startTime: '',
    durationHours: 2,
  },
  setReservationForm: (form) => set({ reservationForm: form }),

  // UI State
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),

  // Hata mesajı
  error: null,
  setError: (error) => set({ error }),

  // Başarı mesajı
  successMessage: null,
  setSuccessMessage: (message) => set({ successMessage: message }),
}));

