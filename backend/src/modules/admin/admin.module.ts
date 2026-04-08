import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import {
  User,
  UserSession,
  Reservation,
  Hall,
  Table,
  TableFeature,
  TableLock,
} from '../../database/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      UserSession,
      Reservation,
      Hall,
      Table,
      TableFeature,
      TableLock,
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
