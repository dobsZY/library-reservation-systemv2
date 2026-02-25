// Hall & Table Types
export interface Hall {
  id: string;
  name: string;
  floor: number;
  description?: string;
  layoutWidth: number;
  layoutHeight: number;
  layoutBackgroundUrl?: string;
  layoutConfig?: any;
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

// Reservation Types
export type ReservationStatus = 
  | 'pending'
  | 'confirmed'
  | 'checked_in'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export interface Reservation {
  id: string;
  userId: string;
  tableId: string;
  reservationDate: string;
  startTime: string;
  endTime: string;
  durationHours: number;
  status: ReservationStatus;
  qrCheckedAt?: string;
  checkInLatitude?: number;
  checkInLongitude?: number;
  checkInDistanceMeters?: number;
  warningNotificationSentAt?: string;
  reminderNotificationSentAt?: string;
  createdAt: string;
  updatedAt: string;
  table?: Table;
}

// API Response Types
export interface HallWithOccupancy extends Hall {
  tables?: Table[];
  totalTables: number;
  availableTables: number;
  occupancyRate: number;
}

export interface TableWithStatus extends Table {
  currentStatus: 'available' | 'occupied' | 'reserved' | 'locked';
  currentReservation?: Reservation;
  nextAvailableTime?: string;
}

export interface CreateReservationDto {
  tableId: string;
  startTime: string;
  durationHours: number;
}

export interface CheckInDto {
  reservationId: string;
  qrCode: string;
  latitude: number;
  longitude: number;
}

export interface UserReservationStatus {
  canReserve: boolean;
  activeReservation?: Reservation | null;
  reason?: string;
  isInRenewalWindow?: boolean;
  remainingMinutes?: number;
}

// Statistics
export interface SystemStatistics {
  totalHalls: number;
  totalTables: number;
  availableTables: number;
  occupiedTables: number;
  reservedTables: number;
  overallOccupancyRate: number;
  hallStats: HallWithOccupancy[];
}

