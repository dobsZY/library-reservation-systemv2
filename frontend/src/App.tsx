import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { getToken, getStoredUser } from './api/client';
import { useAuthStore } from './stores/useAuthStore';
import AppLayout from './components/layout/AppLayout';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import HallsPage from './pages/HallsPage';
import HallDetailPage from './pages/HallDetailPage';
import ReservationsPage from './pages/ReservationsPage';
import ReservationHistoryPage from './pages/ReservationHistoryPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminReservationsPage from './pages/admin/AdminReservationsPage';
import AdminSpecialPeriodsPage from './pages/admin/AdminSpecialPeriodsPage';

function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) {
  const token = getToken();
  const user = getStoredUser();
  if (!token) return <Navigate to="/login" replace />;
  if (adminOnly && user?.role !== 'admin') return <Navigate to="/" replace />;
  return <>{children}</>;
}

function StudentRoute({ children }: { children: React.ReactNode }) {
  const user = getStoredUser();
  if (user?.role === 'admin') return <Navigate to="/admin" replace />;
  return <>{children}</>;
}

export default function App() {
  const hydrate = useAuthStore((s) => s.hydrate);
  useEffect(() => { hydrate(); }, [hydrate]);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        {/* Student Routes */}
        <Route path="/" element={<StudentRoute><HomePage /></StudentRoute>} />
        <Route path="/halls" element={<StudentRoute><HallsPage /></StudentRoute>} />
        <Route path="/hall/:hallId" element={<StudentRoute><HallDetailPage /></StudentRoute>} />
        <Route path="/reservations" element={<StudentRoute><ReservationsPage /></StudentRoute>} />
        <Route path="/reservation-history" element={<StudentRoute><ReservationHistoryPage /></StudentRoute>} />
        <Route path="/profile" element={<StudentRoute><ProfilePage /></StudentRoute>} />
        {/* Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute adminOnly><AdminUsersPage /></ProtectedRoute>} />
        <Route path="/admin/reservations" element={<ProtectedRoute adminOnly><AdminReservationsPage /></ProtectedRoute>} />
        <Route path="/admin/special-periods" element={<ProtectedRoute adminOnly><AdminSpecialPeriodsPage /></ProtectedRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
