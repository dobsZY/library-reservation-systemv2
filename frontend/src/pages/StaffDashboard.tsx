/**
 * Staff Dashboard Page
 * @description Main dashboard view for library staff
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Header } from '../components/layout/Header';
import { StatisticsCards, HallList, HallMap } from '../components/dashboard';
import { DashboardProvider } from '../context/DashboardContext';
import { mockHalls, generateMockTables, calculateOverallStatistics } from '../data/mock.data';
import { REFRESH_INTERVALS } from '../constants';
import { useInterval } from '../hooks';
import type { HallStatistics, TableWithOccupancy, OverallStatistics } from '../types';

/**
 * Dashboard Content Component
 * Separated for proper context usage
 */
const DashboardContent = () => {
  // State
  const [halls, setHalls] = useState<HallStatistics[]>([]);
  const [selectedHallId, setSelectedHallId] = useState<string | null>(null);
  const [tables, setTables] = useState<TableWithOccupancy[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Derived state
  const selectedHall = useMemo(
    () => halls.find((h) => h.id === selectedHallId),
    [halls, selectedHallId]
  );

  const statistics = useMemo<OverallStatistics | null>(
    () => (halls.length > 0 ? calculateOverallStatistics(halls) : null),
    [halls]
  );

  // Data fetching
  const fetchHalls = useCallback(async () => {
    try {
      // In production, replace with: hallService.getOccupancy()
      await new Promise((resolve) => setTimeout(resolve, 300));
      setHalls(mockHalls);
      
      if (!selectedHallId && mockHalls.length > 0) {
        setSelectedHallId(mockHalls[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch halls:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedHallId]);

  const fetchTables = useCallback(async () => {
    if (!selectedHallId) return;
    
    try {
      // In production, replace with: tableService.getByHallId(selectedHallId)
      await new Promise((resolve) => setTimeout(resolve, 200));
      const newTables = generateMockTables(selectedHallId);
      setTables(newTables);
    } catch (error) {
      console.error('Failed to fetch tables:', error);
    }
  }, [selectedHallId]);

  // Initial load
  useEffect(() => {
    fetchHalls();
  }, [fetchHalls]);

  // Fetch tables when hall changes
  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  // Auto-refresh
  useInterval(fetchHalls, REFRESH_INTERVALS.statistics);
  useInterval(fetchTables, REFRESH_INTERVALS.tables);

  // Handlers
  const handleSelectHall = useCallback((id: string) => {
    setSelectedHallId(id);
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#1e3a5f] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-6 py-6">
        {/* Statistics Cards */}
        {statistics && <StatisticsCards statistics={statistics} />}

        {/* Main Content Grid */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Hall List */}
          <aside className="lg:col-span-1">
            <HallList
              halls={halls}
              selectedHallId={selectedHallId}
              onSelectHall={handleSelectHall}
            />
          </aside>

          {/* Hall Map */}
          <section className="lg:col-span-3">
            <HallMap hall={selectedHall} tables={tables} />
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-4 text-center text-sm text-gray-500">
        <p>© 2024 Selçuk Üniversitesi Kütüphane Yönetim Sistemi</p>
      </footer>
    </div>
  );
};

/**
 * Staff Dashboard Page
 * Wrapped with context provider
 */
export const StaffDashboard = () => {
  return (
    <DashboardProvider>
      <DashboardContent />
    </DashboardProvider>
  );
};

export default StaffDashboard;
