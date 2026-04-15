import { useCallback, useEffect, useState } from 'react';
import { CalendarClock, Loader2, RefreshCw } from 'lucide-react';
import { adminApi } from '../../api/admin';
import type { AdminSpecialPeriod } from '../../types';

type FormState = {
  name: string;
  startDate: string;
  endDate: string;
  maxAdvanceDays: number;
};

const initialForm: FormState = {
  name: '',
  startDate: '',
  endDate: '',
  maxAdvanceDays: 1,
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export default function AdminSpecialPeriodsPage() {
  const [periods, setPeriods] = useState<AdminSpecialPeriod[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormState>(initialForm);

  const fetchPeriods = useCallback(async () => {
    try {
      const data = await adminApi.getSpecialPeriods();
      setPeriods(data);
    } catch (e: any) {
      window.alert(e?.message || 'Ozel donemler yuklenemedi.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPeriods();
  }, [fetchPeriods]);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    try {
      await adminApi.createSpecialPeriod({
        name: form.name,
        startDate: form.startDate,
        endDate: form.endDate,
        is24h: true,
        openingTime: '00:00',
        closingTime: '23:59',
        priority: 100,
        rules: {
          allowAdvanceBooking: true,
          maxAdvanceDays: Number(form.maxAdvanceDays || 1),
        },
      });
      setForm(initialForm);
      await fetchPeriods();
    } catch (e: any) {
      window.alert(e?.message || 'Ozel donem olusturulamadi.');
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (item: AdminSpecialPeriod) => {
    try {
      await adminApi.toggleSpecialPeriodStatus(item.id, !item.isActive);
      await fetchPeriods();
    } catch (e: any) {
      window.alert(e?.message || 'Durum guncellenemedi.');
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Ozel Donem Yonetimi</h1>
        <button
          onClick={() => {
            setLoading(true);
            fetchPeriods();
          }}
          className="p-2 rounded-lg hover:bg-gray-100 transition"
        >
          <RefreshCw className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <form onSubmit={onSubmit} className="bg-white shadow-sm rounded-xl p-5 grid grid-cols-1 md:grid-cols-4 gap-3">
        <input
          className="border rounded-lg px-3 py-2 text-sm"
          placeholder="Donem adi"
          value={form.name}
          onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
          required
        />
        <input
          type="date"
          className="border rounded-lg px-3 py-2 text-sm"
          value={form.startDate}
          onChange={(e) => setForm((prev) => ({ ...prev, startDate: e.target.value }))}
          required
        />
        <input
          type="date"
          className="border rounded-lg px-3 py-2 text-sm"
          value={form.endDate}
          onChange={(e) => setForm((prev) => ({ ...prev, endDate: e.target.value }))}
          required
        />
        <div className="flex gap-2">
          <input
            type="number"
            min={1}
            max={3}
            className="w-full border rounded-lg px-3 py-2 text-sm"
            value={form.maxAdvanceDays}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, maxAdvanceDays: Number(e.target.value || 1) }))
            }
          />
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold disabled:opacity-50"
          >
            {saving ? 'Kayit...' : 'Ekle'}
          </button>
        </div>
      </form>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-red-500" />
        </div>
      ) : periods.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <CalendarClock className="w-12 h-12 mb-3" />
          <p>Tanımlı özel dönem yok</p>
        </div>
      ) : (
        <div className="space-y-3">
          {periods.map((item) => (
            <div key={item.id} className="bg-white rounded-xl p-5 shadow-sm flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900">{item.name}</p>
                <p className="text-sm text-gray-500">
                  {fmtDate(item.startDate)} - {fmtDate(item.endDate)} · 7/24 · ileri rezervasyon:{' '}
                  {item.rules?.maxAdvanceDays ?? 1} gun
                </p>
              </div>
              <button
                onClick={() => toggleStatus(item)}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${
                  item.isActive
                    ? 'bg-red-50 text-red-700 hover:bg-red-100'
                    : 'bg-green-50 text-green-700 hover:bg-green-100'
                }`}
              >
                {item.isActive ? 'Pasife Al' : 'Aktif Et'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

