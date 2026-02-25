export declare class CreateHallDto {
    name: string;
    floor: number;
    description?: string;
    layoutWidth: number;
    layoutHeight: number;
    layoutBackgroundUrl?: string;
    layoutConfig?: object;
    centerLatitude?: number;
    centerLongitude?: number;
    allowedRadiusMeters?: number;
    capacity: number;
    displayOrder?: number;
}
declare const UpdateHallDto_base: import("@nestjs/common").Type<Partial<CreateHallDto>>;
export declare class UpdateHallDto extends UpdateHallDto_base {
}
export declare class HallResponseDto {
    id: string;
    name: string;
    floor: number;
    description: string;
    layoutWidth: number;
    layoutHeight: number;
    capacity: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare class HallAvailabilityDto {
    hall: HallResponseDto;
    tables: Array<{
        table: object;
        isAvailable: boolean;
        currentLock?: object;
        availableFrom?: Date;
    }>;
    statistics: {
        total: number;
        available: number;
        occupied: number;
        occupancyRate: number;
    };
}
export {};
