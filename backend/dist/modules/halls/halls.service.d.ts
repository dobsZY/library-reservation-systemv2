import { Repository } from 'typeorm';
import { Hall, Table, TableLock } from '../../database/entities';
import { CreateHallDto, UpdateHallDto } from './dto';
export declare class HallsService {
    private readonly hallRepository;
    private readonly tableRepository;
    private readonly tableLockRepository;
    constructor(hallRepository: Repository<Hall>, tableRepository: Repository<Table>, tableLockRepository: Repository<TableLock>);
    findAll(): Promise<Hall[]>;
    findOne(id: string): Promise<Hall>;
    findWithTables(id: string): Promise<Hall>;
    getHallAvailability(hallId: string, date: Date, startTime?: Date, endTime?: Date): Promise<{
        hall: Hall;
        tables: Array<{
            table: Table;
            isAvailable: boolean;
            currentLock?: TableLock;
            availableFrom?: Date;
        }>;
        statistics: {
            total: number;
            available: number;
            occupied: number;
            occupancyRate: number;
        };
    }>;
    create(createHallDto: CreateHallDto): Promise<Hall>;
    update(id: string, updateHallDto: UpdateHallDto): Promise<Hall>;
    remove(id: string): Promise<void>;
}
