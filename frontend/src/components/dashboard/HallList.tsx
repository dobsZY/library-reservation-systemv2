/**
 * Hall List Component
 * @description Sidebar hall selector
 */

import { memo, useCallback } from 'react';
import { Card, CardHeader } from '../ui';
import { ProgressBar } from '../ui/ProgressBar';
import { BuildingIcon } from '../icons';
import { cn } from '../../utils/cn';
import { getOccupancyLevel } from '../../utils';
import type { HallStatistics } from '../../types';

interface HallListProps {
  halls: HallStatistics[];
  selectedHallId: string | null;
  onSelectHall: (id: string) => void;
}

export const HallList = memo(({ halls, selectedHallId, onSelectHall }: HallListProps) => {
  return (
    <Card padding="none" className="overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <CardHeader
          title="Salonlar"
          subtitle="Görüntülemek için salon seçin"
          className="mb-0"
        />
      </div>

      <div className="p-3 space-y-2">
        {halls.map((hall) => (
          <HallListItem
            key={hall.id}
            hall={hall}
            isSelected={hall.id === selectedHallId}
            onSelect={onSelectHall}
          />
        ))}
      </div>
    </Card>
  );
});

HallList.displayName = 'HallList';

// Hall List Item
interface HallListItemProps {
  hall: HallStatistics;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

const HallListItem = memo(({ hall, isSelected, onSelect }: HallListItemProps) => {
  const handleClick = useCallback(() => {
    onSelect(hall.id);
  }, [hall.id, onSelect]);

  const level = getOccupancyLevel(hall.occupancyRate);
  
  const badgeColors = {
    low: 'bg-emerald-50 text-emerald-700',
    medium: 'bg-amber-50 text-amber-700',
    high: 'bg-rose-50 text-rose-700',
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        'w-full text-left p-4 rounded-xl transition-all duration-200',
        isSelected
          ? 'bg-[#1e3a5f] text-white shadow-lg scale-[1.02]'
          : 'bg-gray-50 hover:bg-gray-100 text-gray-800'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'w-10 h-10 rounded-lg flex items-center justify-center',
              isSelected ? 'bg-white/20' : 'bg-white'
            )}
          >
            <BuildingIcon
              className={cn('w-5 h-5', isSelected ? 'text-white' : 'text-gray-600')}
            />
          </div>
          <div>
            <p className="font-semibold">{hall.name}</p>
            <p className={cn('text-xs', isSelected ? 'text-blue-200' : 'text-gray-500')}>
              {hall.floor}. Kat
            </p>
          </div>
        </div>
        <div
          className={cn(
            'px-2.5 py-1 rounded-lg text-xs font-bold',
            isSelected ? 'bg-white/20 text-white' : badgeColors[level]
          )}
        >
          %{Math.round(hall.occupancyRate)}
        </div>
      </div>

      {/* Progress */}
      <div
        className={cn(
          'h-2 rounded-full overflow-hidden mb-3',
          isSelected ? 'bg-white/20' : 'bg-gray-200'
        )}
      >
        <div
          className={cn(
            'h-full rounded-full transition-all duration-300',
            isSelected ? 'bg-white' : 
              level === 'low' ? 'bg-emerald-500' :
              level === 'medium' ? 'bg-amber-500' : 'bg-rose-500'
          )}
          style={{ width: `${hall.occupancyRate}%` }}
        />
      </div>

      {/* Stats */}
      <div
        className={cn(
          'flex items-center justify-between text-xs',
          isSelected ? 'text-blue-200' : 'text-gray-500'
        )}
      >
        <span className="flex items-center gap-1">
          <span className={cn('w-2 h-2 rounded-full', isSelected ? 'bg-emerald-400' : 'bg-emerald-500')} />
          {hall.availableTables} boş
        </span>
        <span className="flex items-center gap-1">
          <span className={cn('w-2 h-2 rounded-full', isSelected ? 'bg-amber-400' : 'bg-amber-500')} />
          {hall.reservedTables} rezerve
        </span>
        <span className="flex items-center gap-1">
          <span className={cn('w-2 h-2 rounded-full', isSelected ? 'bg-rose-400' : 'bg-rose-500')} />
          {hall.occupiedTables} dolu
        </span>
      </div>
    </button>
  );
});

HallListItem.displayName = 'HallListItem';

