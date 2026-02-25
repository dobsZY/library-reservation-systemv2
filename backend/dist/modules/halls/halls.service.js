"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HallsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const entities_1 = require("../../database/entities");
let HallsService = class HallsService {
    hallRepository;
    tableRepository;
    tableLockRepository;
    constructor(hallRepository, tableRepository, tableLockRepository) {
        this.hallRepository = hallRepository;
        this.tableRepository = tableRepository;
        this.tableLockRepository = tableLockRepository;
    }
    async findAll() {
        return this.hallRepository.find({
            where: { isActive: true },
            order: { displayOrder: 'ASC', name: 'ASC' },
        });
    }
    async findOne(id) {
        const hall = await this.hallRepository.findOne({
            where: { id, isActive: true },
        });
        if (!hall) {
            throw new common_1.NotFoundException(`Salon bulunamadı: ${id}`);
        }
        return hall;
    }
    async findWithTables(id) {
        const hall = await this.hallRepository.findOne({
            where: { id, isActive: true },
            relations: ['tables', 'tables.features'],
        });
        if (!hall) {
            throw new common_1.NotFoundException(`Salon bulunamadı: ${id}`);
        }
        hall.tables = hall.tables.filter((table) => table.isActive);
        return hall;
    }
    async getHallAvailability(hallId, date, startTime, endTime) {
        const hall = await this.findWithTables(hallId);
        const now = new Date();
        const activeLocks = await this.tableLockRepository.find({
            where: {
                table: { hallId },
                lockDate: date,
                status: entities_1.LockStatus.ACTIVE,
            },
            relations: ['table'],
        });
        const lockMap = new Map();
        activeLocks.forEach((lock) => {
            if (lock.lockStart <= now && lock.lockEnd > now) {
                lockMap.set(lock.tableId, lock);
            }
        });
        const tablesWithAvailability = hall.tables.map((table) => {
            const currentLock = lockMap.get(table.id);
            const isAvailable = !currentLock;
            return {
                table,
                isAvailable,
                currentLock,
                availableFrom: currentLock?.lockEnd,
            };
        });
        const available = tablesWithAvailability.filter((t) => t.isAvailable).length;
        const total = hall.tables.length;
        return {
            hall,
            tables: tablesWithAvailability,
            statistics: {
                total,
                available,
                occupied: total - available,
                occupancyRate: total > 0 ? ((total - available) / total) * 100 : 0,
            },
        };
    }
    async create(createHallDto) {
        const hall = this.hallRepository.create(createHallDto);
        return this.hallRepository.save(hall);
    }
    async update(id, updateHallDto) {
        const hall = await this.findOne(id);
        Object.assign(hall, updateHallDto);
        return this.hallRepository.save(hall);
    }
    async remove(id) {
        const hall = await this.findOne(id);
        hall.isActive = false;
        await this.hallRepository.save(hall);
    }
};
exports.HallsService = HallsService;
exports.HallsService = HallsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.Hall)),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.Table)),
    __param(2, (0, typeorm_1.InjectRepository)(entities_1.TableLock)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], HallsService);
//# sourceMappingURL=halls.service.js.map