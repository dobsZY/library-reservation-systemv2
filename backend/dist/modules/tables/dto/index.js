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
exports.TableResponseDto = exports.CreateBulkTablesDto = exports.BulkTableItemDto = exports.UpdateTableDto = exports.CreateTableDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class CreateTableDto {
    hallId;
    tableNumber;
    positionX;
    positionY;
    width;
    height;
    rotation;
    featureIds;
    notes;
}
exports.CreateTableDto = CreateTableDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Salon ID' }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateTableDto.prototype, "hallId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'A-01', description: 'Masa numarası' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(20),
    __metadata("design:type", String)
], CreateTableDto.prototype, "tableNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 100, description: 'X koordinatı' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateTableDto.prototype, "positionX", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 150, description: 'Y koordinatı' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateTableDto.prototype, "positionY", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 40, description: 'Masa genişliği' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(20),
    (0, class_validator_1.Max)(200),
    __metadata("design:type", Number)
], CreateTableDto.prototype, "width", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 40, description: 'Masa yüksekliği' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(20),
    (0, class_validator_1.Max)(200),
    __metadata("design:type", Number)
], CreateTableDto.prototype, "height", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 0, description: 'Döndürme açısı' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateTableDto.prototype, "rotation", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Masa özellikleri ID listesi' }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsUUID)('4', { each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateTableDto.prototype, "featureIds", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateTableDto.prototype, "notes", void 0);
class UpdateTableDto extends (0, swagger_1.PartialType)(CreateTableDto) {
}
exports.UpdateTableDto = UpdateTableDto;
class BulkTableItemDto {
    tableNumber;
    positionX;
    positionY;
    width;
    height;
    rotation;
    featureIds;
}
exports.BulkTableItemDto = BulkTableItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'A-01' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(20),
    __metadata("design:type", String)
], BulkTableItemDto.prototype, "tableNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 100 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], BulkTableItemDto.prototype, "positionX", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 150 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], BulkTableItemDto.prototype, "positionY", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], BulkTableItemDto.prototype, "width", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], BulkTableItemDto.prototype, "height", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], BulkTableItemDto.prototype, "rotation", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsUUID)('4', { each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], BulkTableItemDto.prototype, "featureIds", void 0);
class CreateBulkTablesDto {
    hallId;
    tables;
}
exports.CreateBulkTablesDto = CreateBulkTablesDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Salon ID' }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateBulkTablesDto.prototype, "hallId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [BulkTableItemDto], description: 'Masa listesi' }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => BulkTableItemDto),
    __metadata("design:type", Array)
], CreateBulkTablesDto.prototype, "tables", void 0);
class TableResponseDto {
    id;
    hallId;
    tableNumber;
    positionX;
    positionY;
    width;
    height;
    qrCode;
    status;
    isActive;
    features;
    createdAt;
}
exports.TableResponseDto = TableResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], TableResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], TableResponseDto.prototype, "hallId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], TableResponseDto.prototype, "tableNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], TableResponseDto.prototype, "positionX", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], TableResponseDto.prototype, "positionY", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], TableResponseDto.prototype, "width", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], TableResponseDto.prototype, "height", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], TableResponseDto.prototype, "qrCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], TableResponseDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], TableResponseDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Array)
], TableResponseDto.prototype, "features", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], TableResponseDto.prototype, "createdAt", void 0);
//# sourceMappingURL=index.js.map