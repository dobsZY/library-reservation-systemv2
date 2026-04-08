import { create } from 'zustand';
import { getStoredUser, getToken } from '../api/client';

interface AuthUser {
  id: string;
  studentNumber: string;
  fullName: string;
  role: string;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  setUser: (user: AuthUser | null) => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isAdmin: false,
  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin',
    }),
  hydrate: () => {
    const token = getToken();
    const user = getStoredUser();
    if (token && user) {
      set({ user, isAuthenticated: true, isAdmin: user.role === 'admin' });
    } else {
      set({ user: null, isAuthenticated: false, isAdmin: false });
    }
  },
}));
