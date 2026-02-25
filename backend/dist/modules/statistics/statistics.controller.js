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
exports.StatisticsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const statistics_service_1 = require("./statistics.service");
let StatisticsController = class StatisticsController {
    statisticsService;
    constructor(statisticsService) {
        this.statisticsService = statisticsService;
    }
    async getOverallOccupancy() {
        return this.statisticsService.getOverallOccupancy();
    }
    async getHallOccupancy(hallId) {
        return this.statisticsService.getHallOccupancy(hallId);
    }
};
exports.StatisticsController = StatisticsController;
__decorate([
    (0, common_1.Get)('occupancy'),
    (0, swagger_1.ApiOperation)({ summary: 'Genel doluluk istatistiklerini getir' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Genel doluluk istatistikleri',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], StatisticsController.prototype, "getOverallOccupancy", null);
__decorate([
    (0, common_1.Get)('occupancy/hall/:hallId'),
    (0, swagger_1.ApiOperation)({ summary: 'Salon bazlı doluluk istatistiklerini getir' }),
    __param(0, (0, common_1.Param)('hallId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StatisticsController.prototype, "getHallOccupancy", null);
exports.StatisticsController = StatisticsController = __decorate([
    (0, swagger_1.ApiTags)('statistics'),
    (0, common_1.Controller)('statistics'),
    __metadata("design:paramtypes", [statistics_service_1.StatisticsService])
], StatisticsController);
//# sourceMappingURL=statistics.controller.js.map