import { Table } from './table.entity';
export declare class Hall {
    id: string;
    name: string;
    floor: number;
    description: string;
    layoutWidth: number;
    layoutHeight: number;
    layoutBackgroundUrl: string;
    layoutConfig: {
        walls?: Array<{
            x1: number;
            y1: number;
            x2: number;
            y2: number;
        }>;
        doors?: Array<{
            x: number;
            y: number;
            width: number;
            label?: string;
        }>;
        windows?: Array<{
            x: number;
            y: number;
            width: number;
            height: number;
            side: string;
        }>;
        zones?: Array<{
            id: string;
            name: string;
            polygon: number[][];
        }>;
    };
    centerLatitude: number;
    centerLongitude: number;
    allowedRadiusMeters: number;
    capacity: number;
    isActive: boolean;
    displayOrder: number;
    createdAt: Date;
    updatedAt: Date;
    tables: Table[];
}
