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
exports.UpdateScheduleDto = exports.CreateScheduleDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const entities_1 = require("../../../database/entities");
class CreateScheduleDto {
    name;
    scheduleType;
    startDate;
    endDate;
    is24h;
    openingTime;
    closingTime;
    maxDurationHours;
    chainQrTimeoutMinutes;
}
exports.CreateScheduleDto = CreateScheduleDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Final Haftası 2025' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreateScheduleDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: entities_1.ScheduleType, example: entities_1.ScheduleType.EXAM_FINAL }),
    (0, class_validator_1.IsEnum)(entities_1.ScheduleType),
    __metadata("design:type", String)
], CreateScheduleDto.prototype, "scheduleType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2025-01-13', description: 'Başlangıç tarihi' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateScheduleDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2025-01-26', description: 'Bitiş tarihi' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateScheduleDto.prototype, "endDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: true, description: '7/24 açık mı?' }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateScheduleDto.prototype, "is24h", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '08:00', description: 'Açılış saati' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Matches)(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
        message: 'Geçerli saat formatı: HH:MM',
    }),
    __metadata("design:type", String)
], CreateScheduleDto.prototype, "openingTime", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '23:00', description: 'Kapanış saati' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Matches)(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
        message: 'Geçerli saat formatı: HH:MM',
    }),
    __metadata("design:type", String)
], CreateScheduleDto.prototype, "closingTime", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 3 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(6),
    __metadata("design:type", Number)
], CreateScheduleDto.prototype, "maxDurationHours", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 15 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(5),
    (0, class_validator_1.Max)(60),
    __metadata("design:type", Number)
], CreateScheduleDto.prototype, "chainQrTimeoutMinutes", void 0);
class UpdateScheduleDto extends (0, swagger_1.PartialType)(CreateScheduleDto) {
}
exports.UpdateScheduleDto = UpdateScheduleDto;
//# sourceMappingURL=index.js.map