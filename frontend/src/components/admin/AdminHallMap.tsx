import React, { useState } from 'react';
import { User, Clock, X } from 'lucide-react';
import type { Hall, TableAvailability } from '../../types';
import { formatTime, getRemainingTimeText } from '../../utils/date';

interface AdminHallMapProps {
  hall: Hall;
  tables: TableAvailability[];
}

interface TableDetailsPopup {
  table: TableAvailability;
  x: number;
  y: number;
}

export const AdminHallMap: React.FC<AdminHallMapProps> = ({ hall, tables }) => {
  const [popup, setPopup] = useState<TableDetailsPopup | null>(null);
  const scale = 0.8;

  const getTableColor = (table: TableAvailability): string => {
    if (!table.isAvailable) {
      // Yakında boşalacak mı kontrol et (30 dk içinde)
      if (table.currentLock) {
        const remaining = new Date(table.currentLock.lockEnd).getTime() - Date.now();
        if (remaining < 30 * 60 * 1000) {
          return 'bg-yellow-500 hover:bg-yellow-400';
        }
      }
      return 'bg-red-500 hover:bg-red-400';
    }
    return 'bg-green-500 hover:bg-green-400';
  };

  const handleTableClick = (table: TableAvailability, e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPopup({
      table,
      x: rect.left + rect.width / 2,
      y: rect.top,
    });
  };

  return (
    <div className="relative">
      {/* Harita Container */}
      <div className="bg-gray-800 rounded-2xl p-8 overflow-auto border border-gray-700">
        {/* Giriş */}
        <div className="text-center mb-4">
          <span className="bg-blue-600 text-white px-6 py-2 rounded-full text-sm font-medium">
            🚪 GİRİŞ
          </span>
        </div>

        {/* Masa Grid */}
        <div
          className="relative mx-auto"
          style={{
            width: hall.layoutWidth * scale,
            height: hall.layoutHeight * scale,
          }}
        >
          {tables.map((tableData) => {
            const { table } = tableData;
            const x = table.positionX * scale;
            const y = table.positionY * scale;
            const width = table.width * scale;
            const height = table.height * scale;

            return (
              <div
                key={table.id}
                className={`absolute rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all duration-200 shadow-lg ${getTableColor(tableData)}`}
                style={{
                  left: x,
                  top: y,
                  width,
                  height,
                  transform: `rotate(${table.rotation}deg)`,
                }}
                onClick={(e) => handleTableClick(tableData, e)}
              >
                <span 
                  className="text-white text-xs font-bold"
                  style={{ transform: `rotate(-${table.rotation}deg)` }}
                >
                  {table.tableNumber}
                </span>
                {!tableData.isAvailable && (
                  <User 
                    size={12} 
                    className="text-white mt-0.5"
                    style={{ transform: `rotate(-${table.rotation}deg)` }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Popup */}
      {popup && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setPopup(null)}
          />
          
          {/* Popup Content */}
          <div
            className="fixed z-50 bg-gray-800 border border-gray-600 rounded-xl shadow-2xl p-4 min-w-64"
            style={{
              left: popup.x,
              top: popup.y - 10,
              transform: 'translate(-50%, -100%)',
            }}
          >
            <button
              onClick={() => setPopup(null)}
              className="absolute top-2 right-2 text-gray-400 hover:text-white"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                popup.table.isAvailable ? 'bg-green-500' : 'bg-red-500'
              }`}>
                <span className="font-bold text-white">{popup.table.table.tableNumber}</span>
              </div>
              <div>
                <div className="font-semibold">Masa {popup.table.table.tableNumber}</div>
                <div className={`text-sm ${popup.table.isAvailable ? 'text-green-400' : 'text-red-400'}`}>
                  {popup.table.isAvailable ? '✓ Boş' : '● Kullanımda'}
                </div>
              </div>
            </div>

            {/* Özellikler */}
            {popup.table.table.features.length > 0 && (
              <div className="flex gap-1 mb-3">
                {popup.table.table.features.map((f) => (
                  <span 
                    key={f.id} 
                    className="bg-gray-700 px-2 py-1 rounded text-xs"
                    title={f.name}
                  >
                    {f.icon} {f.name}
                  </span>
                ))}
              </div>
            )}

            {/* Rezervasyon Bilgisi */}
            {!popup.table.isAvailable && popup.table.currentLock && (
              <div className="bg-gray-900 rounded-lg p-3 text-sm">
                <div className="flex items-center gap-2 text-gray-400 mb-2">
                  <Clock size={14} />
                  <span>Rezervasyon Bilgisi</span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Bitiş:</span>
                    <span>{formatTime(popup.table.currentLock.lockEnd)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Kalan:</span>
                    <span className="text-yellow-400">
                      {getRemainingTimeText(popup.table.currentLock.lockEnd)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {popup.table.isAvailable && (
              <div className="bg-green-900/30 rounded-lg p-3 text-sm text-green-400">
                ✓ Masa şu an boş ve rezervasyona açık
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

