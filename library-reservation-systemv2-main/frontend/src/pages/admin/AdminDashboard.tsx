import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, CalendarDays, Clock, AlertCircle, BarChart3,
  Loader2, LogOut, RefreshCw,
} from 'lucide-react';
import { adminApi } from '../../api/admin';
import { logout } from '../../api/auth';
import { useAuthStore } from '../../stores/useAuthStore';
import type { AdminOverview } from '../../types';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const data = await adminApi.getOverview();
      setOverview(data);
    } catch (e: any) {
      window.alert(e?.message || 'İstatistikler yüklenemedi.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleLogout = async () => {
    if (!window.confirm('Oturumu kapatmak istediğinize emin misiniz?')) return;
    try { await logout(); } finally {
      setUser(null);
      navigate('/login', { replace: true });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-red-500" />
      </div>
    );
  }

  const cards = overview
    ? [
        { title: 'Toplam Kullanıcı', value: overview.totalUsers, icon: Users, color: 'bg-blue-500', lightBg: 'bg-blue-50' },
        { title: 'Toplam Rezervasyon', value: overview.totalReservations, icon: CalendarDays, color: 'bg-purple-500', lightBg: 'bg-purple-50' },
        { title: 'Aktif Rezervasyon', value: overview.activeReservations, icon: Clock, color: 'bg-green-500', lightBg: 'bg-green-50' },
        { title: 'Süresi Dolmuş', value: overview.noShowCount, icon: AlertCircle, color: 'bg-red-500', lightBg: 'bg-red-50' },
        { title: 'Doluluk Oranı', value: `%${overview.occupancyRate.toFixed(1)}`, icon: BarChart3, color: 'bg-amber-500', lightBg: 'bg-amber-50' },
      ]
    : [];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Yönetici Paneli</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => fetchData()} className="p-2 rounded-lg hover:bg-gray-100 transition">
            <RefreshCw className="w-5 h-5 text-gray-500" />
          </button>
          <button onClick={handleLogout} className="p-2 rounded-lg bg-red-50 hover:bg-red-100 transition">
            <LogOut className="w-5 h-5 text-red-500" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((c, i) => (
          <div key={i} className="bg-white rounded-xl p-5 shadow-sm">
            <div className={`w-11 h-11 rounded-full ${c.lightBg} flex items-center justify-center mb-3`}>
              <c.icon className={`w-5 h-5 ${c.color.replace('bg-', 'text-')}`} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{c.value}</p>
            <p className="text-sm text-gray-500 mt-1">{c.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
