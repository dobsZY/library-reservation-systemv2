interface Hall {
  id: string;
  name: string;
  floor: number;
  totalTables: number;
  availableTables: number;
  occupiedTables: number;
  reservedTables: number;
  occupancyRate: number;
}

interface HallSelectorProps {
  halls: Hall[];
  selectedHallId: string;
  onSelectHall: (id: string) => void;
}

export function HallSelector({ halls, selectedHallId, onSelectHall }: HallSelectorProps) {
  const getStatusColor = (rate: number) => {
    if (rate < 50) return 'bg-emerald-500';
    if (rate < 80) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  const getStatusBg = (rate: number) => {
    if (rate < 50) return 'bg-emerald-50 text-emerald-700';
    if (rate < 80) return 'bg-amber-50 text-amber-700';
    return 'bg-rose-50 text-rose-700';
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <h2 className="text-lg font-bold text-gray-800">Salonlar</h2>
        <p className="text-sm text-gray-500">Görüntülemek için salon seçin</p>
      </div>
      
      <div className="p-3">
        {halls.map((hall) => {
          const isSelected = hall.id === selectedHallId;
          
          return (
            <button
              key={hall.id}
              onClick={() => onSelectHall(hall.id)}
              className={`w-full text-left p-4 rounded-xl mb-2 last:mb-0 transition-all duration-200 ${
                isSelected 
                  ? 'bg-[#1e3a5f] text-white shadow-lg' 
                  : 'bg-gray-50 hover:bg-gray-100 text-gray-800'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    isSelected ? 'bg-white/20' : 'bg-white'
                  }`}>
                    <svg className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold">{hall.name}</p>
                    <p className={`text-xs ${isSelected ? 'text-blue-200' : 'text-gray-500'}`}>
                      {hall.floor}. Kat
                    </p>
                  </div>
                </div>
                <div className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                  isSelected ? 'bg-white/20 text-white' : getStatusBg(hall.occupancyRate)
                }`}>
                  %{Math.round(hall.occupancyRate)}
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className={`h-2 rounded-full overflow-hidden ${
                isSelected ? 'bg-white/20' : 'bg-gray-200'
              }`}>
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${
                    isSelected ? 'bg-white' : getStatusColor(hall.occupancyRate)
                  }`}
                  style={{ width: `${hall.occupancyRate}%` }}
                />
              </div>
              
              {/* Stats */}
              <div className={`flex items-center justify-between mt-3 text-xs ${
                isSelected ? 'text-blue-200' : 'text-gray-500'
              }`}>
                <span className="flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-emerald-400' : 'bg-emerald-500'}`}></span>
                  {hall.availableTables} boş
                </span>
                <span className="flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-amber-400' : 'bg-amber-500'}`}></span>
                  {hall.reservedTables} rezerve
                </span>
                <span className="flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-rose-400' : 'bg-rose-500'}`}></span>
                  {hall.occupiedTables} dolu
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

