import { ReservationsService } from './reservations.service';
import { CheckInService } from './check-in.service';
import { CreateReservationDto, ExtendReservationDto, CancelReservationDto, CheckInDto } from './dto';
export declare class ReservationsController {
    private readonly reservationsService;
    private readonly checkInService;
    constructor(reservationsService: ReservationsService, checkInService: CheckInService);
    create(userId: string, createDto: CreateReservationDto): Promise<import("../../database/entities").Reservation>;
    findMyReservations(userId: string): Promise<import("../../database/entities").Reservation[]>;
    findMyActiveReservation(userId: string): Promise<import("../../database/entities").Reservation | null>;
    getMyStats(userId: string): Promise<{
        hasActiveReservation: boolean;
        activeReservation: import("../../database/entities").Reservation | null;
        canMakeNewReservation: boolean;
        canExtend: boolean;
        todayReservations: import("../../database/entities").Reservation[];
    }>;
    findOne(id: string): Promise<import("../../database/entities").Reservation>;
    checkIn(id: string, userId: string, checkInDto: CheckInDto): Promise<import("../../database/entities").Reservation>;
    validateQr(qrCode: string): Promise<{
        isValid: boolean;
        table?: import("../../database/entities").Table;
        message?: string;
    }>;
    extend(id: string, userId: string, extendDto: ExtendReservationDto): Promise<import("../../database/entities").Reservation>;
    cancel(id: string, userId: string, cancelDto: CancelReservationDto): Promise<import("../../database/entities").Reservation>;
}
