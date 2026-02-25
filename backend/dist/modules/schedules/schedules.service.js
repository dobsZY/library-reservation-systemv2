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
exports.SchedulesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const entities_1 = require("../../database/entities");
let SchedulesService = class SchedulesService {
    scheduleRepository;
    constructor(scheduleRepository) {
        this.scheduleRepository = scheduleRepository;
    }
    async findAll() {
        return this.scheduleRepository.find({
            order: { startDate: 'DESC' },
        });
    }
    async findActive() {
        return this.scheduleRepository.find({
            where: { isActive: true },
            order: { startDate: 'DESC' },
        });
    }
    async findCurrent() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return this.scheduleRepository.findOne({
            where: {
                isActive: true,
                startDate: (0, typeorm_2.LessThanOrEqual)(today),
                endDate: (0, typeorm_2.MoreThanOrEqual)(today),
            },
        });
    }
    async findOne(id) {
        const schedule = await this.scheduleRepository.findOne({
            where: { id },
        });
        if (!schedule) {
            throw new common_1.NotFoundException('Takvim bulunamadı');
        }
        return schedule;
    }
    async create(createDto) {
        const schedule = this.scheduleRepository.create(createDto);
        return this.scheduleRepository.save(schedule);
    }
    async update(id, updateDto) {
        const schedule = await this.findOne(id);
        Object.assign(schedule, updateDto);
        return this.scheduleRepository.save(schedule);
    }
    async remove(id) {
        const schedule = await this.findOne(id);
        schedule.isActive = false;
        await this.scheduleRepository.save(schedule);
    }
    async getOperatingHoursForDate(date) {
        const schedule = await this.scheduleRepository.findOne({
            where: {
                isActive: true,
                startDate: (0, typeorm_2.LessThanOrEqual)(date),
                endDate: (0, typeorm_2.MoreThanOrEqual)(date),
            },
        });
        if (schedule) {
            return {
                is24h: schedule.is24h,
                openingTime: schedule.openingTime,
                closingTime: schedule.closingTime,
                scheduleType: schedule.scheduleType,
                scheduleName: schedule.name,
            };
        }
        return {
            is24h: false,
            openingTime: '08:00',
            closingTime: '23:00',
            scheduleType: entities_1.ScheduleType.NORMAL,
            scheduleName: 'Normal Dönem',
        };
    }
};
exports.SchedulesService = SchedulesService;
exports.SchedulesService = SchedulesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.OperatingSchedule)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], SchedulesService);
//# sourceMappingURL=schedules.service.js.map