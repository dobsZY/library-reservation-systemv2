import { useEffect, useState, useCallback } from 'react';
import { User, Shield, LogOut, Loader2, RefreshCw, Users } from 'lucide-react';
import { adminApi } from '../../api/admin';
import type { AdminUser } from '../../types';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      const data = await adminApi.getUsers();
      setUsers(data);
    } catch (e: any) {
      window.alert(e?.message || 'Kullanıcılar yüklenemedi.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleForceLogout = async (user: AdminUser) => {
    const msg = `${user.fullName} (${user.studentNumber}) kullanıcısının tüm oturumları sonlandırılacak. Devam edilsin mi?`;
    if (!window.confirm(msg)) return;
    setActionLoading(user.id);
    try {
      await adminApi.forceLogout(user.id);
      window.alert(`${user.fullName} için sunucudaki oturumlar kapatıldı.`);
      fetchUsers();
    } catch (e: any) {
      window.alert(e?.message || 'İşlem başarısız.');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-red-500" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Kullanıcı Yönetimi</h1>
        <button onClick={() => { setLoading(true); fetchUsers(); }} className="p-2 rounded-lg hover:bg-gray-100 transition">
          <RefreshCw className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {users.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <Users className="w-12 h-12 mb-3" />
          <p>Kullanıcı bulunamadı</p>
        </div>
      ) : (
        <div className="space-y-3">
          {users.map((u) => (
            <div key={u.id} className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${u.role === 'admin' ? 'bg-red-100' : 'bg-amber-50'}`}>
                  {u.role === 'admin'
                    ? <Shield className="w-5 h-5 text-red-500" />
                    : <User className="w-5 h-5 text-amber-500" />
                  }
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{u.fullName}</p>
                  <p className="text-sm text-gray-500">{u.studentNumber} · {u.role.toUpperCase()}</p>
                </div>
                {u.hasActiveSession && (
                  <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full mr-3">Aktif</span>
                )}
              </div>
              {u.hasActiveSession && (
                <button
                  onClick={() => handleForceLogout(u)}
                  disabled={actionLoading === u.id}
                  className="w-full mt-3 flex items-center justify-center gap-2 py-2 bg-red-50 rounded-lg text-red-600 text-sm font-semibold hover:bg-red-100 transition disabled:opacity-50"
                >
                  {actionLoading === u.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
                  Oturumu Sonlandır
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
