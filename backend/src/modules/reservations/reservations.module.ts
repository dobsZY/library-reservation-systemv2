import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReservationsController } from './reservations.controller';
import { ReservationsService } from './reservations.service';
import { CheckInService } from './check-in.service';
import {
  Reservation,
  Table,
  TableLock,
  Hall,
  OperatingSchedule,
} from '../../database/entities';
import { HallsModule } from '../halls/halls.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Reservation,
      Table,
      TableLock,
      Hall,
      OperatingSchedule,
    ]),
    HallsModule,
  ],
  controllers: [ReservationsController],
  providers: [ReservationsService, CheckInService],
  exports: [ReservationsService],
})
export class ReservationsModule {}

