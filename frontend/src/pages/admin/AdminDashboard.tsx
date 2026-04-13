import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, CalendarDays, Clock, AlertCircle, BarChart3, XCircle,
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

  type DashCard = {
    title: string;
    value: number | string;
    icon: typeof Users;
    color: string;
    lightBg: string;
    navigateTo?: string;
  };

  const cards: DashCard[] = overview
    ? [
        {
          title: 'Toplam Kullanıcı',
          value: overview.totalUsers,
          icon: Users,
          color: 'bg-blue-500',
          lightBg: 'bg-blue-50',
          navigateTo: '/admin/users',
        },
        { title: 'Toplam Rezervasyon', value: overview.totalReservations, icon: CalendarDays, color: 'bg-purple-500', lightBg: 'bg-purple-50' },
        {
          title: 'Aktif Rezervasyon',
          value: overview.activeReservations,
          icon: Clock,
          color: 'bg-green-500',
          lightBg: 'bg-green-50',
          navigateTo: '/admin/reservations?filter=active',
        },
        {
          title: 'Süresi Dolmuş',
          value: overview.noShowCount,
          icon: AlertCircle,
          color: 'bg-red-500',
          lightBg: 'bg-red-50',
          navigateTo: '/admin/reservations?filter=expired',
        },
        {
          title: 'İptal Edilen',
          value: overview.cancelledReservations ?? 0,
          icon: XCircle,
          color: 'bg-indigo-500',
          lightBg: 'bg-indigo-50',
          navigateTo: '/admin/reservations?filter=cancelled',
        },
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
        {cards.map((c, i) => {
          const inner = (
            <>
              <div className={`w-11 h-11 rounded-full ${c.lightBg} flex items-center justify-center mb-3`}>
                <c.icon className={`w-5 h-5 ${c.color.replace('bg-', 'text-')}`} />
              </div>
              <p className="text-2xl font-bold text-gray-900">{c.value}</p>
              <p className="text-sm text-gray-500 mt-1">{c.title}</p>
            </>
          );
          const cardClass =
            'bg-white rounded-xl p-5 shadow-sm text-left w-full' +
            (c.navigateTo ? ' cursor-pointer hover:shadow-md hover:ring-1 hover:ring-gray-200 transition' : '');
          if (c.navigateTo) {
            return (
              <button
                key={i}
                type="button"
                className={cardClass}
                onClick={() => navigate(c.navigateTo!)}
              >
                {inner}
              </button>
            );
          }
          return (
            <div key={i} className={cardClass}>
              {inner}
            </div>
          );
        })}
      </div>
    </div>
  );
}
