"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const schedule_1 = require("@nestjs/schedule");
const config_2 = require("./config");
const entities_1 = require("./database/entities");
const halls_module_1 = require("./modules/halls/halls.module");
const tables_module_1 = require("./modules/tables/tables.module");
const reservations_module_1 = require("./modules/reservations/reservations.module");
const statistics_module_1 = require("./modules/statistics/statistics.module");
const schedules_module_1 = require("./modules/schedules/schedules.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                load: [config_2.appConfig, config_2.databaseConfig, config_2.redisConfig],
                envFilePath: ['.env', '.env.development', '.env.local'],
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => ({
                    type: 'postgres',
                    host: configService.get('database.host'),
                    port: configService.get('database.port'),
                    username: configService.get('database.username'),
                    password: configService.get('database.password'),
                    database: configService.get('database.database'),
                    entities: [
                        entities_1.Hall,
                        entities_1.Table,
                        entities_1.TableFeature,
                        entities_1.TableLock,
                        entities_1.Reservation,
                        entities_1.OperatingSchedule,
                        entities_1.Notification,
                        entities_1.UserPreference,
                    ],
                    synchronize: configService.get('database.synchronize'),
                    logging: configService.get('database.logging'),
                }),
            }),
            schedule_1.ScheduleModule.forRoot(),
            halls_module_1.HallsModule,
            tables_module_1.TablesModule,
            reservations_module_1.ReservationsModule,
            statistics_module_1.StatisticsModule,
            schedules_module_1.SchedulesModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map