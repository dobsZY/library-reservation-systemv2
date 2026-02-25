import { HallsService } from './halls.service';
import { CreateHallDto, UpdateHallDto } from './dto';
export declare class HallsController {
    private readonly hallsService;
    constructor(hallsService: HallsService);
    findAll(): Promise<import("../../database/entities").Hall[]>;
    findOne(id: string): Promise<import("../../database/entities").Hall>;
    findWithTables(id: string): Promise<import("../../database/entities").Hall>;
    getAvailability(id: string, dateStr?: string): Promise<{
        hall: import("../../database/entities").Hall;
        tables: Array<{
            table: import("../../database/entities").Table;
            isAvailable: boolean;
            currentLock?: import("../../database/entities").TableLock;
            availableFrom?: Date;
        }>;
        statistics: {
            total: number;
            available: number;
            occupied: number;
            occupancyRate: number;
        };
    }>;
    create(createHallDto: CreateHallDto): Promise<import("../../database/entities").Hall>;
    update(id: string, updateHallDto: UpdateHallDto): Promise<import("../../database/entities").Hall>;
    remove(id: string): Promise<void>;
}
