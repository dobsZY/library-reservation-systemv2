export declare class CreateTableDto {
    hallId: string;
    tableNumber: string;
    positionX: number;
    positionY: number;
    width?: number;
    height?: number;
    rotation?: number;
    featureIds?: string[];
    notes?: string;
}
declare const UpdateTableDto_base: import("@nestjs/common").Type<Partial<CreateTableDto>>;
export declare class UpdateTableDto extends UpdateTableDto_base {
}
export declare class BulkTableItemDto {
    tableNumber: string;
    positionX: number;
    positionY: number;
    width?: number;
    height?: number;
    rotation?: number;
    featureIds?: string[];
}
export declare class CreateBulkTablesDto {
    hallId: string;
    tables: BulkTableItemDto[];
}
export declare class TableResponseDto {
    id: string;
    hallId: string;
    tableNumber: string;
    positionX: number;
    positionY: number;
    width: number;
    height: number;
    qrCode: string;
    status: string;
    isActive: boolean;
    features: object[];
    createdAt: Date;
}
export {};
