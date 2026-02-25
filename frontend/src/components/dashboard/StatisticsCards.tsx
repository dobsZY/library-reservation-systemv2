/**
 * Statistics Cards Component
 * @description Overview statistics display
 */

import { memo } from 'react';
import { Card } from '../ui';
import { ProgressBar } from '../ui/ProgressBar';
import { GridIcon, CheckCircleIcon, ClockIcon, UserIcon, ChartIcon } from '../icons';
import type { OverallStatistics } from '../../types';

interface StatisticsCardsProps {
  statistics: OverallStatistics;
}

export const StatisticsCards = memo(({ statistics }: StatisticsCardsProps) => {
  const { totalTables, availableTables, occupiedTables, reservedTables, occupancyRate } = statistics;

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {/* Occupancy Rate */}
      <Card
        className="col-span-2 md:col-span-1 bg-gradient-to-br from-[#1e3a5f] to-[#2d5a87] text-white"
        padding="lg"
      >
        <div className="flex items-center justify-between mb-4">
          <span className="text-blue-200 text-sm font-medium">Doluluk Oranı</span>
          <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
            <ChartIcon className="w-5 h-5" />
          </div>
        </div>
        <p className="text-4xl font-bold mb-3">%{occupancyRate}</p>
        <ProgressBar value={occupancyRate} size="md" className="[&>div]:bg-white/20 [&_div>div]:bg-white" />
      </Card>

      {/* Total Tables */}
      <Card padding="lg">
        <div className="flex items-center justify-between mb-3">
          <span className="text-gray-500 text-sm font-medium">Toplam Masa</span>
          <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center">
            <GridIcon className="w-5 h-5 text-gray-600" />
          </div>
        </div>
        <p className="text-3xl font-bold text-gray-800">{totalTables}</p>
        <p className="text-sm text-gray-400 mt-1">Tüm salonlar</p>
      </Card>

      {/* Available */}
      <Card padding="lg">
        <div className="flex items-center justify-between mb-3">
          <span className="text-gray-500 text-sm font-medium">Boş Masa</span>
          <div className="w-9 h-9 bg-emerald-100 rounded-lg flex items-center justify-center">
            <CheckCircleIcon className="w-5 h-5 text-emerald-600" />
          </div>
        </div>
        <p className="text-3xl font-bold text-emerald-600">{availableTables}</p>
        <p className="text-sm text-gray-400 mt-1">Müsait</p>
      </Card>

      {/* Reserved */}
      <Card padding="lg">
        <div className="flex items-center justify-between mb-3">
          <span className="text-gray-500 text-sm font-medium">Rezerve</span>
          <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center">
            <ClockIcon className="w-5 h-5 text-amber-600" />
          </div>
        </div>
        <p className="text-3xl font-bold text-amber-600">{reservedTables}</p>
        <p className="text-sm text-gray-400 mt-1">Bekliyor</p>
      </Card>

      {/* Occupied */}
      <Card padding="lg">
        <div className="flex items-center justify-between mb-3">
          <span className="text-gray-500 text-sm font-medium">Dolu Masa</span>
          <div className="w-9 h-9 bg-rose-100 rounded-lg flex items-center justify-center">
            <UserIcon className="w-5 h-5 text-rose-600" />
          </div>
        </div>
        <p className="text-3xl font-bold text-rose-600">{occupiedTables}</p>
        <p className="text-sm text-gray-400 mt-1">Kullanımda</p>
      </Card>
    </div>
  );
});

StatisticsCards.displayName = 'StatisticsCards';

