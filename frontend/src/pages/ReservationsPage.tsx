import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarDays, Library, Clock, Hourglass, XCircle, PlusCircle,
  Loader2, CheckCircle2, Grid3X3, QrCode, BarChart3, ChevronRight,
  Info, RefreshCw, Timer,
} from 'lucide-react';
import { reservationsApi } from '../api/reservations';
import type { Reservation } from '../types';

interface UserStats {
  totalReservations: number;
  completedReservations: number;
  cancelled: number;
  expired: number;
  noShow: number;
  participationRate: number;
}

function computeStats(reservations: Reservation[]): UserStats {
  let completed = 0, cancelled = 0, expired = 0, noShow = 0;
  for (const r of reservations) {
    if (r.status === 'completed') completed++;
    else if (r.status === 'cancelled') cancelled++;
    else if (r.status === 'expired') expired++;
    else if (r.status === 'no_show') noShow++;
  }
  const total = reservations.length;
  return {
    totalReservations: total,
    completedReservations: completed,
    cancelled, expired, noShow,
    participationRate: total > 0 ? Math.round((completed / total) * 100) : 0,
  };
}

function getStatusText(status: string): string {
  switch (status) {
    case 'reserved': return 'QR Bekleniyor';
    case 'checked_in': return 'Check-in Yapıldı';
    case 'completed': return 'Tamamlandı';
    case 'cancelled': return 'İptal Edildi';
    case 'expired': return 'Süresi Doldu';
    case 'no_show': return 'Gelmedi';
    default: return status;
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'reserved': return { bg: 'bg-amber-100', text: 'text-amber-700' };
    case 'checked_in': return { bg: 'bg-green-100', text: 'text-green-700' };
    case 'completed': return { bg: 'bg-blue-100', text: 'text-blue-700' };
    case 'cancelled': return { bg: 'bg-red-100', text: 'text-red-700' };
    case 'expired': return { bg: 'bg-gray-100', text: 'text-gray-500' };
    case 'no_show': return { bg: 'bg-red-100', text: 'text-red-700' };
    default: return { bg: 'bg-gray-100', text: 'text-gray-500' };
  }
}

function getProgressColor(pct: number) {
  if (pct > 85) return 'bg-red-500';
  if (pct > 60) return 'bg-amber-500';
  return 'bg-green-500';
}

