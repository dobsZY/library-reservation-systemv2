import { Repository } from 'typeorm';
import { OperatingSchedule, ScheduleType } from '../../database/entities';
import { CreateScheduleDto, UpdateScheduleDto } from './dto';
export declare class SchedulesService {
    private readonly scheduleRepository;
    constructor(scheduleRepository: Repository<OperatingSchedule>);
    findAll(): Promise<OperatingSchedule[]>;
    findActive(): Promise<OperatingSchedule[]>;
    findCurrent(): Promise<OperatingSchedule | null>;
    findOne(id: string): Promise<OperatingSchedule>;
    create(createDto: CreateScheduleDto): Promise<OperatingSchedule>;
    update(id: string, updateDto: UpdateScheduleDto): Promise<OperatingSchedule>;
    remove(id: string): Promise<void>;
    getOperatingHoursForDate(date: Date): Promise<{
        is24h: boolean;
        openingTime: string;
        closingTime: string;
        scheduleType: ScheduleType;
        scheduleName: string;
    }>;
}
