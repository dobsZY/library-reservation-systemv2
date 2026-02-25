"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TablesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const uuid_1 = require("uuid");
const QRCode = __importStar(require("qrcode"));
const entities_1 = require("../../database/entities");
let TablesService = class TablesService {
    tableRepository;
    featureRepository;
    hallRepository;
    constructor(tableRepository, featureRepository, hallRepository) {
        this.tableRepository = tableRepository;
        this.featureRepository = featureRepository;
        this.hallRepository = hallRepository;
    }
    async findAll(hallId) {
        const where = { isActive: true };
        if (hallId) {
            where.hallId = hallId;
        }
        return this.tableRepository.find({
            where,
            relations: ['features', 'hall'],
            order: { tableNumber: 'ASC' },
        });
    }
    async findOne(id) {
        const table = await this.tableRepository.findOne({
            where: { id, isActive: true },
            relations: ['features', 'hall'],
        });
        if (!table) {
            throw new common_1.NotFoundException(`Masa bulunamadı: ${id}`);
        }
        return table;
    }
    async findByQrCode(qrCode) {
        const table = await this.tableRepository.findOne({
            where: { qrCode, isActive: true },
            relations: ['features', 'hall'],
        });
        if (!table) {
            throw new common_1.NotFoundException('Geçersiz QR kod');
        }
        return table;
    }
    async create(createTableDto) {
        const hall = await this.hallRepository.findOne({
            where: { id: createTableDto.hallId },
        });
        if (!hall) {
            throw new common_1.NotFoundException(`Salon bulunamadı: ${createTableDto.hallId}`);
        }
        const qrCode = this.generateQrCode(createTableDto.hallId, createTableDto.tableNumber);
        let features = [];
        if (createTableDto.featureIds?.length) {
            features = await this.featureRepository.find({
                where: { id: (0, typeorm_2.In)(createTableDto.featureIds) },
            });
        }
        const table = this.tableRepository.create({
            ...createTableDto,
            qrCode,
            features,
        });
        return this.tableRepository.save(table);
    }
    async createBulk(hallId, tables) {
        const hall = await this.hallRepository.findOne({
            where: { id: hallId },
        });
        if (!hall) {
            throw new common_1.NotFoundException(`Salon bulunamadı: ${hallId}`);
        }
        const createdTables = [];
        for (const tableData of tables) {
            const qrCode = this.generateQrCode(hallId, tableData.tableNumber);
            let features = [];
            if (tableData.featureIds?.length) {
                features = await this.featureRepository.find({
                    where: { id: (0, typeorm_2.In)(tableData.featureIds) },
                });
            }
            const table = this.tableRepository.create({
                ...tableData,
                hallId,
                qrCode,
                features,
            });
            createdTables.push(await this.tableRepository.save(table));
        }
        return createdTables;
    }
    async update(id, updateTableDto) {
        const table = await this.findOne(id);
        if (updateTableDto.featureIds) {
            const features = await this.featureRepository.find({
                where: { id: (0, typeorm_2.In)(updateTableDto.featureIds) },
            });
            table.features = features;
            delete updateTableDto.featureIds;
        }
        Object.assign(table, updateTableDto);
        return this.tableRepository.save(table);
    }
    async remove(id) {
        const table = await this.findOne(id);
        table.isActive = false;
        await this.tableRepository.save(table);
    }
    async regenerateQrCode(id) {
        const table = await this.findOne(id);
        table.qrCode = this.generateQrCode(table.hallId, table.tableNumber);
        table.qrGeneratedAt = new Date();
        return this.tableRepository.save(table);
    }
    async getQrCodeImage(id) {
        const table = await this.findOne(id);
        const qrDataUrl = await QRCode.toDataURL(table.qrCode, {
            width: 300,
            margin: 2,
            color: {
                dark: '#1a1a2e',
                light: '#ffffff',
            },
        });
        return qrDataUrl;
    }
    async getAllFeatures() {
        return this.featureRepository.find({
            where: { isActive: true },
            order: { displayOrder: 'ASC' },
        });
    }
    async createFeature(data) {
        const feature = this.featureRepository.create(data);
        return this.featureRepository.save(feature);
    }
    generateQrCode(hallId, tableNumber) {
        const uniqueId = (0, uuid_1.v4)().slice(0, 8);
        return `SELCUK_LIB_${hallId.slice(0, 8)}_${tableNumber}_${uniqueId}`;
    }
};
exports.TablesService = TablesService;
exports.TablesService = TablesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.Table)),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.TableFeature)),
    __param(2, (0, typeorm_1.InjectRepository)(entities_1.Hall)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], TablesService);
//# sourceMappingURL=tables.service.js.map