import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, CreditCard, Bell, HelpCircle, LogOut, Loader2, ChevronRight,
} from 'lucide-react';
import { verifySession, logout } from '../api/auth';
import { useAuthStore } from '../stores/useAuthStore';

export default function ProfilePage() {
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);
  const [userName, setUserName] = useState('Öğrenci');
  const [studentId, setStudentId] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const user = await verifySession();
      if (user) {
        setUserName(user.fullName || 'Öğrenci');
        setStudentId(user.studentNumber);
      }
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleLogout = async () => {
    if (!window.confirm('Hesabınızdan çıkmak istediğinize emin misiniz?')) return;
    try {
      await logout();
    } finally {
      setUser(null);
      navigate('/login', { replace: true });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl p-8 text-center border-b border-gray-100 mb-6">
        <div className="w-24 h-24 rounded-full bg-gray-100 border-[3px] border-gray-200 flex items-center justify-center mx-auto mb-4">
          <User className="w-12 h-12 text-gray-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">{userName}</h2>
      </div>

      {/* Student Number */}
      <div className="bg-white rounded-xl shadow-sm mb-6">
        <div className="flex items-center p-4">
          <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center mr-3">
            <CreditCard className="w-5 h-5 text-gray-400" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Öğrenci Numarası</p>
            <p className="font-semibold text-gray-900">{studentId || '-'}</p>
          </div>
        </div>
      </div>

      {/* Menu */}
      <div className="bg-white rounded-xl shadow-sm divide-y divide-gray-100">
        <button className="w-full flex items-center p-4 hover:bg-gray-50 transition">
          <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center mr-3">
            <Bell className="w-5 h-5 text-gray-400" />
          </div>
          <span className="flex-1 text-left text-gray-900">Bildirim Ayarları</span>
          <ChevronRight className="w-5 h-5 text-gray-300" />
        </button>
        <button className="w-full flex items-center p-4 hover:bg-gray-50 transition">
          <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center mr-3">
            <HelpCircle className="w-5 h-5 text-gray-400" />
          </div>
          <span className="flex-1 text-left text-gray-900">Yardım & Destek</span>
          <ChevronRight className="w-5 h-5 text-gray-300" />
        </button>
        <button onClick={handleLogout} className="w-full flex items-center p-4 hover:bg-red-50 transition">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center mr-3">
            <LogOut className="w-5 h-5 text-red-500" />
          </div>
          <span className="flex-1 text-left text-red-500 font-medium">Çıkış Yap</span>
          <ChevronRight className="w-5 h-5 text-gray-300" />
        </button>
      </div>
    </div>
  );
}