export default function ReservationsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeReservation, setActiveReservation] = useState<Reservation | null>(null);
  const [hasActive, setHasActive] = useState(false);
  const [history, setHistory] = useState<Reservation[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({ totalReservations: 0, completedReservations: 0, cancelled: 0, expired: 0, noShow: 0, participationRate: 0 });
  const [timeRemaining, setTimeRemaining] = useState('');
  const [progressPercent, setProgressPercent] = useState(0);
  const [cancelling, setCancelling] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const pastReservations = history
    .filter((r) => r.status !== 'reserved' && r.status !== 'checked_in')
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  const pastPreview = pastReservations.slice(0, 4);

  const fetchData = useCallback(async () => {
    try {
      const [status, allHistory] = await Promise.all([
        reservationsApi.getStatus().catch(() => null),
        reservationsApi.getHistoryAll().catch(() => [] as Reservation[]),
      ]);
      setHasActive(!!status?.hasActiveReservation);
      setActiveReservation(status?.activeReservation ?? null);
      setHistory(allHistory);
      setUserStats(computeStats(allHistory));
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (!activeReservation) { setTimeRemaining(''); setProgressPercent(0); return; }
    const update = () => {
      const now = Date.now();
      const start = new Date(activeReservation.startTime).getTime();
      const end = new Date(activeReservation.endTime).getTime();
      const remaining = end - now;
      const total = end - start;
      const elapsed = now - start;
      if (remaining <= 0) { setTimeRemaining('Süre doldu'); setProgressPercent(100); return; }
      setProgressPercent(Math.min(100, Math.max(0, (elapsed / total) * 100)));
      const h = Math.floor(remaining / 3600000);
      const m = Math.floor((remaining % 3600000) / 60000);
      const s = Math.floor((remaining % 60000) / 1000);
      setTimeRemaining(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
    };
    update();
    timerRef.current = setInterval(update, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [activeReservation]);

  const handleCancel = async () => {
    if (!activeReservation) return;
    if (!window.confirm('Rezervasyonunuzu iptal etmek istediğinize emin misiniz?')) return;
    setCancelling(true);
    try {
      await reservationsApi.cancel(activeReservation.id);
      setActiveReservation(null);
      setHasActive(false);
      window.alert('Rezervasyonunuz iptal edildi.');
      fetchData();
    } catch (e: any) {
      window.alert(e?.message || 'Rezervasyon iptal edilemedi.');
    } finally {
      setCancelling(false);
    }
  };

  const handleExtend = async () => {
    if (!activeReservation) return;
    if (!window.confirm('Rezervasyonunuzu 1 saat uzatmak istediğinize emin misiniz?')) return;
    try {
      await reservationsApi.extend(activeReservation.id);
      window.alert('Rezervasyonunuz 1 saat uzatıldı.');
      fetchData();
    } catch (e: any) {
      window.alert(e?.message || 'Uzatma yapılamadı.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  const statsSection = (
    <>
      <div className="flex items-center gap-2 mb-3 mt-8">
        <BarChart3 className="w-4 h-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-500">Kütüphane İstatistiklerim</span>
      </div>
      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="bg-amber-50 rounded-xl p-4 text-center">
          <p className="text-xl font-bold text-gray-900">{userStats.totalReservations}</p>
          <p className="text-[11px] text-gray-500 font-semibold mt-1">Toplam Rezervasyon</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4 text-center">
          <p className="text-xl font-bold text-green-600">{userStats.completedReservations}</p>
          <p className="text-[11px] text-gray-500 font-semibold mt-1">Tamamlanan</p>
        </div>
        <div className="bg-red-50 rounded-xl p-4 text-center">
          <p className="text-xl font-bold text-red-500">{userStats.cancelled}</p>
          <p className="text-[11px] text-gray-500 font-semibold mt-1">İptal Edilen</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 text-center">
          <p className="text-xl font-bold text-blue-600">%{userStats.participationRate}</p>
          <p className="text-[11px] text-gray-500 font-semibold mt-1">Katılım Oranı</p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-bold text-gray-900">Geçmiş Rezervasyonlarım</span>
        <button
          onClick={() => navigate('/reservation-history')}
          className="text-xs font-bold text-amber-600 border border-amber-400 px-3 py-1.5 rounded-full hover:bg-amber-50 transition"
        >
          Tümünü Gör
        </button>
      </div>
      {pastPreview.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">Henüz geçmiş rezervasyon bulunmuyor.</p>
      ) : (
        <div className="space-y-2">
          {pastPreview.map((res) => {
            const sc = getStatusColor(res.status);
            return (
              <div key={res.id} className="flex items-start justify-between bg-white rounded-xl p-3 border border-gray-100">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900">
                    {res.table?.hall?.name || res.hall?.name || 'Salon'} · Masa {res.table?.tableNumber || '-'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(res.startTime).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' })}{' '}
                    {new Date(res.startTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })} -{' '}
                    {new Date(res.endTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  {res.status === 'cancelled' && res.cancelledReason && (
                    <p className="text-[11px] text-gray-400 mt-1">İptal nedeni: {res.cancelledReason}</p>
                  )}
                </div>
                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${sc.bg} ${sc.text}`}>
                  {getStatusText(res.status).toUpperCase()}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </>
  );

  if (!hasActive || !activeReservation) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="flex flex-col items-center justify-center py-16">
          <CalendarDays className="w-20 h-20 text-gray-300 mb-5" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Aktif Rezervasyon Yok</h2>
          <p className="text-sm text-gray-500 mb-6">Henüz aktif bir rezervasyonunuz bulunmuyor.</p>
          <button
            onClick={() => navigate('/halls')}
            className="flex items-center gap-2 bg-amber-400 text-white font-semibold px-6 py-3 rounded-full hover:bg-amber-500 transition"
          >
            <PlusCircle className="w-5 h-5" /> Rezervasyon Yap
          </button>
        </div>
        {statsSection}
      </div>
    );
  }

  const hallName = activeReservation.table?.hall?.name || activeReservation.hall?.name || '';
  const tableNumber = activeReservation.table?.tableNumber || '';
  const status = activeReservation.status;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Rezervasyonlarım</h1>
        <button onClick={() => fetchData()} className="p-2 rounded-lg hover:bg-gray-100 transition">
          <RefreshCw className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Summary Cards */}
      <div className="flex items-center gap-1.5 text-gray-500 mb-3">
        <Info className="w-4 h-4" /> <span className="text-sm font-medium">Aktif Rezervasyon</span>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-amber-50 rounded-xl p-4">
          <div className="w-7 h-7 rounded-md bg-amber-400 flex items-center justify-center mb-1">
            <Library className="w-4 h-4 text-white" />
          </div>
          <p className="text-[11px] text-gray-500">Salon</p>
          <p className="text-lg font-bold text-gray-900 truncate">{hallName || '-'}</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-4">
          <div className="w-7 h-7 rounded-md bg-blue-500 flex items-center justify-center mb-1">
            <Grid3X3 className="w-4 h-4 text-white" />
          </div>
          <p className="text-[11px] text-gray-500">Masa</p>
          <p className="text-lg font-bold text-gray-900">{tableNumber || '-'}</p>
        </div>
        <div className={`rounded-xl p-4 ${status === 'checked_in' ? 'bg-green-50' : 'bg-amber-50'}`}>
          <div className={`w-7 h-7 rounded-md flex items-center justify-center mb-1 ${status === 'checked_in' ? 'bg-green-500' : 'bg-amber-500'}`}>
            <CheckCircle2 className="w-4 h-4 text-white" />
          </div>
          <p className="text-[11px] text-gray-500">Durum</p>
          <p className={`text-sm font-bold ${status === 'checked_in' ? 'text-green-600' : 'text-amber-600'}`}>{getStatusText(status)}</p>
        </div>
      </div>

      {/* Reservation Detail Card */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1 h-6 rounded bg-amber-400" />
        <h3 className="font-semibold text-gray-900">Rezervasyon Detayı</h3>
      </div>
      <div className="bg-amber-50 rounded-xl p-5 border border-amber-300 flex items-center mb-6">
        <div className="w-14 h-14 bg-white rounded-xl flex flex-col items-center justify-center mr-4">
          <span className="text-2xl font-bold text-amber-500">
            {new Date(activeReservation.startTime).getDate()}
          </span>
          <span className="text-xs text-gray-500 capitalize">
            {new Date(activeReservation.startTime).toLocaleDateString('tr-TR', { month: 'short' })}
          </span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <CalendarDays className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-semibold text-gray-900 capitalize">
              {new Date(activeReservation.startTime).toLocaleDateString('tr-TR', { weekday: 'long' })}
            </span>
            <span className="text-[10px] font-semibold text-white bg-amber-500 px-2 py-0.5 rounded">Bugün</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock className="w-3.5 h-3.5" />
            <span>
              {new Date(activeReservation.startTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })} - {new Date(activeReservation.endTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
            </span>
            <span className="text-gray-300">•</span>
            <span>{hallName} - Masa {tableNumber}</span>
          </div>
        </div>
      </div>

      {/* Timer */}
      <div className="bg-white rounded-xl p-5 shadow-sm text-center mb-6">
        <p className="text-sm text-gray-500 mb-1">Kalan Süre</p>
        <p className="text-4xl font-bold text-gray-900 font-mono tracking-wider mb-3">{timeRemaining || '--:--:--'}</p>
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${getProgressColor(progressPercent)}`}
            style={{ width: `${Math.min(100, progressPercent)}%` }}
          />
        </div>
      </div>

      {/* Checked-in info */}
      {status === 'checked_in' && activeReservation.checkedInAt && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-300 rounded-xl p-4 mb-6">
          <CheckCircle2 className="w-6 h-6 text-green-500" />
          <div>
            <p className="font-semibold text-green-600">Check-in Yapıldı</p>
            <p className="text-sm text-gray-500">
              {new Date(activeReservation.checkedInAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })} tarihinde giriş yapıldı
            </p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 mb-6">
        {status === 'checked_in' && (
          <button
            onClick={handleExtend}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600 transition"
          >
            <Timer className="w-5 h-5" /> Süre Uzat
          </button>
        )}
        <button
          onClick={handleCancel}
          disabled={cancelling}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-white border border-red-400 text-red-500 font-semibold rounded-xl hover:bg-red-50 transition disabled:opacity-50"
        >
          {cancelling ? <Loader2 className="w-5 h-5 animate-spin" /> : <XCircle className="w-5 h-5" />}
          İptal Et
        </button>
      </div>

      {statsSection}
    </div>
  );
}
