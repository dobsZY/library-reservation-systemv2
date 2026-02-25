import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Reservation, Table, TableLock, Hall, OperatingSchedule } from '../../database/entities';
import { CreateReservationDto, ExtendReservationDto } from './dto';
export declare class ReservationsService {
    private readonly reservationRepository;
    private readonly tableRepository;
    private readonly tableLockRepository;
    private readonly hallRepository;
    private readonly scheduleRepository;
    private readonly configService;
    constructor(reservationRepository: Repository<Reservation>, tableRepository: Repository<Table>, tableLockRepository: Repository<TableLock>, hallRepository: Repository<Hall>, scheduleRepository: Repository<OperatingSchedule>, configService: ConfigService);
    create(userId: string, createDto: CreateReservationDto): Promise<Reservation>;
    findOne(id: string): Promise<Reservation>;
    findByUser(userId: string): Promise<Reservation[]>;
    findActiveReservation(userId: string): Promise<Reservation | null>;
    cancel(id: string, userId: string, reason?: string): Promise<Reservation>;
    extend(id: string, userId: string, extendDto: ExtendReservationDto): Promise<Reservation>;
    getUserTodayStats(userId: string): Promise<{
        hasActiveReservation: boolean;
        activeReservation: Reservation | null;
        canMakeNewReservation: boolean;
        canExtend: boolean;
        todayReservations: Reservation[];
    }>;
    private checkOperatingHours;
}
