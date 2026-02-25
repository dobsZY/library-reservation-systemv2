export declare enum ScheduleType {
    NORMAL = "normal",
    EXAM_MIDTERM = "exam_midterm",
    EXAM_FINAL = "exam_final",
    HOLIDAY = "holiday"
}
export declare class OperatingSchedule {
    id: string;
    name: string;
    scheduleType: ScheduleType;
    startDate: Date;
    endDate: Date;
    is24h: boolean;
    openingTime: string;
    closingTime: string;
    maxDurationHours: number;
    chainQrTimeoutMinutes: number;
    isActive: boolean;
    createdAt: Date;
}
