export declare class CreateReservationDto {
    tableId: string;
    startTime: string;
    durationHours: number;
}
export declare class ExtendReservationDto {
    additionalHours: number;
}
export declare class CancelReservationDto {
    reason?: string;
}
export declare class CheckInDto {
    qrCode: string;
    latitude?: number;
    longitude?: number;
}
export declare class ReservationResponseDto {
    id: string;
    userId: string;
    tableId: string;
    hallId: string;
    reservationDate: Date;
    startTime: Date;
    endTime: Date;
    lockEndTime: Date;
    durationHours: number;
    status: string;
    isChain: boolean;
    checkedInAt: Date;
    qrDeadline: Date;
    table: object;
    hall: object;
    createdAt: Date;
}
