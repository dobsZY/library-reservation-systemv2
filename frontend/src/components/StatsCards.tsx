interface StatsCardsProps {
  totalTables: number;
  availableTables: number;
  occupiedTables: number;
  reservedTables: number;
  occupancyRate: number;
}

export function StatsCards({ 
  totalTables, 
  availableTables, 
  occupiedTables, 
  reservedTables,
  occupancyRate 
}: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {/* Doluluk Oranı */}
      <div className="col-span-2 md:col-span-1 bg-gradient-to-br from-[#1e3a5f] to-[#2d5a87] rounded-2xl p-5 text-white">
        <div className="flex items-center justify-between mb-3">
          <span className="text-blue-200 text-sm font-medium">Doluluk Oranı</span>
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
        </div>
        <p className="text-4xl font-bold">%{occupancyRate}</p>
        <div className="mt-3 h-2 bg-white/20 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${
              occupancyRate < 50 ? 'bg-emerald-400' : 
              occupancyRate < 80 ? 'bg-amber-400' : 'bg-rose-400'
            }`}
            style={{ width: `${occupancyRate}%` }}
          />
        </div>
      </div>

      {/* Toplam Masa */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <span className="text-gray-500 text-sm font-medium">Toplam Masa</span>
          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </div>
        </div>
        <p className="text-3xl font-bold text-gray-800">{totalTables}</p>
        <p className="text-sm text-gray-400 mt-1">Tüm salonlar</p>
      </div>

      {/* Boş Masa */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <span className="text-gray-500 text-sm font-medium">Boş Masa</span>
          <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <p className="text-3xl font-bold text-emerald-600">{availableTables}</p>
        <p className="text-sm text-gray-400 mt-1">Müsait</p>
      </div>

      {/* Rezerve */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <span className="text-gray-500 text-sm font-medium">Rezerve</span>
          <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <p className="text-3xl font-bold text-amber-600">{reservedTables}</p>
        <p className="text-sm text-gray-400 mt-1">Bekliyor</p>
      </div>

      {/* Dolu */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <span className="text-gray-500 text-sm font-medium">Dolu Masa</span>
          <div className="w-8 h-8 bg-rose-100 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        </div>
        <p className="text-3xl font-bold text-rose-600">{occupiedTables}</p>
        <p className="text-sm text-gray-400 mt-1">Kullanımda</p>
      </div>
    </div>
  );
}

