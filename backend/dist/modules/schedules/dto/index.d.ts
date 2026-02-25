import { ScheduleType } from '../../../database/entities';
export declare class CreateScheduleDto {
    name: string;
    scheduleType: ScheduleType;
    startDate: string;
    endDate: string;
    is24h?: boolean;
    openingTime?: string;
    closingTime?: string;
    maxDurationHours?: number;
    chainQrTimeoutMinutes?: number;
}
declare const UpdateScheduleDto_base: import("@nestjs/common").Type<Partial<CreateScheduleDto>>;
export declare class UpdateScheduleDto extends UpdateScheduleDto_base {
}
export {};
