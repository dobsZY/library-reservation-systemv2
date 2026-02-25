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
exports.ReservationsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const reservations_service_1 = require("./reservations.service");
const check_in_service_1 = require("./check-in.service");
const dto_1 = require("./dto");
let ReservationsController = class ReservationsController {
    reservationsService;
    checkInService;
    constructor(reservationsService, checkInService) {
        this.reservationsService = reservationsService;
        this.checkInService = checkInService;
    }
    async create(userId, createDto) {
        return this.reservationsService.create(userId, createDto);
    }
    async findMyReservations(userId) {
        return this.reservationsService.findByUser(userId);
    }
    async findMyActiveReservation(userId) {
        return this.reservationsService.findActiveReservation(userId);
    }
    async getMyStats(userId) {
        return this.reservationsService.getUserTodayStats(userId);
    }
    async findOne(id) {
        return this.reservationsService.findOne(id);
    }
    async checkIn(id, userId, checkInDto) {
        return this.checkInService.checkIn(id, userId, checkInDto);
    }
    async validateQr(qrCode) {
        return this.checkInService.validateQrCode(qrCode);
    }
    async extend(id, userId, extendDto) {
        return this.reservationsService.extend(id, userId, extendDto);
    }
    async cancel(id, userId, cancelDto) {
        return this.reservationsService.cancel(id, userId, cancelDto?.reason);
    }
};
exports.ReservationsController = ReservationsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Yeni rezervasyon oluştur' }),
    (0, swagger_1.ApiHeader)({ name: 'x-user-id', description: 'Kullanıcı ID (öğrenci no)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Rezervasyon oluşturuldu', type: dto_1.ReservationResponseDto }),
    __param(0, (0, common_1.Headers)('x-user-id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.CreateReservationDto]),
    __metadata("design:returntype", Promise)
], ReservationsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('my'),
    (0, swagger_1.ApiOperation)({ summary: 'Kullanıcının rezervasyonlarını getir' }),
    (0, swagger_1.ApiHeader)({ name: 'x-user-id', description: 'Kullanıcı ID' }),
    __param(0, (0, common_1.Headers)('x-user-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReservationsController.prototype, "findMyReservations", null);
__decorate([
    (0, common_1.Get)('my/active'),
    (0, swagger_1.ApiOperation)({ summary: 'Kullanıcının aktif rezervasyonunu getir' }),
    (0, swagger_1.ApiHeader)({ name: 'x-user-id', description: 'Kullanıcı ID' }),
    __param(0, (0, common_1.Headers)('x-user-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReservationsController.prototype, "findMyActiveReservation", null);
__decorate([
    (0, common_1.Get)('my/stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Kullanıcının bugünkü istatistiklerini getir' }),
    (0, swagger_1.ApiHeader)({ name: 'x-user-id', description: 'Kullanıcı ID' }),
    __param(0, (0, common_1.Headers)('x-user-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReservationsController.prototype, "getMyStats", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Rezervasyon detayını getir' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReservationsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(':id/check-in'),
    (0, swagger_1.ApiOperation)({ summary: 'QR kod ile check-in yap' }),
    (0, swagger_1.ApiHeader)({ name: 'x-user-id', description: 'Kullanıcı ID' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Headers)('x-user-id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, dto_1.CheckInDto]),
    __metadata("design:returntype", Promise)
], ReservationsController.prototype, "checkIn", null);
__decorate([
    (0, common_1.Post)('validate-qr'),
    (0, swagger_1.ApiOperation)({ summary: 'QR kod doğrula' }),
    __param(0, (0, common_1.Body)('qrCode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReservationsController.prototype, "validateQr", null);
__decorate([
    (0, common_1.Put)(':id/extend'),
    (0, swagger_1.ApiOperation)({ summary: 'Rezervasyonu uzat' }),
    (0, swagger_1.ApiHeader)({ name: 'x-user-id', description: 'Kullanıcı ID' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Headers)('x-user-id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, dto_1.ExtendReservationDto]),
    __metadata("design:returntype", Promise)
], ReservationsController.prototype, "extend", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Rezervasyonu iptal et' }),
    (0, swagger_1.ApiHeader)({ name: 'x-user-id', description: 'Kullanıcı ID' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Headers)('x-user-id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, dto_1.CancelReservationDto]),
    __metadata("design:returntype", Promise)
], ReservationsController.prototype, "cancel", null);
exports.ReservationsController = ReservationsController = __decorate([
    (0, swagger_1.ApiTags)('reservations'),
    (0, common_1.Controller)('reservations'),
    __metadata("design:paramtypes", [reservations_service_1.ReservationsService,
        check_in_service_1.CheckInService])
], ReservationsController);
//# sourceMappingURL=reservations.controller.js.map