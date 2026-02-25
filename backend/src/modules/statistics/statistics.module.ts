import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatisticsController } from './statistics.controller';
import { StatisticsService } from './statistics.service';
import { Hall, Table, TableLock, Reservation } from '../../database/entities';

@Module({
  imports: [TypeOrmModule.forFeature([Hall, Table, TableLock, Reservation])],
  controllers: [StatisticsController],
  providers: [StatisticsService],
  exports: [StatisticsService],
})
export class StatisticsModule {}

