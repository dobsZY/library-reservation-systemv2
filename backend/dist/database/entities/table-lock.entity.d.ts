import { Table } from './table.entity';
import { Reservation } from './reservation.entity';
export declare enum LockStatus {
    ACTIVE = "active",
    RELEASED = "released",
    CANCELLED = "cancelled"
}
export declare class TableLock {
    id: string;
    tableId: string;
    reservationId: string;
    lockDate: Date;
    lockStart: Date;
    lockEnd: Date;
    status: LockStatus;
    releaseScheduledAt: Date;
    releasedAt: Date;
    createdAt: Date;
    table: Table;
    reservation: Reservation;
}
