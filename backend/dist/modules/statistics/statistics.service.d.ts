import { Repository } from 'typeorm';
import { Hall, Table, TableLock, Reservation } from '../../database/entities';
export interface HallOccupancy {
    hallId: string;
    hallName: string;
    floor: number;
    totalTables: number;
    occupiedTables: number;
    availableTables: number;
    occupancyRate: number;
    soonAvailable: number;
}
export interface OverallStatistics {
    totalHalls: number;
    totalTables: number;
    occupiedTables: number;
    availableTables: number;
    overallOccupancyRate: number;
    hallsOccupancy: HallOccupancy[];
    peakHours: Array<{
        hour: number;
        occupancy: number;
    }>;
}
export declare class StatisticsService {
    private readonly hallRepository;
    private readonly tableRepository;
    private readonly tableLockRepository;
    private readonly reservationRepository;
    constructor(hallRepository: Repository<Hall>, tableRepository: Repository<Table>, tableLockRepository: Repository<TableLock>, reservationRepository: Repository<Reservation>);
    getOverallOccupancy(): Promise<OverallStatistics>;
    getHallOccupancy(hallId: string): Promise<HallOccupancy>;
    private getPeakHours;
}
