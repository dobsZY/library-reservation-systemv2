import { SchedulesService } from './schedules.service';
import { CreateScheduleDto, UpdateScheduleDto } from './dto';
export declare class SchedulesController {
    private readonly schedulesService;
    constructor(schedulesService: SchedulesService);
    findAll(): Promise<import("../../database/entities").OperatingSchedule[]>;
    findActive(): Promise<import("../../database/entities").OperatingSchedule[]>;
    findCurrent(): Promise<import("../../database/entities").OperatingSchedule | null>;
    getOperatingHours(dateStr?: string): Promise<{
        is24h: boolean;
        openingTime: string;
        closingTime: string;
        scheduleType: import("../../database/entities").ScheduleType;
        scheduleName: string;
    }>;
    findOne(id: string): Promise<import("../../database/entities").OperatingSchedule>;
    create(createDto: CreateScheduleDto): Promise<import("../../database/entities").OperatingSchedule>;
    update(id: string, updateDto: UpdateScheduleDto): Promise<import("../../database/entities").OperatingSchedule>;
    remove(id: string): Promise<void>;
}
