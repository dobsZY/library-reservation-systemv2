import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Library, AlertCircle, Loader2 } from 'lucide-react';
import { login } from '../api/auth';
import { useAuthStore } from '../stores/useAuthStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);
  const [studentNumber, setStudentNumber] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!studentNumber || !password) {
      setError('Öğrenci numarası ve şifre zorunludur.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await login(studentNumber.trim(), password);
      setUser(res.user);
      navigate(res.user.role === 'admin' ? '/admin' : '/', { replace: true });
    } catch (err: any) {
      setError(err?.message || 'Giriş başarısız. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-amber-400 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <div className="flex flex-col items-center mb-6">
          <div className="w-[72px] h-[72px] rounded-full bg-amber-50 flex items-center justify-center mb-3">
            <Library className="w-10 h-10 text-amber-500" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Selçuk Kütüphane</h1>
          <p className="text-sm text-gray-500 mt-1">Öğrenci Girişi</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-500 mb-1">Öğrenci Numarası</label>
            <input
              type="text"
              inputMode="numeric"
              value={studentNumber}
              onChange={(e) => setStudentNumber(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition"
              autoComplete="username"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">Şifre</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition"
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 rounded-xl">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-amber-400 hover:bg-amber-500 disabled:opacity-60 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Giriş Yap'}
          </button>
        </form>
      </div>
    </div>
  );
}
