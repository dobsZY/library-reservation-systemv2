import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Table, Reservation } from '../../database/entities';
import { DeskController } from './desk.controller';
import { DeskService } from './desk.service';
import { RolesGuard } from '../auth/guards/roles.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Table, Reservation])],
  controllers: [DeskController],
  providers: [DeskService, RolesGuard],
})
export class DeskModule {}
