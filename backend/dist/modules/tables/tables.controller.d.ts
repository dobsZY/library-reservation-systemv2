import { TablesService } from './tables.service';
import { CreateTableDto, UpdateTableDto, CreateBulkTablesDto } from './dto';
export declare class TablesController {
    private readonly tablesService;
    constructor(tablesService: TablesService);
    findAll(hallId?: string): Promise<import("../../database/entities").Table[]>;
    getAllFeatures(): Promise<import("../../database/entities").TableFeature[]>;
    findOne(id: string): Promise<import("../../database/entities").Table>;
    getQrCode(id: string): Promise<{
        qrImage: string;
    }>;
    findByQrCode(qrCode: string): Promise<import("../../database/entities").Table>;
    create(createTableDto: CreateTableDto): Promise<import("../../database/entities").Table>;
    createBulk(createBulkDto: CreateBulkTablesDto): Promise<import("../../database/entities").Table[]>;
    update(id: string, updateTableDto: UpdateTableDto): Promise<import("../../database/entities").Table>;
    regenerateQr(id: string): Promise<import("../../database/entities").Table>;
    remove(id: string): Promise<void>;
}
