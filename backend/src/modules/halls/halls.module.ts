import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HallsController } from './halls.controller';
import { HallsService } from './halls.service';
import { Hall, Table, TableLock } from '../../database/entities';

@Module({
  imports: [TypeOrmModule.forFeature([Hall, Table, TableLock])],
  controllers: [HallsController],
  providers: [HallsService],
  exports: [HallsService],
})
export class HallsModule {}

