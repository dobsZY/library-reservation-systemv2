import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Reservation, Table, Hall } from '../../database/entities';
import { CheckInDto } from './dto';
export declare class CheckInService {
    private readonly reservationRepository;
    private readonly tableRepository;
    private readonly hallRepository;
    private readonly configService;
    constructor(reservationRepository: Repository<Reservation>, tableRepository: Repository<Table>, hallRepository: Repository<Hall>, configService: ConfigService);
    checkIn(reservationId: string, userId: string, checkInDto: CheckInDto): Promise<Reservation>;
    validateQrCode(qrCode: string): Promise<{
        isValid: boolean;
        table?: Table;
        message?: string;
    }>;
}
