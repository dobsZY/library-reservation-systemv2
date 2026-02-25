import { useState } from 'react';

interface Table {
  id: string;
  tableNumber: string;
  positionX: number;
  positionY: number;
  width: number;
  height: number;
  status: 'available' | 'occupied' | 'reserved';
  userName?: string;
  endTime?: string;
}

interface HallMapProps {
  tables: Table[];
  hallName: string;
}

export function HallMap({ tables, hallName }: HallMapProps) {
  const [hoveredTable, setHoveredTable] = useState<Table | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const getTableColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-emerald-500 hover:bg-emerald-600';
      case 'occupied': return 'bg-rose-500 hover:bg-rose-600';
      case 'reserved': return 'bg-amber-500 hover:bg-amber-600';
      default: return 'bg-gray-400';
    }
  };

  const handleMouseEnter = (table: Table, e: React.MouseEvent) => {
    setHoveredTable(table);
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPosition({ 
      x: rect.left + rect.width / 2, 
      y: rect.top - 10 
    });
  };

  return (
    <div className="relative p-6">
      {/* Kroki */}
      <div 
        className="relative bg-gradient-to-br from-slate-100 to-slate-50 rounded-2xl overflow-hidden"
        style={{ height: 480 }}
      >
        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: 'radial-gradient(circle, #cbd5e1 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }}
        />
        
        {/* Entrance */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-[#1e3a5f] text-white px-6 py-2 rounded-t-xl flex items-center gap-2 shadow-lg">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
          </svg>
          <span className="text-sm font-semibold">GİRİŞ</span>
        </div>

        {/* Windows */}
        <div className="absolute top-0 left-0 right-0 flex justify-center gap-8 pt-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="w-16 h-3 bg-sky-200 rounded-b-lg border-x-2 border-b-2 border-sky-300" />
          ))}
        </div>
        <p className="absolute top-5 left-1/2 -translate-x-1/2 text-xs text-gray-400 font-medium">Pencereler</p>

        {/* Tables */}
        {tables.map((table) => (
          <div
            key={table.id}
            className={`absolute rounded-xl cursor-pointer transition-all duration-200 shadow-md hover:shadow-xl hover:scale-105 ${getTableColor(table.status)}`}
            style={{
              left: table.positionX,
              top: table.positionY,
              width: table.width,
              height: table.height,
            }}
            onMouseEnter={(e) => handleMouseEnter(table, e)}
            onMouseLeave={() => setHoveredTable(null)}
          >
            <div className="w-full h-full flex flex-col items-center justify-center text-white">
              <span className="text-xs font-bold">{table.tableNumber.split('-')[1]}</span>
              {table.status !== 'available' && (
                <span className="text-[10px] opacity-80 truncate max-w-[50px]">
                  {table.userName?.split(' ')[0]}
                </span>
              )}
            </div>
            
            {/* Status Indicator */}
            {table.status === 'occupied' && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-rose-600 rounded-full border-2 border-white animate-pulse" />
            )}
          </div>
        ))}

        {/* Hall Label */}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl shadow-sm">
          <p className="text-sm font-semibold text-gray-700">{hallName}</p>
        </div>
      </div>

      {/* Tooltip */}
      {hoveredTable && hoveredTable.status !== 'available' && (
        <div 
          className="fixed z-50 bg-gray-900 text-white px-4 py-3 rounded-xl shadow-2xl pointer-events-none transform -translate-x-1/2 -translate-y-full"
          style={{ 
            left: tooltipPosition.x, 
            top: tooltipPosition.y - 10,
          }}
        >
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              hoveredTable.status === 'occupied' ? 'bg-rose-500' : 'bg-amber-500'
            }`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold">Masa {hoveredTable.tableNumber}</p>
              <p className="text-sm text-gray-300">{hoveredTable.userName}</p>
              <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Bitiş: {hoveredTable.endTime}
              </p>
            </div>
          </div>
          {/* Arrow */}
          <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-gray-900" />
        </div>
      )}

      {/* Quick Stats */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="bg-emerald-50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-emerald-600">
            {tables.filter(t => t.status === 'available').length}
          </p>
          <p className="text-sm text-emerald-700">Boş Masa</p>
        </div>
        <div className="bg-amber-50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-amber-600">
            {tables.filter(t => t.status === 'reserved').length}
          </p>
          <p className="text-sm text-amber-700">Rezerve</p>
        </div>
        <div className="bg-rose-50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-rose-600">
            {tables.filter(t => t.status === 'occupied').length}
          </p>
          <p className="text-sm text-rose-700">Dolu</p>
        </div>
      </div>
    </div>
  );
}

