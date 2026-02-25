import React, { useMemo } from 'react';
import { cn } from '../../utils/cn';
import type { TableAvailability, TableFeature } from '../../types';

interface TableMapProps {
  tables: TableAvailability[];
  layoutWidth: number;
  layoutHeight: number;
  selectedTableId: string | null;
  onTableSelect: (tableId: string) => void;
  scale?: number;
}

export const TableMap: React.FC<TableMapProps> = ({
  tables,
  layoutWidth,
  layoutHeight,
  selectedTableId,
  onTableSelect,
  scale = 1,
}) => {
  const getTableColor = (table: TableAvailability): string => {
    if (table.table.id === selectedTableId) {
      return 'bg-blue-500 ring-4 ring-blue-300 shadow-lg';
    }
    if (!table.isAvailable) {
      return 'bg-red-500 cursor-not-allowed';
    }
    if (table.availableFrom) {
      return 'bg-yellow-500 hover:bg-yellow-600 cursor-pointer';
    }
    return 'bg-green-500 hover:bg-green-600 cursor-pointer';
  };

  const renderFeatureIcons = (features: TableFeature[]) => {
    if (!features || features.length === 0) return null;
    return (
      <div className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 flex gap-0.5">
        {features.slice(0, 3).map((feature) => (
          <span key={feature.id} className="text-xs" title={feature.name}>
            {feature.icon}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="relative bg-gray-50 rounded-xl border-2 border-gray-200 overflow-hidden">
      {/* Giriş göstergesi */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-selcuk-blue text-white px-4 py-1 rounded-b-lg text-sm font-medium z-10">
        🚪 GİRİŞ
      </div>

      {/* Harita alanı */}
      <div
        className="relative mx-auto my-8"
        style={{
          width: layoutWidth * scale,
          height: layoutHeight * scale,
        }}
      >
        {tables.map((tableData) => {
          const { table, isAvailable } = tableData;
          const x = table.positionX * scale;
          const y = table.positionY * scale;
          const width = table.width * scale;
          const height = table.height * scale;

          return (
            <div
              key={table.id}
              className={cn(
                'absolute rounded-lg flex items-center justify-center text-white text-xs font-bold transition-all duration-200',
                getTableColor(tableData)
              )}
              style={{
                left: x,
                top: y,
                width,
                height,
                transform: `rotate(${table.rotation}deg)`,
              }}
              onClick={() => isAvailable && onTableSelect(table.id)}
              title={`${table.tableNumber}${!isAvailable ? ' (Dolu)' : ''}`}
            >
              <span className="transform" style={{ transform: `rotate(-${table.rotation}deg)` }}>
                {table.tableNumber}
              </span>
              {renderFeatureIcons(table.features)}
            </div>
          );
        })}
      </div>

      {/* Lejant */}
      <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-sm">
        <div className="flex flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-green-500" />
            <span>Boş</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-red-500" />
            <span>Dolu</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-yellow-500" />
            <span>Yakında</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-blue-500 ring-2 ring-blue-300" />
            <span>Seçili</span>
          </div>
        </div>
      </div>
    </div>
  );
};

