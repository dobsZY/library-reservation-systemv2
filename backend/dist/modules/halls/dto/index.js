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
exports.HallAvailabilityDto = exports.HallResponseDto = exports.UpdateHallDto = exports.CreateHallDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateHallDto {
    name;
    floor;
    description;
    layoutWidth;
    layoutHeight;
    layoutBackgroundUrl;
    layoutConfig;
    centerLatitude;
    centerLongitude;
    allowedRadiusMeters;
    capacity;
    displayOrder;
}
exports.CreateHallDto = CreateHallDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Ana Okuma Salonu' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreateHallDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1, description: 'Kat numarası' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateHallDto.prototype, "floor", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Merkez kütüphane ana okuma salonu' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateHallDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 800, description: 'Kroki genişliği (piksel)' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(100),
    (0, class_validator_1.Max)(2000),
    __metadata("design:type", Number)
], CreateHallDto.prototype, "layoutWidth", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 600, description: 'Kroki yüksekliği (piksel)' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(100),
    (0, class_validator_1.Max)(2000),
    __metadata("design:type", Number)
], CreateHallDto.prototype, "layoutHeight", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateHallDto.prototype, "layoutBackgroundUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Kroki konfigürasyonu (duvarlar, kapılar, pencereler)',
    }),
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateHallDto.prototype, "layoutConfig", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 38.0225, description: 'Enlem' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateHallDto.prototype, "centerLatitude", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 32.5105, description: 'Boylam' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateHallDto.prototype, "centerLongitude", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 50, description: 'İzin verilen yarıçap (metre)' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(10),
    (0, class_validator_1.Max)(500),
    __metadata("design:type", Number)
], CreateHallDto.prototype, "allowedRadiusMeters", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 50, description: 'Toplam masa kapasitesi' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateHallDto.prototype, "capacity", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 0 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateHallDto.prototype, "displayOrder", void 0);
class UpdateHallDto extends (0, swagger_1.PartialType)(CreateHallDto) {
}
exports.UpdateHallDto = UpdateHallDto;
class HallResponseDto {
    id;
    name;
    floor;
    description;
    layoutWidth;
    layoutHeight;
    capacity;
    isActive;
    createdAt;
    updatedAt;
}
exports.HallResponseDto = HallResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], HallResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], HallResponseDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], HallResponseDto.prototype, "floor", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], HallResponseDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], HallResponseDto.prototype, "layoutWidth", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], HallResponseDto.prototype, "layoutHeight", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], HallResponseDto.prototype, "capacity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], HallResponseDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], HallResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], HallResponseDto.prototype, "updatedAt", void 0);
class HallAvailabilityDto {
    hall;
    tables;
    statistics;
}
exports.HallAvailabilityDto = HallAvailabilityDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", HallResponseDto)
], HallAvailabilityDto.prototype, "hall", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Array)
], HallAvailabilityDto.prototype, "tables", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Object)
], HallAvailabilityDto.prototype, "statistics", void 0);
//# sourceMappingURL=index.js.map