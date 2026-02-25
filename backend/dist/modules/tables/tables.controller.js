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
exports.TablesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const tables_service_1 = require("./tables.service");
const dto_1 = require("./dto");
let TablesController = class TablesController {
    tablesService;
    constructor(tablesService) {
        this.tablesService = tablesService;
    }
    async findAll(hallId) {
        return this.tablesService.findAll(hallId);
    }
    async getAllFeatures() {
        return this.tablesService.getAllFeatures();
    }
    async findOne(id) {
        return this.tablesService.findOne(id);
    }
    async getQrCode(id) {
        const qrImage = await this.tablesService.getQrCodeImage(id);
        return { qrImage };
    }
    async findByQrCode(qrCode) {
        return this.tablesService.findByQrCode(qrCode);
    }
    async create(createTableDto) {
        return this.tablesService.create(createTableDto);
    }
    async createBulk(createBulkDto) {
        return this.tablesService.createBulk(createBulkDto.hallId, createBulkDto.tables);
    }
    async update(id, updateTableDto) {
        return this.tablesService.update(id, updateTableDto);
    }
    async regenerateQr(id) {
        return this.tablesService.regenerateQrCode(id);
    }
    async remove(id) {
        return this.tablesService.remove(id);
    }
};
exports.TablesController = TablesController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Tüm masaları listele' }),
    (0, swagger_1.ApiQuery)({ name: 'hallId', required: false, description: 'Salon ID filtresi' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Masa listesi', type: [dto_1.TableResponseDto] }),
    __param(0, (0, common_1.Query)('hallId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TablesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('features'),
    (0, swagger_1.ApiOperation)({ summary: 'Tüm masa özelliklerini listele' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TablesController.prototype, "getAllFeatures", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Masa detayını getir' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Masa detayı', type: dto_1.TableResponseDto }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TablesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/qr'),
    (0, swagger_1.ApiOperation)({ summary: 'Masa QR kodunu getir (base64 image)' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TablesController.prototype, "getQrCode", null);
__decorate([
    (0, common_1.Get)('qr/:qrCode'),
    (0, swagger_1.ApiOperation)({ summary: 'QR kod ile masa bul' }),
    __param(0, (0, common_1.Param)('qrCode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TablesController.prototype, "findByQrCode", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Yeni masa oluştur' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Masa oluşturuldu', type: dto_1.TableResponseDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateTableDto]),
    __metadata("design:returntype", Promise)
], TablesController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('bulk'),
    (0, swagger_1.ApiOperation)({ summary: 'Toplu masa oluştur' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Masalar oluşturuldu', type: [dto_1.TableResponseDto] }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateBulkTablesDto]),
    __metadata("design:returntype", Promise)
], TablesController.prototype, "createBulk", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Masa güncelle' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Masa güncellendi', type: dto_1.TableResponseDto }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateTableDto]),
    __metadata("design:returntype", Promise)
], TablesController.prototype, "update", null);
__decorate([
    (0, common_1.Put)(':id/regenerate-qr'),
    (0, swagger_1.ApiOperation)({ summary: 'Masa QR kodunu yenile' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TablesController.prototype, "regenerateQr", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Masa sil (soft delete)' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TablesController.prototype, "remove", null);
exports.TablesController = TablesController = __decorate([
    (0, swagger_1.ApiTags)('tables'),
    (0, common_1.Controller)('tables'),
    __metadata("design:paramtypes", [tables_service_1.TablesService])
], TablesController);
//# sourceMappingURL=tables.controller.js.map