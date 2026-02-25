/**
 * Hall Map Component
 * @description Interactive floor plan with table visualization
 */

import { memo, useState, useCallback, useMemo } from 'react';
import { Card, CardHeader } from '../ui';
import { EnterIcon, UserIcon, ClockIcon } from '../icons';
import { cn } from '../../utils/cn';
import { TABLE_STATUS, HALL_MAP_CONFIG } from '../../constants';
import type { TableWithOccupancy, TableStatus, HallStatistics } from '../../types';

interface HallMapProps {
  hall: HallStatistics | undefined;
  tables: TableWithOccupancy[];
}

export const HallMap = memo(({ hall, tables }: HallMapProps) => {
  const [hoveredTable, setHoveredTable] = useState<TableWithOccupancy | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const handleMouseEnter = useCallback(
    (table: TableWithOccupancy, event: React.MouseEvent) => {
      if (table.status === 'available') return;
      
      const rect = event.currentTarget.getBoundingClientRect();
      setTooltipPos({
        x: rect.left + rect.width / 2,
        y: rect.top - 10,
      });
      setHoveredTable(table);
    },
    []
  );

  const handleMouseLeave = useCallback(() => {
    setHoveredTable(null);
  }, []);

  const tableStats = useMemo(() => ({
    available: tables.filter((t) => t.status === 'available').length,
    reserved: tables.filter((t) => t.status === 'reserved').length,
    occupied: tables.filter((t) => t.status === 'occupied').length,
  }), [tables]);

  if (!hall) {
    return (
      <Card className="h-full flex items-center justify-center">
        <p className="text-gray-500">Salon seçiniz</p>
      </Card>
    );
  }

  return (
    <Card padding="none" className="overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <CardHeader
          title={`${hall.name} - Kroki Görünümü`}
          subtitle={`${hall.floor}. Kat • ${hall.totalTables} Masa`}
          className="mb-0"
        />
        <Legend />
      </div>

      {/* Map Container */}
      <div className="relative p-6">
        <div
          className="relative bg-gradient-to-br from-slate-100 to-slate-50 rounded-2xl overflow-hidden"
          style={{ height: 480 }}
        >
          {/* Grid Pattern */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: 'radial-gradient(circle, #cbd5e1 1px, transparent 1px)',
              backgroundSize: `${HALL_MAP_CONFIG.gridSize}px ${HALL_MAP_CONFIG.gridSize}px`,
            }}
          />

          {/* Windows Indicator */}
          <div className="absolute top-0 left-0 right-0 flex justify-center gap-8 pt-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="w-16 h-3 bg-sky-200 rounded-b-lg border-x-2 border-b-2 border-sky-300"
              />
            ))}
          </div>
          <p className="absolute top-5 left-1/2 -translate-x-1/2 text-xs text-gray-400 font-medium">
            Pencereler
          </p>

          {/* Tables */}
          {tables.map((table) => (
            <TableItem
              key={table.id}
              table={table}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            />
          ))}

          {/* Entrance */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-[#1e3a5f] text-white px-6 py-2 rounded-t-xl flex items-center gap-2 shadow-lg">
            <EnterIcon className="w-4 h-4" />
            <span className="text-sm font-semibold">GİRİŞ</span>
          </div>

          {/* Hall Label */}
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl shadow-sm">
            <p className="text-sm font-semibold text-gray-700">{hall.name}</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          <StatBox
            label="Boş Masa"
            value={tableStats.available}
            colorClass="emerald"
          />
          <StatBox
            label="Rezerve"
            value={tableStats.reserved}
            colorClass="amber"
          />
          <StatBox
            label="Dolu"
            value={tableStats.occupied}
            colorClass="rose"
          />
        </div>
      </div>

      {/* Tooltip */}
      {hoveredTable && <TableTooltip table={hoveredTable} position={tooltipPos} />}
    </Card>
  );
});

HallMap.displayName = 'HallMap';

// Legend Component
const Legend = memo(() => (
  <div className="flex items-center gap-4">
    {(['available', 'reserved', 'occupied'] as const).map((status) => (
      <div key={status} className="flex items-center gap-2">
        <div className={cn('w-4 h-4 rounded', TABLE_STATUS[status].bgClass)} />
        <span className="text-sm text-gray-600">{TABLE_STATUS[status].label}</span>
      </div>
    ))}
  </div>
));

Legend.displayName = 'Legend';

// Table Item Component
interface TableItemProps {
  table: TableWithOccupancy;
  onMouseEnter: (table: TableWithOccupancy, e: React.MouseEvent) => void;
  onMouseLeave: () => void;
}

const TableItem = memo(({ table, onMouseEnter, onMouseLeave }: TableItemProps) => {
  const statusConfig = TABLE_STATUS[table.status as keyof typeof TABLE_STATUS];

  const handleMouseEnter = useCallback(
    (e: React.MouseEvent) => onMouseEnter(table, e),
    [table, onMouseEnter]
  );

  return (
    <div
      className={cn(
        'absolute rounded-xl cursor-pointer transition-all duration-200 shadow-md',
        'hover:shadow-xl hover:scale-105',
        statusConfig.bgClass
      )}
      style={{
        left: table.position.x,
        top: table.position.y,
        width: table.dimensions.width,
        height: table.dimensions.height,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="w-full h-full flex flex-col items-center justify-center text-white">
        <span className="text-xs font-bold">{table.tableNumber.split('-')[1]}</span>
        {table.status !== 'available' && table.userName && (
          <span className="text-[10px] opacity-80 truncate max-w-[50px]">
            {table.userName.split(' ')[0]}
          </span>
        )}
      </div>

      {table.status === 'occupied' && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-rose-600 rounded-full border-2 border-white animate-pulse" />
      )}
    </div>
  );
});

TableItem.displayName = 'TableItem';

// Stat Box Component
interface StatBoxProps {
  label: string;
  value: number;
  colorClass: 'emerald' | 'amber' | 'rose';
}

const StatBox = memo(({ label, value, colorClass }: StatBoxProps) => (
  <div className={`bg-${colorClass}-50 rounded-xl p-4 text-center`}>
    <p className={`text-2xl font-bold text-${colorClass}-600`}>{value}</p>
    <p className={`text-sm text-${colorClass}-700`}>{label}</p>
  </div>
));

StatBox.displayName = 'StatBox';

// Tooltip Component
interface TableTooltipProps {
  table: TableWithOccupancy;
  position: { x: number; y: number };
}

const TableTooltip = memo(({ table, position }: TableTooltipProps) => {
  const statusConfig = TABLE_STATUS[table.status as keyof typeof TABLE_STATUS];

  return (
    <div
      className="fixed z-50 bg-gray-900 text-white px-4 py-3 rounded-xl shadow-2xl pointer-events-none transform -translate-x-1/2 -translate-y-full"
      style={{ left: position.x, top: position.y - 10 }}
    >
      <div className="flex items-center gap-3">
        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', statusConfig.bgClass)}>
          <UserIcon className="w-5 h-5" />
        </div>
        <div>
          <p className="font-semibold">Masa {table.tableNumber}</p>
          <p className="text-sm text-gray-300">{table.userName}</p>
          {table.endTime && (
            <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
              <ClockIcon className="w-3 h-3" />
              Bitiş: {table.endTime}
            </p>
          )}
        </div>
      </div>
      <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-gray-900" />
    </div>
  );
});

TableTooltip.displayName = 'TableTooltip';

