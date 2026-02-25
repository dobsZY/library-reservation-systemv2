/**
 * Table entity types
 * @description Defines the structure for library table data
 */

export type TableStatus = 'available' | 'occupied' | 'reserved' | 'maintenance';

export interface TablePosition {
  readonly x: number;
  readonly y: number;
}

export interface TableDimensions {
  readonly width: number;
  readonly height: number;
}

export interface Table {
  readonly id: string;
  readonly hallId: string;
  readonly tableNumber: string;
  readonly position: TablePosition;
  readonly dimensions: TableDimensions;
  readonly status: TableStatus;
  readonly isActive: boolean;
}

export interface TableWithOccupancy extends Table {
  readonly userName?: string;
  readonly userStudentId?: string;
  readonly startTime?: string;
  readonly endTime?: string;
  readonly remainingMinutes?: number;
}

export interface TableListResponse {
  readonly data: TableWithOccupancy[];
  readonly hallId: string;
  readonly timestamp: string;
}

