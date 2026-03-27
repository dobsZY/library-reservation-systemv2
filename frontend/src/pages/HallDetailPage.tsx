import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Loader2, AlertCircle, RefreshCw, Zap, X, Grid3X3,
  CalendarDays, Clock, Info, ArrowRight, DoorOpen,
} from 'lucide-react';
import { hallsApi } from '../api/halls';
import { reservationsApi } from '../api/reservations';
import type { Hall, TableAvailabilityItem, HallSlotsResponse, TableSlotItem, Reservation } from '../types';

function localCalendarYmd(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function HallDetailPage() {
  const { hallId } = useParams<{ hallId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [reserving, setReserving] = useState(false);
  const [hall, setHall] = useState<Hall | null>(null);
  const [tableItems, setTableItems] = useState<TableAvailabilityItem[]>([]);
  const [stats, setStats] = useState<{ total: number; available: number; occupied: number; occupancyRate: number } | null>(null);
  const [slotsData, setSlotsData] = useState<HallSlotsResponse | null>(null);
  const [selectedTableItem, setSelectedTableItem] = useState<TableAvailabilityItem | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TableSlotItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedTableSlots = useMemo(() => {
    if (!selectedTableItem || !slotsData) return [];
    const tableData = slotsData.tables.find((t) => t.tableId === selectedTableItem.table.id);
    return tableData?.slots || [];
  }, [selectedTableItem, slotsData]);

  const hasAnyAvailableSlot = useMemo(
    () => selectedTableSlots.some((s) => s.isAvailable),
    [selectedTableSlots],
  );

  const fetchHallData = useCallback(async () => {
    if (!hallId) return;
    const fallbackYmd = localCalendarYmd();
    try {
      setError(null);
      const slots = await hallsApi.getSlots(hallId, fallbackYmd).catch(() => null);
      const dateForAvailability = slots?.date ?? fallbackYmd;
      const availabilityData = await hallsApi.getAvailability(hallId, dateForAvailability);
      setHall(availabilityData.hall);
      setTableItems(availabilityData.tables);
      setStats(availabilityData.statistics);
      setSlotsData(slots);
      setSelectedTableItem((prev) => {
        if (!prev) return null;
        return availabilityData.tables.find((t) => t.table.id === prev.table.id) ?? null;
      });
    } catch (err: any) {
      setError(err.message || 'Salon bilgileri yüklenemedi.');
    } finally {
      setLoading(false);
    }
  }, [hallId]);

  useEffect(() => { fetchHallData(); }, [fetchHallData]);

  const handleReserve = async () => {
    if (!selectedTableItem || !selectedSlot) {
      window.alert('Lütfen bir saat seçin.');
      return;
    }
    setReserving(true);
    try {
      await reservationsApi.create({
        tableId: selectedTableItem.table.id,
        startTime: selectedSlot.startTime,
      });
      window.alert('Rezervasyonunuz başarıyla oluşturuldu.');
      navigate('/reservations', { replace: true });
    } catch (err: any) {
      window.alert(err?.message || 'Rezervasyon oluşturulamadı.');
    } finally {
      setReserving(false);
    }
  };

  const getTableColor = (item: TableAvailabilityItem, isSelected: boolean) => {
    if (!item.isAvailable) return 'bg-red-500';
    if (isSelected) return 'bg-amber-400';
    return 'bg-green-500';
  };

  const MAP_WIDTH = 600;
  const layoutWidth = hall?.layoutWidth || 800;
  const layoutHeight = hall?.layoutHeight || 600;
  const scaleX = MAP_WIDTH / layoutWidth;
  const scaleY = (MAP_WIDTH * 0.75) / layoutHeight;
  const scale = Math.min(scaleX, scaleY);
  const mapHeight = layoutHeight * scale;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        <p className="text-sm text-gray-500">Salon yükleniyor...</p>
      </div>
    );
  }

  if (error && !hall) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4 p-8">
        <AlertCircle className="w-16 h-16 text-red-400" />
        <h2 className="text-xl font-bold text-gray-900">Yüklenemedi</h2>
        <p className="text-sm text-gray-500 text-center">{error}</p>
        <button onClick={() => { setLoading(true); fetchHallData(); }} className="flex items-center gap-2 px-5 py-2.5 bg-amber-400 text-white rounded-xl font-semibold hover:bg-amber-500 transition">
          <RefreshCw className="w-4 h-4" /> Tekrar Dene
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      {/* Left: Map Area */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Hall Info */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{hall?.name || 'Salon'}</h1>
            {hall?.description && <p className="text-sm text-gray-500">{hall.description}</p>}
            <p className="text-xs text-gray-400 mt-1">{hall?.floor}. Kat</p>
          </div>
          {stats && (
            <div className="text-center px-4 py-2 bg-gray-50 rounded-xl border border-gray-200">
              <p className={`text-xl font-bold ${stats.occupancyRate < 50 ? 'text-green-600' : stats.occupancyRate < 80 ? 'text-amber-600' : 'text-red-600'}`}>
                %{Math.round(stats.occupancyRate)}
              </p>
              <p className="text-xs text-gray-400">Doluluk</p>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 py-3 mb-4 bg-white rounded-xl border border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-xs text-gray-500">Boş ({stats?.available || 0})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-xs text-gray-500">Dolu ({stats?.occupied || 0})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-400" />
            <span className="text-xs text-gray-500">Seçili</span>
          </div>
        </div>

        {/* Map */}
        {tableItems.length > 0 ? (
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div
              className="relative bg-gray-100 rounded-lg overflow-hidden mx-auto"
              style={{ width: MAP_WIDTH, height: mapHeight }}
            >
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-gray-800 px-3 py-1 rounded-t-lg flex items-center gap-1">
                <DoorOpen className="w-3 h-3 text-white" />
                <span className="text-white text-[10px] font-semibold">GİRİŞ</span>
              </div>

              {tableItems.map((item) => {
                const isSelected = selectedTableItem?.table.id === item.table.id;
                const w = Math.max(item.table.width * scale, 30);
                const h = Math.max(item.table.height * scale, 30);
                const hasPower = item.table.features?.some(
                  (f) => f.name === 'Priz' || f.name === 'priz' || f.icon === 'flash',
                );
                return (
                  <button
                    key={item.table.id}
                    className={`absolute rounded-lg flex items-center justify-center cursor-pointer hover:opacity-90 transition-all ${getTableColor(item, isSelected)} ${isSelected ? 'ring-2 ring-gray-800 ring-offset-1' : ''}`}
                    style={{
                      left: item.table.positionX * scale,
                      top: item.table.positionY * scale,
                      width: w,
                      height: h,
                    }}
                    onClick={() => { setSelectedTableItem(item); setSelectedSlot(null); }}
                  >
                    <span className="text-white text-[11px] font-bold">
                      {item.table.tableNumber.includes('-') ? item.table.tableNumber.split('-')[1] : item.table.tableNumber}
                    </span>
                    {hasPower && (
                      <Zap className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 text-white" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Grid3X3 className="w-12 h-12 mb-3" />
            <p>Bu salonda henüz masa tanımlanmamış.</p>
          </div>
        )}

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-green-600">{stats.available}</p>
              <p className="text-xs text-gray-500">Boş</p>
            </div>
            <div className="bg-red-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-red-600">{stats.occupied}</p>
              <p className="text-xs text-gray-500">Dolu</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
              <p className="text-xs text-gray-500">Toplam</p>
            </div>
          </div>
        )}
      </div>

      {/* Right: Selection Panel */}
      {selectedTableItem && (
        <div className="w-96 bg-white border-l border-gray-200 flex flex-col overflow-y-auto">
          <div className="p-5 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center">
                  <Grid3X3 className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Masa {selectedTableItem.table.tableNumber}</h3>
                  <p className="text-sm">
                    {selectedTableItem.isAvailable ? (
                      <span className="text-green-500 font-medium">Müsait</span>
                    ) : (
                      <span className="text-red-500 font-medium">
                        {selectedTableItem.availableFrom
                          ? `Boşalma: ${new Date(selectedTableItem.availableFrom).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`
                          : 'Dolu'}
                      </span>
                    )}
                    {' · '}
                    {selectedTableItem.table.features?.some((f) => f.name === 'Priz' || f.name === 'priz' || f.icon === 'flash')
                      ? 'Priz mevcut'
                      : 'Standart masa'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => { setSelectedTableItem(null); setSelectedSlot(null); }}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Slots */}
          <div className="p-5 flex-1">
            {selectedTableSlots.length > 0 ? (
              <>
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Uygun Saatler (Bugün)</h4>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {selectedTableSlots.map((slot, i) => {
                    const isSelected = selectedSlot?.startTime === slot.startTime;
                    const start = new Date(slot.startTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
                    const end = new Date(slot.endTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
                    return (
                      <button
                        key={i}
                        disabled={!slot.isAvailable}
                        onClick={() => slot.isAvailable && setSelectedSlot(slot)}
                        className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border text-sm font-medium transition ${
                          isSelected
                            ? 'bg-amber-50 border-amber-400 text-amber-700 border-2'
                            : slot.isAvailable
                              ? 'bg-gray-50 border-gray-200 text-gray-800 hover:bg-gray-100'
                              : 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed'
                        }`}
                      >
                        {start} <ArrowRight className="w-3 h-3" /> {end}
                      </button>
                    );
                  })}
                </div>
                {!hasAnyAvailableSlot && (
                  <p className="text-sm text-gray-400 text-center">Bugün müsait saat yok</p>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                <Clock className="w-6 h-6 mb-2" />
                <p className="text-sm">Bugün için uygun saat bulunamadı</p>
              </div>
            )}

            {/* Info Note */}
            <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-xl mt-4">
              <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
              <p className="text-xs text-blue-600 leading-relaxed">
                Rezervasyon 1 saat sürelidir. Süre dolmadan önce en fazla 2 kez uzatma hakkınız olacaktır. Rezervasyon sonrası 30 dakika içinde QR kod ile check-in yapmanız gerekmektedir.
              </p>
            </div>
          </div>

          {/* Reserve Button */}
          <div className="p-5 border-t border-gray-100">
            <button
              onClick={handleReserve}
              disabled={!selectedSlot || reserving}
              className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-white transition ${
                selectedSlot && !reserving
                  ? 'bg-green-500 hover:bg-green-600'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              {reserving ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <CalendarDays className="w-5 h-5" />
                  {selectedSlot ? 'Rezervasyon Yap' : 'Lütfen Saat Seçin'}
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
