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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReservationResponseDto = exports.CheckInDto = exports.CancelReservationDto = exports.ExtendReservationDto = exports.CreateReservationDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateReservationDto {
    tableId;
    startTime;
    durationHours;
}
exports.CreateReservationDto = CreateReservationDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Masa ID' }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateReservationDto.prototype, "tableId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Başlangıç zamanı (ISO 8601)', example: '2025-12-28T14:00:00Z' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateReservationDto.prototype, "startTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Süre (saat)', example: 2, minimum: 1, maximum: 3 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(3),
    __metadata("design:type", Number)
], CreateReservationDto.prototype, "durationHours", void 0);
class ExtendReservationDto {
    additionalHours;
}
exports.ExtendReservationDto = ExtendReservationDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Ek süre (saat)', example: 1, minimum: 1, maximum: 2 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(2),
    __metadata("design:type", Number)
], ExtendReservationDto.prototype, "additionalHours", void 0);
class CancelReservationDto {
    reason;
}
exports.CancelReservationDto = CancelReservationDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'İptal nedeni' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CancelReservationDto.prototype, "reason", void 0);
class CheckInDto {
    qrCode;
    latitude;
    longitude;
}
exports.CheckInDto = CheckInDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Masa QR kodu' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CheckInDto.prototype, "qrCode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Kullanıcı enlemi' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CheckInDto.prototype, "latitude", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Kullanıcı boylamı' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CheckInDto.prototype, "longitude", void 0);
class ReservationResponseDto {
    id;
    userId;
    tableId;
    hallId;
    reservationDate;
    startTime;
    endTime;
    lockEndTime;
    durationHours;
    status;
    isChain;
    checkedInAt;
    qrDeadline;
    table;
    hall;
    createdAt;
}
exports.ReservationResponseDto = ReservationResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ReservationResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ReservationResponseDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ReservationResponseDto.prototype, "tableId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ReservationResponseDto.prototype, "hallId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], ReservationResponseDto.prototype, "reservationDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], ReservationResponseDto.prototype, "startTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], ReservationResponseDto.prototype, "endTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], ReservationResponseDto.prototype, "lockEndTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], ReservationResponseDto.prototype, "durationHours", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ReservationResponseDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], ReservationResponseDto.prototype, "isChain", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], ReservationResponseDto.prototype, "checkedInAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], ReservationResponseDto.prototype, "qrDeadline", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Object)
], ReservationResponseDto.prototype, "table", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Object)
], ReservationResponseDto.prototype, "hall", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], ReservationResponseDto.prototype, "createdAt", void 0);
//# sourceMappingURL=index.js.map