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
exports.StatisticsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const entities_1 = require("../../database/entities");
let StatisticsService = class StatisticsService {
    hallRepository;
    tableRepository;
    tableLockRepository;
    reservationRepository;
    constructor(hallRepository, tableRepository, tableLockRepository, reservationRepository) {
        this.hallRepository = hallRepository;
        this.tableRepository = tableRepository;
        this.tableLockRepository = tableLockRepository;
        this.reservationRepository = reservationRepository;
    }
    async getOverallOccupancy() {
        const now = new Date();
        const today = new Date(now);
        today.setHours(0, 0, 0, 0);
        const halls = await this.hallRepository.find({
            where: { isActive: true },
            order: { displayOrder: 'ASC' },
        });
        const allTables = await this.tableRepository.find({
            where: { isActive: true },
        });
        const activeLocks = await this.tableLockRepository
            .createQueryBuilder('lock')
            .where('lock.status = :status', { status: entities_1.LockStatus.ACTIVE })
            .andWhere('lock.lock_start <= :now', { now })
            .andWhere('lock.lock_end > :now', { now })
            .getMany();
        const lockedTableIds = new Set(activeLocks.map((l) => l.tableId));
        const soonAvailableTime = new Date(now.getTime() + 30 * 60 * 1000);
        const soonAvailableLocks = activeLocks.filter((l) => l.lockEnd <= soonAvailableTime);
        const soonAvailableTableIds = new Set(soonAvailableLocks.map((l) => l.tableId));
        const hallsOccupancy = halls.map((hall) => {
            const hallTables = allTables.filter((t) => t.hallId === hall.id);
            const occupiedCount = hallTables.filter((t) => lockedTableIds.has(t.id)).length;
            const soonAvailableCount = hallTables.filter((t) => soonAvailableTableIds.has(t.id)).length;
            return {
                hallId: hall.id,
                hallName: hall.name,
                floor: hall.floor,
                totalTables: hallTables.length,
                occupiedTables: occupiedCount,
                availableTables: hallTables.length - occupiedCount,
                occupancyRate: hallTables.length > 0 ? (occupiedCount / hallTables.length) * 100 : 0,
                soonAvailable: soonAvailableCount,
            };
        });
        const totalTables = allTables.length;
        const occupiedTables = lockedTableIds.size;
        return {
            totalHalls: halls.length,
            totalTables,
            occupiedTables,
            availableTables: totalTables - occupiedTables,
            overallOccupancyRate: totalTables > 0 ? (occupiedTables / totalTables) * 100 : 0,
            hallsOccupancy,
            peakHours: await this.getPeakHours(),
        };
    }
    async getHallOccupancy(hallId) {
        const now = new Date();
        const hall = await this.hallRepository.findOne({
            where: { id: hallId, isActive: true },
        });
        if (!hall) {
            throw new Error('Salon bulunamadı');
        }
        const tables = await this.tableRepository.find({
            where: { hallId, isActive: true },
        });
        const activeLocks = await this.tableLockRepository
            .createQueryBuilder('lock')
            .innerJoin('lock.table', 'table')
            .where('table.hall_id = :hallId', { hallId })
            .andWhere('lock.status = :status', { status: entities_1.LockStatus.ACTIVE })
            .andWhere('lock.lock_start <= :now', { now })
            .andWhere('lock.lock_end > :now', { now })
            .getMany();
        const lockedTableIds = new Set(activeLocks.map((l) => l.tableId));
        const soonAvailableTime = new Date(now.getTime() + 30 * 60 * 1000);
        const soonAvailableCount = activeLocks.filter((l) => l.lockEnd <= soonAvailableTime).length;
        const occupiedCount = lockedTableIds.size;
        return {
            hallId: hall.id,
            hallName: hall.name,
            floor: hall.floor,
            totalTables: tables.length,
            occupiedTables: occupiedCount,
            availableTables: tables.length - occupiedCount,
            occupancyRate: tables.length > 0 ? (occupiedCount / tables.length) * 100 : 0,
            soonAvailable: soonAvailableCount,
        };
    }
    async getPeakHours() {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const reservations = await this.reservationRepository
            .createQueryBuilder('r')
            .select('EXTRACT(HOUR FROM r.start_time)', 'hour')
            .addSelect('COUNT(*)', 'count')
            .where('r.created_at >= :sevenDaysAgo', { sevenDaysAgo })
            .groupBy('EXTRACT(HOUR FROM r.start_time)')
            .orderBy('hour', 'ASC')
            .getRawMany();
        const maxCount = Math.max(...reservations.map((r) => parseInt(r.count) || 0), 1);
        return reservations.map((r) => ({
            hour: parseInt(r.hour),
            occupancy: (parseInt(r.count) / maxCount) * 100,
        }));
    }
};
exports.StatisticsService = StatisticsService;
exports.StatisticsService = StatisticsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.Hall)),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.Table)),
    __param(2, (0, typeorm_1.InjectRepository)(entities_1.TableLock)),
    __param(3, (0, typeorm_1.InjectRepository)(entities_1.Reservation)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], StatisticsService);
//# sourceMappingURL=statistics.service.js.map