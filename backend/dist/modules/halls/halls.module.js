"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HallsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const halls_controller_1 = require("./halls.controller");
const halls_service_1 = require("./halls.service");
const entities_1 = require("../../database/entities");
let HallsModule = class HallsModule {
};
exports.HallsModule = HallsModule;
exports.HallsModule = HallsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([entities_1.Hall, entities_1.Table, entities_1.TableLock])],
        controllers: [halls_controller_1.HallsController],
        providers: [halls_service_1.HallsService],
        exports: [halls_service_1.HallsService],
    })
], HallsModule);
//# sourceMappingURL=halls.module.js.map