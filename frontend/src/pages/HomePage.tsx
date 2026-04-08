import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Info, CheckCircle2, CalendarDays, PieChart, ChevronRight,
  PlusCircle, Library, Clock, Hourglass, XCircle, Loader2, RefreshCw,
} from 'lucide-react';
import { hallsApi, statisticsApi } from '../api/halls';
import { reservationsApi } from '../api/reservations';
import type { Hall, Reservation, OverallStatistics } from '../types';

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
    case 'reserved': return 'text-amber-500';
    case 'checked_in': return 'text-green-500';
    default: return 'text-gray-400';
  }
}

function getStatusDotColor(status: string) {
  switch (status) {
    case 'reserved': return 'bg-amber-500';
    case 'checked_in': return 'bg-green-500';
    default: return 'bg-gray-400';
  }
}

export default function HomePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<OverallStatistics | null>(null);
  const [halls, setHalls] = useState<Hall[]>([]);
  const [activeReservation, setActiveReservation] = useState<Reservation | null>(null);
  const [timeRemaining, setTimeRemaining] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [overall, hallsList, status] = await Promise.all([
        statisticsApi.getOverallOccupancy(),
        hallsApi.getAll(),
        reservationsApi.getStatus().catch(() => null),
      ]);
      setStats(overall);
      setHalls(hallsList);
      setActiveReservation(status?.activeReservation ?? null);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (!activeReservation) { setTimeRemaining(''); return; }

    const update = () => {
      const diff = new Date(activeReservation.endTime).getTime() - Date.now();
      if (diff <= 0) { setTimeRemaining('Süre doldu'); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
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
      window.alert('Rezervasyonunuz iptal edildi.');
      fetchData();
    } catch (e: any) {
      window.alert(e?.message || 'Rezervasyon iptal edilemedi.');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  const availableTables = stats?.availableTables ?? 0;
  const occupancyRate = stats?.overallOccupancyRate ?? 0;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Kütüphane Modülü</h1>
        <button onClick={() => fetchData()} className="p-2 rounded-lg hover:bg-gray-100 transition">
          <RefreshCw className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Summary Cards */}
      <div className="flex items-center gap-1.5 text-gray-500 mb-3">
        <Info className="w-4 h-4" />
        <span className="text-sm font-medium">Özet Bilgi</span>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-amber-50 rounded-xl p-4">
          <div className="w-8 h-8 rounded-lg bg-amber-400 flex items-center justify-center mb-2">
            <CheckCircle2 className="w-4 h-4 text-white" />
          </div>
          <p className="text-xs text-gray-500">Boş Masa</p>
          <p className="text-2xl font-bold text-gray-900">{availableTables}</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-4">
          <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center mb-2">
            <CalendarDays className="w-4 h-4 text-white" />
          </div>
          <p className="text-xs text-gray-500">Rezervasyon</p>
          <p className="text-2xl font-bold text-gray-900">{activeReservation ? 1 : 0}</p>
        </div>
        <div className="bg-red-50 rounded-xl p-4">
          <div className="w-8 h-8 rounded-lg bg-red-500 flex items-center justify-center mb-2">
            <PieChart className="w-4 h-4 text-white" />
          </div>
          <p className="text-xs text-gray-500">Doluluk</p>
          <p className="text-2xl font-bold text-red-500">%{Math.round(occupancyRate)}</p>
        </div>
      </div>

      {/* Quick Reserve */}
      {!activeReservation && (
        <button
          onClick={() => navigate('/halls')}
          className="w-full flex items-center gap-3 p-4 rounded-xl bg-green-50 border border-green-400 mb-6 hover:bg-green-100 transition"
        >
          <PlusCircle className="w-6 h-6 text-green-500" />
          <span className="flex-1 text-left font-semibold text-green-600">Hızlı Rezervasyon Yap</span>
          <ChevronRight className="w-5 h-5 text-green-500" />
        </button>
      )}

      {/* Active Reservation */}
      {activeReservation && (
        <div className="bg-white rounded-xl border-2 border-green-400 p-5 mb-6 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className={`w-2 h-2 rounded-full ${getStatusDotColor(activeReservation.status)}`} />
            <span className={`text-xs font-bold uppercase ${getStatusColor(activeReservation.status)}`}>
              {activeReservation.status === 'checked_in' ? 'CHECK-IN YAPILDI' : 'ŞU ANDA AKTİF'}
            </span>
          </div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
              <Library className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">
                {activeReservation.table?.hall?.name || activeReservation.hall?.name || 'Salon'} - Masa {activeReservation.table?.tableNumber || '-'}
              </p>
              <p className="text-sm text-gray-500">{getStatusText(activeReservation.status)}</p>
            </div>
          </div>
          <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3 mb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">
                {new Date(activeReservation.startTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })} - {new Date(activeReservation.endTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            {timeRemaining && (
              <div className="flex items-center gap-2">
                <Hourglass className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-medium text-amber-500">{timeRemaining}</span>
              </div>
            )}
          </div>
          <button
            onClick={handleCancel}
            disabled={cancelling}
            className="w-full flex items-center justify-center gap-2 py-2.5 border-t border-gray-100 text-red-500 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
          >
            {cancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
            <span className="text-sm font-semibold">Rezervasyonu İptal Et</span>
          </button>
        </div>
      )}

      {/* Halls */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-gray-900">Salonlar</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-xs text-gray-500">Müsait</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-xs text-gray-500">Yoğun</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {halls.map((hall) => {
          const hallOcc = stats?.hallsOccupancy?.find((h) => h.hallId === hall.id);
          const rate = hallOcc?.occupancyRate ?? 0;
          return (
            <button
              key={hall.id}
              onClick={() => navigate(`/hall/${hall.id}`)}
              className="w-full flex items-center bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition"
            >
              <div className="w-11 h-11 rounded-xl bg-gray-50 flex items-center justify-center mr-3">
                <Library className="w-5 h-5 text-gray-400" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold text-gray-900">{hall.name}</p>
                {hall.description && <p className="text-sm text-gray-500">{hall.description}</p>}
                <p className="text-xs text-gray-400">{hall.floor}. Kat</p>
              </div>
              {hallOcc && (
                <div className="text-right mr-3">
                  <span className={`inline-block px-2.5 py-0.5 rounded-lg text-sm font-bold ${
                    rate < 50 ? 'bg-green-50 text-green-600' : rate < 80 ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
                  }`}>
                    %{Math.round(rate)}
                  </span>
                  <p className="text-xs text-gray-400 mt-1">{hallOcc.availableTables}/{hallOcc.totalTables} boş</p>
                </div>
              )}
              <ChevronRight className="w-5 h-5 text-gray-300" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
