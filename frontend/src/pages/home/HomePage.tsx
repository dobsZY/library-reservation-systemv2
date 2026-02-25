import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Library, Clock, TrendingUp } from 'lucide-react';
import { statisticsApi } from '../../api/statistics';
import { Card, OccupancyBar } from '../../components/common';
import { HallCard } from '../../components/hall/HallCard';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['overall-stats'],
    queryFn: statisticsApi.getOverallOccupancy,
    refetchInterval: 30000, // 30 saniyede bir güncelle
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-selcuk-blue border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-selcuk-blue text-white py-6 px-4 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <Library size={32} />
            <div>
              <h1 className="text-2xl font-bold">Kütüphane Rezervasyon</h1>
              <p className="text-blue-200 text-sm">Selçuk Üniversitesi</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Genel Doluluk Kartı */}
        <Card className="bg-gradient-to-r from-selcuk-blue to-blue-600 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp size={24} />
              <h2 className="text-lg font-semibold">Genel Doluluk</h2>
            </div>
            <div className="text-3xl font-bold">
              %{Math.round(stats?.overallOccupancyRate || 0)}
            </div>
          </div>
          
          <div className="bg-white/20 rounded-full h-4 overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{ width: `${stats?.overallOccupancyRate || 0}%` }}
            />
          </div>
          
          <div className="flex justify-between mt-3 text-sm text-blue-100">
            <span>{stats?.occupiedTables || 0} / {stats?.totalTables || 0} masa kullanımda</span>
            <span>{stats?.availableTables || 0} boş masa</span>
          </div>
        </Card>

        {/* Çalışma Saatleri */}
        <Card>
          <div className="flex items-center gap-2 text-gray-700">
            <Clock size={20} />
            <span className="font-medium">Çalışma Saatleri</span>
            <span className="ml-auto text-selcuk-blue font-semibold">08:00 - 23:00</span>
          </div>
        </Card>

        {/* Salonlar */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            📍 Salonlar
          </h2>
          
          <div className="grid gap-4">
            {stats?.hallsOccupancy.map((hall) => (
              <HallCard
                key={hall.hallId}
                hall={hall}
                onClick={() => navigate(`/hall/${hall.hallId}`)}
              />
            ))}
          </div>

          {(!stats?.hallsOccupancy || stats.hallsOccupancy.length === 0) && (
            <Card className="text-center text-gray-500 py-8">
              <Library size={48} className="mx-auto mb-3 text-gray-300" />
              <p>Henüz salon eklenmemiş</p>
            </Card>
          )}
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-3 px-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex justify-around">
          <button className="flex flex-col items-center text-selcuk-blue">
            <Library size={24} />
            <span className="text-xs mt-1">Ana Sayfa</span>
          </button>
          <button 
            className="flex flex-col items-center text-gray-400 hover:text-selcuk-blue transition-colors"
            onClick={() => navigate('/my-reservation')}
          >
            <Clock size={24} />
            <span className="text-xs mt-1">Rezervasyonum</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

