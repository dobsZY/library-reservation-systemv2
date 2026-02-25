import { Hall } from './hall.entity';
import { TableFeature } from './table-feature.entity';
import { Reservation } from './reservation.entity';
export declare enum TableStatus {
    AVAILABLE = "available",
    MAINTENANCE = "maintenance",
    RESERVED = "reserved"
}
export declare class Table {
    id: string;
    hallId: string;
    tableNumber: string;
    positionX: number;
    positionY: number;
    width: number;
    height: number;
    rotation: number;
    qrCode: string;
    qrGeneratedAt: Date;
    status: TableStatus;
    isActive: boolean;
    notes: string;
    createdAt: Date;
    updatedAt: Date;
    hall: Hall;
    features: TableFeature[];
    reservations: Reservation[];
}
