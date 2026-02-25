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
exports.HallsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const halls_service_1 = require("./halls.service");
const dto_1 = require("./dto");
let HallsController = class HallsController {
    hallsService;
    constructor(hallsService) {
        this.hallsService = hallsService;
    }
    async findAll() {
        return this.hallsService.findAll();
    }
    async findOne(id) {
        return this.hallsService.findOne(id);
    }
    async findWithTables(id) {
        return this.hallsService.findWithTables(id);
    }
    async getAvailability(id, dateStr) {
        const date = dateStr ? new Date(dateStr) : new Date();
        return this.hallsService.getHallAvailability(id, date);
    }
    async create(createHallDto) {
        return this.hallsService.create(createHallDto);
    }
    async update(id, updateHallDto) {
        return this.hallsService.update(id, updateHallDto);
    }
    async remove(id) {
        return this.hallsService.remove(id);
    }
};
exports.HallsController = HallsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Tüm salonları listele' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Salon listesi', type: [dto_1.HallResponseDto] }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HallsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Salon detayını getir' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Salon detayı', type: dto_1.HallResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Salon bulunamadı' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], HallsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/tables'),
    (0, swagger_1.ApiOperation)({ summary: 'Salon masalarını getir' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Salon ve masaları' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], HallsController.prototype, "findWithTables", null);
__decorate([
    (0, common_1.Get)(':id/availability'),
    (0, swagger_1.ApiOperation)({ summary: 'Salon doluluk durumunu getir' }),
    (0, swagger_1.ApiQuery)({ name: 'date', required: false, description: 'Tarih (YYYY-MM-DD)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Doluluk durumu', type: dto_1.HallAvailabilityDto }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], HallsController.prototype, "getAvailability", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Yeni salon oluştur' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Salon oluşturuldu', type: dto_1.HallResponseDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateHallDto]),
    __metadata("design:returntype", Promise)
], HallsController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Salon güncelle' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Salon güncellendi', type: dto_1.HallResponseDto }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateHallDto]),
    __metadata("design:returntype", Promise)
], HallsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Salon sil (soft delete)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Salon silindi' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], HallsController.prototype, "remove", null);
exports.HallsController = HallsController = __decorate([
    (0, swagger_1.ApiTags)('halls'),
    (0, common_1.Controller)('halls'),
    __metadata("design:paramtypes", [halls_service_1.HallsService])
], HallsController);
//# sourceMappingURL=halls.controller.js.map