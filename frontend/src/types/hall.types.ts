/**
 * Hall entity types
 * @description Defines the structure for library hall data
 */

export interface Hall {
  readonly id: string;
  readonly name: string;
  readonly floor: number;
  readonly description?: string;
  readonly layoutWidth: number;
  readonly layoutHeight: number;
  readonly capacity: number;
  readonly isActive: boolean;
  readonly displayOrder: number;
}

export interface HallStatistics extends Hall {
  readonly totalTables: number;
  readonly availableTables: number;
  readonly occupiedTables: number;
  readonly reservedTables: number;
  readonly occupancyRate: number;
}

export interface HallListResponse {
  readonly data: HallStatistics[];
  readonly total: number;
  readonly timestamp: string;
}

