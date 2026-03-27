import { useEffect, useState, useCallback } from 'react';
import {
  CalendarDays, MapPin, Clock, XCircle, Loader2, RefreshCw,
} from 'lucide-react';
import { adminApi } from '../../api/admin';
import type { AdminReservation } from '../../types';

const FILTERS = [
  { key: '', label: 'Tümü' },
  { key: 'active', label: 'Aktif' },
  { key: 'completed', label: 'Tamamlanan' },
  { key: 'cancelled', label: 'İptal' },
  { key: 'expired', label: 'Süresi Dolmuş' },
];

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  reserved: { bg: 'bg-blue-100', text: 'text-blue-700' },
  checked_in: { bg: 'bg-green-100', text: 'text-green-700' },
  completed: { bg: 'bg-gray-100', text: 'text-gray-500' },
  cancelled: { bg: 'bg-red-100', text: 'text-red-700' },
  expired: { bg: 'bg-gray-100', text: 'text-gray-400' },
};

function fmt(iso: string) {
  return new Date(iso).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
}
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState<AdminReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [cancelLoading, setCancelLoading] = useState<string | null>(null);

  const fetchReservations = useCallback(async () => {
    try {
      const data = await adminApi.getReservations(filter || undefined);
      setReservations(data);
    } catch (e: any) {
      window.alert(e?.message || 'Rezervasyonlar yüklenemedi.');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    setLoading(true);
    fetchReservations();
  }, [fetchReservations]);

  const handleCancel = async (res: AdminReservation) => {
    const isActive = res.status === 'reserved' || res.status === 'checked_in';
    if (!isActive) { window.alert('Bu rezervasyon iptal edilemez.'); return; }
    const msg = `${res.user?.fullName || res.userId} – ${res.hall?.name || ''} ${res.table?.tableNumber || ''}\n${fmtDate(res.startTime)} ${fmt(res.startTime)}–${fmt(res.endTime)}\n\nBu rezervasyonu iptal etmek istediğinize emin misiniz?`;
    if (!window.confirm(msg)) return;
    setCancelLoading(res.id);
    try {
      await adminApi.cancelReservation(res.id);
      window.alert('Rezervasyon iptal edildi.');
      fetchReservations();
    } catch (e: any) {
      window.alert(e?.message || 'İşlem başarısız.');
    } finally {
      setCancelLoading(null);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Rezervasyon Yönetimi</h1>
        <button onClick={() => { setLoading(true); fetchReservations(); }} className="p-2 rounded-lg hover:bg-gray-100 transition">
          <RefreshCw className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Filter Chips */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition ${
              filter === f.key
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-red-500" />
        </div>
      ) : reservations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <CalendarDays className="w-12 h-12 mb-3" />
          <p>Rezervasyon bulunamadı</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reservations.map((res) => {
            const displayStatus = res.status === 'no_show' ? 'expired' : res.status;
            const isAdminCancelled =
              res.status === 'cancelled' &&
              typeof res.cancelledReason === 'string' &&
              res.cancelledReason.toLowerCase().includes('yönetici');
            const sc = STATUS_COLORS[displayStatus] || STATUS_COLORS.expired;
            const isCancelable = res.status === 'reserved' || res.status === 'checked_in';

            return (
              <div key={res.id} className="bg-white rounded-xl p-5 shadow-sm">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-gray-900">{res.user?.fullName || '—'}</p>
                    <p className="text-sm text-gray-500">{res.user?.studentNumber || ''}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${sc.bg} ${sc.text}`}>
                    {isAdminCancelled ? 'İPTAL (ADMIN)' : displayStatus.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{res.hall?.name || '—'} · Masa {res.table?.tableNumber || '—'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{fmtDate(res.startTime)} {fmt(res.startTime)}–{fmt(res.endTime)}</span>
                </div>

                {isCancelable && (
                  <button
                    onClick={() => handleCancel(res)}
                    disabled={cancelLoading === res.id}
                    className="w-full mt-3 flex items-center justify-center gap-2 py-2 bg-red-50 rounded-lg text-red-600 text-sm font-semibold hover:bg-red-100 transition disabled:opacity-50"
                  >
                    {cancelLoading === res.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                    İptal Et
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
