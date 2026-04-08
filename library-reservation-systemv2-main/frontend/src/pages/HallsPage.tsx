import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Library, ChevronRight, Loader2, RefreshCw } from 'lucide-react';
import { hallsApi, statisticsApi } from '../api/halls';
import type { Hall, OverallStatistics } from '../types';

export default function HallsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [halls, setHalls] = useState<Hall[]>([]);
  const [stats, setStats] = useState<OverallStatistics | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [hallsList, overall] = await Promise.all([
        hallsApi.getAll(),
        statisticsApi.getOverallOccupancy(),
      ]);
      setHalls(hallsList);
      setStats(overall);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Salon Seçimi</h1>
        <button onClick={() => fetchData()} className="p-2 rounded-lg hover:bg-gray-100 transition">
          <RefreshCw className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <div className="grid gap-3">
        {halls.map((hall) => {
          const hallOcc = stats?.hallsOccupancy?.find((h) => h.hallId === hall.id);
          const rate = hallOcc?.occupancyRate ?? 0;
          return (
            <button
              key={hall.id}
              onClick={() => navigate(`/hall/${hall.id}`)}
              className="flex items-center bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition group"
            >
              <div className="w-14 h-14 rounded-xl bg-gray-50 flex items-center justify-center mr-4 group-hover:bg-amber-50 transition">
                <Library className="w-7 h-7 text-gray-400 group-hover:text-amber-500 transition" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-lg font-semibold text-gray-900">{hall.name}</p>
                {hall.description && <p className="text-sm text-gray-500">{hall.description}</p>}
                <p className="text-xs text-gray-400 mt-1">{hall.floor}. Kat · {hall.capacity} kişilik</p>
              </div>

              {hallOcc && (
                <div className="text-right mr-4">
                  <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden mb-1">
                    <div
                      className={`h-full rounded-full transition-all ${
                        rate < 50 ? 'bg-green-500' : rate < 80 ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(100, rate)}%` }}
                    />
                  </div>
                  <span className={`text-sm font-bold ${
                    rate < 50 ? 'text-green-600' : rate < 80 ? 'text-amber-600' : 'text-red-600'
                  }`}>
                    %{Math.round(rate)}
                  </span>
                  <p className="text-xs text-gray-400">{hallOcc.availableTables}/{hallOcc.totalTables} boş</p>
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
