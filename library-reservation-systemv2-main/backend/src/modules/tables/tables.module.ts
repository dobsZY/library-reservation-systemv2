import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TablesController } from './tables.controller';
import { TablesService } from './tables.service';
import { Table, TableFeature, Hall } from '../../database/entities';

@Module({
  imports: [TypeOrmModule.forFeature([Table, TableFeature, Hall])],
  controllers: [TablesController],
  providers: [TablesService],
  exports: [TablesService],
})
export class TablesModule {}

