import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';

// Config
import { appConfig, databaseConfig, redisConfig } from './config';

// Entities
import {
  Hall,
  Table,
  TableFeature,
  TableLock,
  Reservation,
  ReservationLog,
  OperatingSchedule,
  Notification,
  UserPreference,
  User,
  UserSession,
} from './database/entities';

// Modules
import { HallsModule } from './modules/halls/halls.module';
import { TablesModule } from './modules/tables/tables.module';
import { ReservationsModule } from './modules/reservations/reservations.module';
import { StatisticsModule } from './modules/statistics/statistics.module';
import { SchedulesModule } from './modules/schedules/schedules.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { AdminModule } from './modules/admin/admin.module';
import { DeskModule } from './modules/desk/desk.module';

@Module({
  imports: [
    // Konfigürasyon
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, redisConfig],
      envFilePath: ['.env', '.env.development', '.env.local'],
    }),

    // Veritabanı
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.database'),
        entities: [
          Hall,
          Table,
          TableFeature,
          TableLock,
          Reservation,
          ReservationLog,
          OperatingSchedule,
          Notification,
          UserPreference,
          User,
          UserSession,
        ],
        synchronize: configService.get('database.synchronize'),
        logging: configService.get('database.logging'),
      }),
    }),

    // Zamanlayıcı (Cron jobs)
    ScheduleModule.forRoot(),

    // Uygulama Modülleri
    AuthModule,
    UsersModule,
    HallsModule,
    TablesModule,
    ReservationsModule,
    StatisticsModule,
    SchedulesModule,
    AdminModule,
    DeskModule,
  ],
})
export class AppModule {}
