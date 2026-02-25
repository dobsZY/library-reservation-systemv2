/**
 * Mock Data
 * @description Demo data for development and testing
 */

import type { HallStatistics, TableWithOccupancy, OverallStatistics } from '../types';
import { HALL_MAP_CONFIG } from '../constants';

const DEMO_NAMES = [
  'Ahmet Y.',
  'Mehmet K.',
  'Ayşe D.',
  'Fatma S.',
  'Ali R.',
  'Zeynep T.',
  'Mustafa B.',
  'Elif N.',
] as const;

export const mockHalls: HallStatistics[] = [
  {
    id: '1',
    name: 'A Salonu',
    floor: 1,
    description: 'Sessiz Çalışma Alanı',
    layoutWidth: 800,
    layoutHeight: 600,
    capacity: 40,
    isActive: true,
    displayOrder: 1,
    totalTables: 40,
    availableTables: 15,
    occupiedTables: 20,
    reservedTables: 5,
    occupancyRate: 62.5,
  },
  {
    id: '2',
    name: 'B Salonu',
    floor: 1,
    description: 'Grup Çalışma Alanı',
    layoutWidth: 800,
    layoutHeight: 600,
    capacity: 30,
    isActive: true,
    displayOrder: 2,
    totalTables: 30,
    availableTables: 8,
    occupiedTables: 18,
    reservedTables: 4,
    occupancyRate: 73.3,
  },
  {
    id: '3',
    name: 'C Salonu',
    floor: 2,
    description: 'Bilgisayarlı Çalışma Alanı',
    layoutWidth: 800,
    layoutHeight: 600,
    capacity: 25,
    isActive: true,
    displayOrder: 3,
    totalTables: 25,
    availableTables: 20,
    occupiedTables: 3,
    reservedTables: 2,
    occupancyRate: 20,
  },
];

export const generateMockTables = (hallId: string): TableWithOccupancy[] => {
  const hall = mockHalls.find((h) => h.id === hallId);
  if (!hall) return [];

  const hallPrefix = hall.name.charAt(0);
  const rows = 5;
  const cols = 8;
  const tables: TableWithOccupancy[] = [];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const index = row * cols + col;
      const random = Math.random();
      
      let status: 'available' | 'occupied' | 'reserved' = 'available';
      if (index < 25) {
        if (random < 0.4) status = 'available';
        else if (random < 0.75) status = 'occupied';
        else status = 'reserved';
      }

      const randomName = DEMO_NAMES[Math.floor(Math.random() * DEMO_NAMES.length)];
      const randomHour = 14 + Math.floor(Math.random() * 6);
      const randomMinute = Math.random() > 0.5 ? '00' : '30';

      tables.push({
        id: `${hallId}-table-${index + 1}`,
        hallId,
        tableNumber: `${hallPrefix}-${(index + 1).toString().padStart(2, '0')}`,
        position: {
          x: HALL_MAP_CONFIG.padding + col * HALL_MAP_CONFIG.tableGap.x,
          y: HALL_MAP_CONFIG.padding + row * HALL_MAP_CONFIG.tableGap.y,
        },
        dimensions: {
          width: HALL_MAP_CONFIG.tableSize.width,
          height: HALL_MAP_CONFIG.tableSize.height,
        },
        status,
        isActive: true,
        userName: status !== 'available' ? randomName : undefined,
        endTime: status !== 'available' ? `${randomHour}:${randomMinute}` : undefined,
      });
    }
  }

  return tables;
};

export const calculateOverallStatistics = (halls: HallStatistics[]): OverallStatistics => {
  const totals = halls.reduce(
    (acc, hall) => ({
      totalTables: acc.totalTables + hall.totalTables,
      availableTables: acc.availableTables + hall.availableTables,
      occupiedTables: acc.occupiedTables + hall.occupiedTables,
      reservedTables: acc.reservedTables + hall.reservedTables,
    }),
    { totalTables: 0, availableTables: 0, occupiedTables: 0, reservedTables: 0 }
  );

  const occupancyRate = Math.round(
    ((totals.occupiedTables + totals.reservedTables) / totals.totalTables) * 100
  );

  return {
    totalHalls: halls.length,
    ...totals,
    occupancyRate,
  };
};

