import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, CalendarDays, Search, X } from 'lucide-react';
import { reservationsApi } from '../api/reservations';
import type { Reservation } from '../types';

function getStatusText(status: string): string {
  switch (status) {
    case 'reserved': return 'Aktif';
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

function ymdLocal(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export default function ReservationHistoryPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [all, setAll] = useState<Reservation[]>([]);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  useEffect(() => {
    reservationsApi.getHistoryAll()
      .then(setAll)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const pastReservations = useMemo(
    () =>
      all
        .filter((r) => r.status !== 'reserved' && r.status !== 'checked_in')
        .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()),
    [all],
  );

  const filtered = useMemo(() => {
    let list = pastReservations;
    if (fromDate) {
      const from = new Date(fromDate);
      from.setHours(0, 0, 0, 0);
      list = list.filter((r) => new Date(r.startTime) >= from);
    }
    if (toDate) {
      const to = new Date(toDate);
      to.setHours(23, 59, 59, 999);
      list = list.filter((r) => new Date(r.startTime) <= to);
    }
    return list;
  }, [pastReservations, fromDate, toDate]);

  const resetFilters = () => { setFromDate(''); setToDate(''); };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/reservations')} className="p-2 rounded-lg hover:bg-gray-100 transition">
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Geçmiş Rezervasyonlarım</h1>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 border border-gray-100 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Search className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-600">Tarih Filtresi</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <label className="block text-xs text-gray-400 mb-1">Başlangıç</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs text-gray-400 mb-1">Bitiş</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
          {(fromDate || toDate) && (
            <button onClick={resetFilters} className="mt-5 p-2 rounded-lg hover:bg-gray-100 transition" title="Filtreleri Temizle">
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <CalendarDays className="w-12 h-12 mb-3" />
          <p className="text-sm">Geçmiş rezervasyon bulunamadı.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((res) => {
            const sc = getStatusColor(res.status);
            return (
              <div key={res.id} className="bg-white rounded-xl p-4 border border-gray-100">
                <div className="flex items-start justify-between mb-2">
                  <p className="font-bold text-gray-900">
                    {res.table?.hall?.name || res.hall?.name || 'Salon'} · Masa {res.table?.tableNumber || '-'}
                  </p>
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${sc.bg} ${sc.text}`}>
                    {getStatusText(res.status).toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  {new Date(res.startTime).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' })}{' '}
                  {new Date(res.startTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })} -{' '}
                  {new Date(res.endTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                </p>
                {res.status === 'cancelled' && res.cancelledReason && (
                  <p className="text-xs text-gray-400 mt-2">İptal nedeni: {res.cancelledReason}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
