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
exports.ReservationsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const config_1 = require("@nestjs/config");
const uuid_1 = require("uuid");
const entities_1 = require("../../database/entities");
let ReservationsService = class ReservationsService {
    reservationRepository;
    tableRepository;
    tableLockRepository;
    hallRepository;
    scheduleRepository;
    configService;
    constructor(reservationRepository, tableRepository, tableLockRepository, hallRepository, scheduleRepository, configService) {
        this.reservationRepository = reservationRepository;
        this.tableRepository = tableRepository;
        this.tableLockRepository = tableLockRepository;
        this.hallRepository = hallRepository;
        this.scheduleRepository = scheduleRepository;
        this.configService = configService;
    }
    async create(userId, createDto) {
        const { tableId, startTime, durationHours } = createDto;
        const table = await this.tableRepository.findOne({
            where: { id: tableId, isActive: true },
            relations: ['hall'],
        });
        if (!table) {
            throw new common_1.NotFoundException('Masa bulunamadı');
        }
        const maxHours = this.configService.get('app.reservationMaxHours', 3);
        const minHours = this.configService.get('app.reservationMinHours', 1);
        if (durationHours < minHours || durationHours > maxHours) {
            throw new common_1.BadRequestException(`Rezervasyon süresi ${minHours}-${maxHours} saat arasında olmalıdır`);
        }
        const reservationDate = new Date(startTime);
        reservationDate.setHours(0, 0, 0, 0);
        const isValidTime = await this.checkOperatingHours(new Date(startTime), durationHours);
        if (!isValidTime) {
            throw new common_1.BadRequestException('Seçilen saat çalışma saatleri dışında');
        }
        const existingActiveReservation = await this.findActiveReservation(userId);
        if (existingActiveReservation) {
            const now = new Date();
            const minutesRemaining = (existingActiveReservation.endTime.getTime() - now.getTime()) / (1000 * 60);
            if (minutesRemaining > 30) {
                throw new common_1.ConflictException('Zaten aktif bir rezervasyonunuz var. Yeni rezervasyon için son 30 dakikayı bekleyin.');
            }
        }
        const startDate = new Date(startTime);
        const lockEndTime = new Date(startDate.getTime() + 3 * 60 * 60 * 1000);
        const conflictingLock = await this.tableLockRepository.findOne({
            where: {
                tableId,
                status: entities_1.LockStatus.ACTIVE,
                lockStart: (0, typeorm_2.LessThanOrEqual)(lockEndTime),
                lockEnd: (0, typeorm_2.MoreThanOrEqual)(startDate),
            },
        });
        if (conflictingLock) {
            throw new common_1.ConflictException('Bu masa seçilen saatlerde müsait değil');
        }
        const endTime = new Date(startDate.getTime() + durationHours * 60 * 60 * 1000);
        const qrTimeoutMinutes = existingActiveReservation
            ? this.configService.get('app.chainQrTimeoutMinutes', 15)
            : this.configService.get('app.qrTimeoutMinutes', 30);
        const qrDeadline = new Date(startDate.getTime() + qrTimeoutMinutes * 60 * 1000);
        const reservation = this.reservationRepository.create({
            userId,
            tableId,
            hallId: table.hallId,
            reservationDate,
            startTime: startDate,
            endTime,
            lockEndTime,
            durationHours,
            qrDeadline,
            isChain: !!existingActiveReservation,
            chainId: existingActiveReservation?.chainId || (0, uuid_1.v4)(),
            chainSequence: existingActiveReservation ? existingActiveReservation.chainSequence + 1 : 1,
            previousReservationId: existingActiveReservation?.id,
            status: entities_1.ReservationStatus.PENDING,
        });
        const savedReservation = await this.reservationRepository.save(reservation);
        const tableLock = this.tableLockRepository.create({
            tableId,
            reservationId: savedReservation.id,
            lockDate: reservationDate,
            lockStart: startDate,
            lockEnd: lockEndTime,
            status: entities_1.LockStatus.ACTIVE,
        });
        await this.tableLockRepository.save(tableLock);
        if (existingActiveReservation) {
            existingActiveReservation.status = entities_1.ReservationStatus.EXTENDED;
            await this.reservationRepository.save(existingActiveReservation);
        }
        return this.findOne(savedReservation.id);
    }
    async findOne(id) {
        const reservation = await this.reservationRepository.findOne({
            where: { id },
            relations: ['table', 'table.features', 'hall'],
        });
        if (!reservation) {
            throw new common_1.NotFoundException('Rezervasyon bulunamadı');
        }
        return reservation;
    }
    async findByUser(userId) {
        return this.reservationRepository.find({
            where: { userId },
            relations: ['table', 'hall'],
            order: { createdAt: 'DESC' },
            take: 50,
        });
    }
    async findActiveReservation(userId) {
        return this.reservationRepository.findOne({
            where: {
                userId,
                status: (0, typeorm_2.In)([entities_1.ReservationStatus.PENDING, entities_1.ReservationStatus.ACTIVE]),
            },
            relations: ['table', 'hall'],
        });
    }
    async cancel(id, userId, reason) {
        const reservation = await this.findOne(id);
        if (reservation.userId !== userId) {
            throw new common_1.BadRequestException('Bu rezervasyon size ait değil');
        }
        if (![entities_1.ReservationStatus.PENDING, entities_1.ReservationStatus.ACTIVE].includes(reservation.status)) {
            throw new common_1.BadRequestException('Bu rezervasyon iptal edilemez');
        }
        reservation.status = entities_1.ReservationStatus.CANCELLED;
        reservation.cancelledAt = new Date();
        if (reason) {
            reservation.cancelledReason = reason;
        }
        const delayMinutes = this.configService.get('app.lockReleaseDelayMinutes', 5);
        const releaseTime = new Date(Date.now() + delayMinutes * 60 * 1000);
        await this.tableLockRepository.update({ reservationId: id }, {
            status: entities_1.LockStatus.CANCELLED,
            releaseScheduledAt: releaseTime,
        });
        return this.reservationRepository.save(reservation);
    }
    async extend(id, userId, extendDto) {
        const reservation = await this.findOne(id);
        if (reservation.userId !== userId) {
            throw new common_1.BadRequestException('Bu rezervasyon size ait değil');
        }
        if (reservation.status !== entities_1.ReservationStatus.ACTIVE) {
            throw new common_1.BadRequestException('Sadece aktif rezervasyonlar uzatılabilir');
        }
        const now = new Date();
        const minutesRemaining = (reservation.endTime.getTime() - now.getTime()) / (1000 * 60);
        if (minutesRemaining > 30) {
            throw new common_1.BadRequestException('Uzatma için son 30 dakikayı bekleyin');
        }
        const maxHours = this.configService.get('app.reservationMaxHours', 3);
        const currentHours = reservation.durationHours;
        const totalHours = currentHours + extendDto.additionalHours;
        if (totalHours > maxHours) {
            throw new common_1.BadRequestException(`Toplam süre ${maxHours} saati geçemez. Yeni rezervasyon yapın.`);
        }
        const newEndTime = new Date(reservation.endTime.getTime() + extendDto.additionalHours * 60 * 60 * 1000);
        reservation.endTime = newEndTime;
        reservation.durationHours = totalHours;
        return this.reservationRepository.save(reservation);
    }
    async getUserTodayStats(userId) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const todayReservations = await this.reservationRepository.find({
            where: {
                userId,
                reservationDate: (0, typeorm_2.Between)(today, tomorrow),
            },
            relations: ['table', 'hall'],
            order: { startTime: 'ASC' },
        });
        const activeReservation = await this.findActiveReservation(userId);
        let canMakeNewReservation = true;
        let canExtend = false;
        if (activeReservation) {
            const now = new Date();
            const minutesRemaining = (activeReservation.endTime.getTime() - now.getTime()) / (1000 * 60);
            canMakeNewReservation = minutesRemaining <= 30;
            canExtend = minutesRemaining <= 30 && activeReservation.durationHours < 3;
        }
        return {
            hasActiveReservation: !!activeReservation,
            activeReservation,
            canMakeNewReservation,
            canExtend,
            todayReservations,
        };
    }
    async checkOperatingHours(startTime, durationHours) {
        const date = new Date(startTime);
        date.setHours(0, 0, 0, 0);
        const schedule = await this.scheduleRepository.findOne({
            where: {
                isActive: true,
                startDate: (0, typeorm_2.LessThanOrEqual)(date),
                endDate: (0, typeorm_2.MoreThanOrEqual)(date),
            },
        });
        if (schedule?.is24h) {
            return true;
        }
        const openingTime = schedule?.openingTime || '08:00';
        const closingTime = schedule?.closingTime || '23:00';
        const [openHour, openMin] = openingTime.split(':').map(Number);
        const [closeHour, closeMin] = closingTime.split(':').map(Number);
        const startHour = startTime.getHours();
        const startMin = startTime.getMinutes();
        const endTime = new Date(startTime.getTime() + durationHours * 60 * 60 * 1000);
        const endHour = endTime.getHours();
        const endMin = endTime.getMinutes();
        const startMinutes = startHour * 60 + startMin;
        const endMinutes = endHour * 60 + endMin;
        const openMinutes = openHour * 60 + openMin;
        const closeMinutes = closeHour * 60 + closeMin;
        return startMinutes >= openMinutes && endMinutes <= closeMinutes;
    }
};
exports.ReservationsService = ReservationsService;
exports.ReservationsService = ReservationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.Reservation)),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.Table)),
    __param(2, (0, typeorm_1.InjectRepository)(entities_1.TableLock)),
    __param(3, (0, typeorm_1.InjectRepository)(entities_1.Hall)),
    __param(4, (0, typeorm_1.InjectRepository)(entities_1.OperatingSchedule)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        config_1.ConfigService])
], ReservationsService);
//# sourceMappingURL=reservations.service.js.map