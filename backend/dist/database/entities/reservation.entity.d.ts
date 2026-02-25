import { Table } from './table.entity';
import { Hall } from './hall.entity';
export declare enum ReservationStatus {
    PENDING = "pending",
    ACTIVE = "active",
    COMPLETED = "completed",
    EXTENDED = "extended",
    CANCELLED = "cancelled",
    EXPIRED = "expired",
    NO_SHOW = "no_show"
}
export declare class Reservation {
    id: string;
    userId: string;
    tableId: string;
    hallId: string;
    reservationDate: Date;
    startTime: Date;
    endTime: Date;
    lockEndTime: Date;
    durationHours: number;
    isChain: boolean;
    chainId: string;
    chainSequence: number;
    previousReservationId: string;
    status: ReservationStatus;
    checkedInAt: Date;
    checkInLatitude: number;
    checkInLongitude: number;
    checkInDistanceMeters: number;
    qrDeadline: Date;
    notifQrWarningSent: boolean;
    notifQrExpiredSent: boolean;
    notifExtendReminderSent: boolean;
    notifLeaveWarningSent: boolean;
    cancelledAt: Date;
    cancelledReason: string;
    completedAt: Date;
    createdAt: Date;
    updatedAt: Date;
    table: Table;
    hall: Hall;
    previousReservation: Reservation;
    chainedReservations: Reservation[];
}
