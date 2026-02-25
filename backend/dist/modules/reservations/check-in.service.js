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
exports.CheckInService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const config_1 = require("@nestjs/config");
const geolib = __importStar(require("geolib"));
const entities_1 = require("../../database/entities");
let CheckInService = class CheckInService {
    reservationRepository;
    tableRepository;
    hallRepository;
    configService;
    constructor(reservationRepository, tableRepository, hallRepository, configService) {
        this.reservationRepository = reservationRepository;
        this.tableRepository = tableRepository;
        this.hallRepository = hallRepository;
        this.configService = configService;
    }
    async checkIn(reservationId, userId, checkInDto) {
        const reservation = await this.reservationRepository.findOne({
            where: { id: reservationId },
            relations: ['table', 'table.hall'],
        });
        if (!reservation) {
            throw new common_1.NotFoundException('Rezervasyon bulunamadı');
        }
        if (reservation.userId !== userId) {
            throw new common_1.BadRequestException('Bu rezervasyon size ait değil');
        }
        if (reservation.status !== entities_1.ReservationStatus.PENDING) {
            throw new common_1.BadRequestException('Bu rezervasyon için check-in yapılamaz');
        }
        const table = await this.tableRepository.findOne({
            where: { id: reservation.tableId },
            relations: ['hall'],
        });
        if (!table) {
            throw new common_1.NotFoundException('Masa bulunamadı');
        }
        if (table.qrCode !== checkInDto.qrCode) {
            throw new common_1.BadRequestException('Geçersiz QR kod. Lütfen doğru masanın QR kodunu okutun.');
        }
        const now = new Date();
        if (now > reservation.qrDeadline) {
            throw new common_1.BadRequestException('QR okutma süresi doldu. Rezervasyonunuz iptal edilmiştir.');
        }
        if (checkInDto.latitude && checkInDto.longitude) {
            const hall = table.hall;
            if (hall.centerLatitude && hall.centerLongitude) {
                const distance = geolib.getDistance({ latitude: checkInDto.latitude, longitude: checkInDto.longitude }, { latitude: hall.centerLatitude, longitude: hall.centerLongitude });
                const maxDistance = this.configService.get('app.locationMaxDistanceMeters', 50);
                if (distance > maxDistance) {
                    throw new common_1.BadRequestException(`Konumunuz kütüphaneden çok uzak (${distance}m). Lütfen kütüphaneye gidin.`);
                }
                reservation.checkInDistanceMeters = distance;
            }
            reservation.checkInLatitude = checkInDto.latitude;
            reservation.checkInLongitude = checkInDto.longitude;
        }
        reservation.status = entities_1.ReservationStatus.ACTIVE;
        reservation.checkedInAt = now;
        return this.reservationRepository.save(reservation);
    }
    async validateQrCode(qrCode) {
        const table = await this.tableRepository.findOne({
            where: { qrCode, isActive: true },
            relations: ['hall', 'features'],
        });
        if (!table) {
            return {
                isValid: false,
                message: 'Geçersiz QR kod',
            };
        }
        return {
            isValid: true,
            table,
        };
    }
};
exports.CheckInService = CheckInService;
exports.CheckInService = CheckInService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.Reservation)),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.Table)),
    __param(2, (0, typeorm_1.InjectRepository)(entities_1.Hall)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        config_1.ConfigService])
], CheckInService);
//# sourceMappingURL=check-in.service.js.map