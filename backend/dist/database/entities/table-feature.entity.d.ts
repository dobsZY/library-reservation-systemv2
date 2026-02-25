import { Table } from './table.entity';
export declare class TableFeature {
    id: string;
    code: string;
    name: string;
    icon: string;
    description: string;
    displayOrder: number;
    isActive: boolean;
    createdAt: Date;
    tables: Table[];
}
