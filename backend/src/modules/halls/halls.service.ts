import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Hall, Table, TableLock, LockStatus } from '../../database/entities';
import { CreateHallDto, UpdateHallDto } from './dto';

@Injectable()
export class HallsService {
  constructor(
    @InjectRepository(Hall)
    private readonly hallRepository: Repository<Hall>,
    @InjectRepository(Table)
    private readonly tableRepository: Repository<Table>,
    @InjectRepository(TableLock)
    private readonly tableLockRepository: Repository<TableLock>,
  ) {}

  async findAll(): Promise<Hall[]> {
    return this.hallRepository.find({
      where: { isActive: true },
      order: { displayOrder: 'ASC', name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Hall> {
    const hall = await this.hallRepository.findOne({
      where: { id, isActive: true },
    });

    if (!hall) {
      throw new NotFoundException(`Salon bulunamadı: ${id}`);
    }

    return hall;
  }

  async findWithTables(id: string): Promise<Hall> {
    const hall = await this.hallRepository.findOne({
      where: { id, isActive: true },
      relations: ['tables', 'tables.features'],
    });

    if (!hall) {
      throw new NotFoundException(`Salon bulunamadı: ${id}`);
    }

    // Sadece aktif masaları filtrele
    hall.tables = hall.tables.filter((table) => table.isActive);

    return hall;
  }

  async getHallAvailability(
    hallId: string,
    date: Date,
    startTime?: Date,
    endTime?: Date,
  ): Promise<{
    hall: Hall;
    tables: Array<{
      table: Table;
      isAvailable: boolean;
      currentLock?: TableLock;
      availableFrom?: Date;
    }>;
    statistics: {
      total: number;
      available: number;
      occupied: number;
      occupancyRate: number;
    };
  }> {
    const hall = await this.findWithTables(hallId);
    const now = new Date();

    // Aktif kilitleri al
    const activeLocks = await this.tableLockRepository.find({
      where: {
        table: { hallId },
        lockDate: date,
        status: LockStatus.ACTIVE,
      },
      relations: ['table'],
    });

    const lockMap = new Map<string, TableLock>();
    activeLocks.forEach((lock) => {
      // Şu anki zamanda aktif olan kilitleri kontrol et
      if (lock.lockStart <= now && lock.lockEnd > now) {
        lockMap.set(lock.tableId, lock);
      }
    });

    const tablesWithAvailability = hall.tables.map((table) => {
      const currentLock = lockMap.get(table.id);
      const isAvailable = !currentLock;

      return {
        table,
        isAvailable,
        currentLock,
        availableFrom: currentLock?.lockEnd,
      };
    });

    const available = tablesWithAvailability.filter((t) => t.isAvailable).length;
    const total = hall.tables.length;

    return {
      hall,
      tables: tablesWithAvailability,
      statistics: {
        total,
        available,
        occupied: total - available,
        occupancyRate: total > 0 ? ((total - available) / total) * 100 : 0,
      },
    };
  }

  async create(createHallDto: CreateHallDto): Promise<Hall> {
    const hall = this.hallRepository.create(createHallDto);
    return this.hallRepository.save(hall);
  }

  async update(id: string, updateHallDto: UpdateHallDto): Promise<Hall> {
    const hall = await this.findOne(id);
    Object.assign(hall, updateHallDto);
    return this.hallRepository.save(hall);
  }

  async remove(id: string): Promise<void> {
    const hall = await this.findOne(id);
    hall.isActive = false;
    await this.hallRepository.save(hall);
  }
}

