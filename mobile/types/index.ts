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

// Reservation Types (backend ile uyumlu)
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
  /** Uzatma reddedildi; rezervasyon planlanan endTime'da tamamlanır (iptal değil) */
  extensionDeclinedAt?: string;
  cancelledAt?: string;
  cancelledReason?: string;
  qrDeadline?: string;
  createdAt: string;
  updatedAt: string;
  table?: Table;
  hall?: Hall;
}

// API Request/Response Types
export interface CreateReservationDto {
  tableId: string;
  startTime: string;
}

export interface CheckInDto {
  qrCode: string;
  latitude: number;
  longitude: number;
  accuracyMeters?: number;
}

export interface ValidateQrResponse {
  isValid: boolean;
  table?: Table;
  message?: string;
}

export interface UserReservationStatus {
  canReserve: boolean;
  hasActiveReservation: boolean;
  activeReservation?: Reservation | null;
  reason?: string;
  canExtend?: boolean;
  /** Ayni masada sonraki saatte baska rezervasyon var; uzatma yapilamaz */
  extensionBlockedByNextReservation?: boolean;
  extensionsRemaining?: number;
  todayReservationCount?: number;
  operatingHours?: {
    opening: string;
    closing: string;
    is24h: boolean;
  };
}

// Hall Availability (GET /halls/:id/availability response)
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

// Hall Slots (GET /halls/:id/slots response)
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

