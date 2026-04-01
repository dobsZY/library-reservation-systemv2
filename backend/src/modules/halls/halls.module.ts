import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HallsController } from './halls.controller';
import { HallsService } from './halls.service';
import { Hall, Table, TableLock, Reservation } from '../../database/entities';
import { SchedulesModule } from '../schedules/schedules.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Hall, Table, TableLock, Reservation]),
    SchedulesModule,
  ],
  controllers: [HallsController],
  providers: [HallsService],
  exports: [HallsService],
})
export class HallsModule {}

