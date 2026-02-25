import { Repository } from 'typeorm';
import { Table, TableFeature, Hall } from '../../database/entities';
import { CreateTableDto, UpdateTableDto } from './dto';
export declare class TablesService {
    private readonly tableRepository;
    private readonly featureRepository;
    private readonly hallRepository;
    constructor(tableRepository: Repository<Table>, featureRepository: Repository<TableFeature>, hallRepository: Repository<Hall>);
    findAll(hallId?: string): Promise<Table[]>;
    findOne(id: string): Promise<Table>;
    findByQrCode(qrCode: string): Promise<Table>;
    create(createTableDto: CreateTableDto): Promise<Table>;
    createBulk(hallId: string, tables: Array<Omit<CreateTableDto, 'hallId'>>): Promise<Table[]>;
    update(id: string, updateTableDto: UpdateTableDto): Promise<Table>;
    remove(id: string): Promise<void>;
    regenerateQrCode(id: string): Promise<Table>;
    getQrCodeImage(id: string): Promise<string>;
    getAllFeatures(): Promise<TableFeature[]>;
    createFeature(data: Partial<TableFeature>): Promise<TableFeature>;
    private generateQrCode;
}
