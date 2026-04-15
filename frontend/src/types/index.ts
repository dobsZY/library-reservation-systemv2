export interface Hall {
  id: string;
  name: string;
  floor: number;
  description?: string;
  layoutWidth: number;
  layoutHeight: number;
  layoutBackgroundUrl?: string;
  layoutConfig?: unknown;
  centerLatitude?: number;
  centerLongitude?: number;
  allowedRadiusMeters: number;
  capacity: number;
  isActive: boolean;
  displayOrder: number;
}

export interface TableFeature {
  id: string;
  name: string;
  icon: string;
  description?: string;
}

export interface Table {
  id: string;
  hallId: string;
  tableNumber: string;
  positionX: number;
  positionY: number;
  width: number;
  height: number;
  rotation: number;
  qrCode: string;
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  isActive: boolean;
  notes?: string;
  features?: TableFeature[];
  hall?: Hall;
}

export type ReservationStatus =
  | 'reserved'
  | 'checked_in'
  | 'completed'
  | 'cancelled'
  | 'expired'
  | 'no_show';

export interface Reservation {
  id: string;
  userId: string;
  tableId: string;
  hallId: string;
  startTime: string;
  endTime: string;
  status: ReservationStatus;
  checkedInAt?: string;
  cancelledAt?: string;
  cancelledReason?: string;
  qrDeadline?: string;
  createdAt: string;
  updatedAt: string;
  table?: Table;
  hall?: Hall;
}

export interface CreateReservationDto {
  tableId: string;
  startTime: string;
}

export interface UserReservationStatus {
  canReserve: boolean;
  hasActiveReservation: boolean;
  activeReservation?: Reservation | null;
  reason?: string;
  canExtend?: boolean;
  extensionsRemaining?: number;
  todayReservationCount?: number;
  operatingHours?: {
    opening: string;
    closing: string;
    is24h: boolean;
  };
}

export interface TableAvailabilityItem {
  table: Table;
  isAvailable: boolean;
  currentLock?: {
    id: string;
    lockStart: string;
    lockEnd: string;
    status: string;
  };
  availableFrom?: string;
}

export interface HallAvailabilityResponse {
  hall: Hall;
  tables: TableAvailabilityItem[];
  statistics: {
    total: number;
    available: number;
    occupied: number;
    occupancyRate: number;
  };
}

export interface TableSlotItem {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  blockedUntil?: string;
}

export interface TableSlotsData {
  tableId: string;
  tableNumber: string;
  features: Array<{ id: string; name: string; icon: string }>;
  slots: TableSlotItem[];
}

export interface HallSlotsResponse {
  hallId: string;
  hallName: string;
  date: string;
  operatingHours: { opening: string; closing: string; is24h: boolean };
  tables: TableSlotsData[];
}

export interface OverallStatistics {
  totalTables: number;
  availableTables: number;
  occupiedTables: number;
  overallOccupancyRate: number;
  hallsOccupancy: Array<{
    hallId: string;
    hallName: string;
    totalTables: number;
    availableTables: number;
    occupancyRate: number;
  }>;
}

export interface HallOccupancy {
  hallId: string;
  hallName: string;
  totalTables: number;
  availableTables: number;
  occupancyRate: number;
}

export interface LoginResponse {
  accessToken: string;
  user: {
    id: string;
    studentNumber: string;
    fullName: string;
    role: string;
  };
}

export interface AdminUser {
  id: string;
  studentNumber: string;
  fullName: string;
  role: string;
  isActive: boolean;
  hasActiveSession: boolean;
  createdAt: string;
}

export interface AdminReservation {
  id: string;
  userId: string;
  tableId: string;
  hallId: string;
  reservationDate: string;
  startTime: string;
  endTime: string;
  status: string;
  createdAt: string;
  cancelledAt?: string;
  cancelledReason?: string;
  user?: { id: string; studentNumber: string; fullName: string };
  table?: { id: string; tableNumber: string };
  hall?: { id: string; name: string };
}

export interface AdminHall {
  id: string;
  name: string;
  floor: number;
  isActive: boolean;
}

export interface AdminTable {
  id: string;
  tableNumber: string;
  positionX: number;
  positionY: number;
  width: number;
  height: number;
  isActive: boolean;
  features: Array<{ id: string; name: string; icon: string }>;
}

export interface AdminOverview {
  totalUsers: number;
  totalReservations: number;
  activeReservations: number;
  noShowCount: number;
  cancelledReservations: number;
  occupancyRate: number;
}
