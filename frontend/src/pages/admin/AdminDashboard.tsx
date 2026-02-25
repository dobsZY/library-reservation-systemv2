import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, MapPin, Clock, RefreshCw, Eye } from 'lucide-react';
import { statisticsApi } from '../../api/statistics';
import { hallsApi } from '../../api/halls';
import { OccupancyBar } from '../../components/common';
import { AdminHallMap } from '../../components/admin/AdminHallMap';
import type { Hall } from '../../types';

export const AdminDashboard: React.FC = () => {
  const [selectedHallId, setSelectedHallId] = useState<string | null>(null);

  const { data: stats, isLoading: statsLoading, refetch } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: statisticsApi.getOverallOccupancy,
    refetchInterval: 10000, // 10 saniyede bir güncelle
  });

  const { data: halls } = useQuery({
    queryKey: ['halls'],
    queryFn: hallsApi.getAll,
  });

  const { data: hallAvailability } = useQuery({
    queryKey: ['hall-availability', selectedHallId],
    queryFn: () => hallsApi.getAvailability(selectedHallId!),
    enabled: !!selectedHallId,
    refetchInterval: 10000,
  });

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Users size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold">Kütüphane Yönetim Paneli</h1>
              <p className="text-gray-400 text-sm">Selçuk Üniversitesi</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-400 text-sm">
              Son güncelleme: {formatTime(new Date())}
            </span>
            <button
              onClick={() => refetch()}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              title="Yenile"
            >
              <RefreshCw size={20} />
            </button>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Sol Panel - Salon Listesi */}
        <aside className="w-80 bg-gray-800 border-r border-gray-700 overflow-y-auto">
          {/* Genel İstatistikler */}
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-sm font-semibold text-gray-400 uppercase mb-3">
              Genel Durum
            </h2>
            <div className="bg-gray-900 rounded-xl p-4">
              <div className="text-4xl font-bold text-center mb-2">
                %{Math.round(stats?.overallOccupancyRate || 0)}
              </div>
              <OccupancyBar 
                percentage={stats?.overallOccupancyRate || 0} 
                showLabel={false}
                size="md"
              />
              <div className="flex justify-between mt-3 text-sm">
                <span className="text-green-400">
                  {stats?.availableTables || 0} boş
                </span>
                <span className="text-red-400">
                  {stats?.occupiedTables || 0} dolu
                </span>
              </div>
            </div>
          </div>

          {/* Salon Listesi */}
          <div className="p-4">
            <h2 className="text-sm font-semibold text-gray-400 uppercase mb-3">
              Salonlar
            </h2>
            <div className="space-y-2">
              {stats?.hallsOccupancy.map((hall) => (
                <button
                  key={hall.hallId}
                  onClick={() => setSelectedHallId(hall.hallId)}
                  className={`w-full p-4 rounded-xl text-left transition-all ${
                    selectedHallId === hall.hallId
                      ? 'bg-blue-600 ring-2 ring-blue-400'
                      : 'bg-gray-900 hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{hall.hallName}</span>
                    <span className="text-sm opacity-75">
                      {hall.floor}. Kat
                    </span>
                  </div>
                  <OccupancyBar 
                    percentage={hall.occupancyRate} 
                    showLabel={false}
                    size="sm"
                  />
                  <div className="flex justify-between mt-2 text-sm opacity-75">
                    <span>{hall.occupiedTables}/{hall.totalTables}</span>
                    <span>%{Math.round(hall.occupancyRate)}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Ana İçerik - Salon Haritası */}
        <main className="flex-1 p-6 overflow-auto">
          {selectedHallId && hallAvailability ? (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold">{hallAvailability.hall.name}</h2>
                  <p className="text-gray-400">
                    {hallAvailability.hall.floor}. Kat • 
                    {hallAvailability.statistics.occupied}/{hallAvailability.statistics.total} masa dolu
                  </p>
                </div>
                <div className="flex gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-green-500" />
                    <span>Boş ({hallAvailability.statistics.available})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-red-500" />
                    <span>Dolu ({hallAvailability.statistics.occupied})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-yellow-500" />
                    <span>Yakında Boşalacak</span>
                  </div>
                </div>
              </div>

              <AdminHallMap
                hall={hallAvailability.hall}
                tables={hallAvailability.tables}
              />
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              <div className="text-center">
                <Eye size={64} className="mx-auto mb-4 opacity-50" />
                <p className="text-xl">Salon seçin</p>
                <p className="text-sm mt-2">Sol panelden bir salon seçerek detayları görüntüleyin</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

