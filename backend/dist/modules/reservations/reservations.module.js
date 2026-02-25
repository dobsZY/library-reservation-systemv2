"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReservationsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const reservations_controller_1 = require("./reservations.controller");
const reservations_service_1 = require("./reservations.service");
const check_in_service_1 = require("./check-in.service");
const entities_1 = require("../../database/entities");
const halls_module_1 = require("../halls/halls.module");
let ReservationsModule = class ReservationsModule {
};
exports.ReservationsModule = ReservationsModule;
exports.ReservationsModule = ReservationsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                entities_1.Reservation,
                entities_1.Table,
                entities_1.TableLock,
                entities_1.Hall,
                entities_1.OperatingSchedule,
            ]),
            halls_module_1.HallsModule,
        ],
        controllers: [reservations_controller_1.ReservationsController],
        providers: [reservations_service_1.ReservationsService, check_in_service_1.CheckInService],
        exports: [reservations_service_1.ReservationsService],
    })
], ReservationsModule);
//# sourceMappingURL=reservations.module.js.map