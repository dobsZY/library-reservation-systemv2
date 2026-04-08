import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { OperatingSchedule, ScheduleType } from '../../database/entities';
import { CreateScheduleDto, UpdateScheduleDto } from './dto';

@Injectable()
export class SchedulesService {
  constructor(
    @InjectRepository(OperatingSchedule)
    private readonly scheduleRepository: Repository<OperatingSchedule>,
  ) {}

  async findAll(): Promise<OperatingSchedule[]> {
    return this.scheduleRepository.find({
      order: { startDate: 'DESC' },
    });
  }

  async findActive(): Promise<OperatingSchedule[]> {
    return this.scheduleRepository.find({
      where: { isActive: true },
      order: { startDate: 'DESC' },
    });
  }

  async findCurrent(): Promise<OperatingSchedule | null> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.scheduleRepository.findOne({
      where: {
        isActive: true,
        startDate: LessThanOrEqual(today),
        endDate: MoreThanOrEqual(today),
      },
    });
  }

  async findOne(id: string): Promise<OperatingSchedule> {
    const schedule = await this.scheduleRepository.findOne({
      where: { id },
    });

    if (!schedule) {
      throw new NotFoundException('Takvim bulunamadı');
    }

    return schedule;
  }

  async create(createDto: CreateScheduleDto): Promise<OperatingSchedule> {
    const schedule = this.scheduleRepository.create(createDto);
    return this.scheduleRepository.save(schedule);
  }

  async update(id: string, updateDto: UpdateScheduleDto): Promise<OperatingSchedule> {
    const schedule = await this.findOne(id);
    Object.assign(schedule, updateDto);
    return this.scheduleRepository.save(schedule);
  }

  async remove(id: string): Promise<void> {
    const schedule = await this.findOne(id);
    schedule.isActive = false;
    await this.scheduleRepository.save(schedule);
  }

  async getOperatingHoursForDate(date: Date): Promise<{
    is24h: boolean;
    openingTime: string;
    closingTime: string;
    scheduleType: ScheduleType;
    scheduleName: string;
  }> {
    const schedule = await this.scheduleRepository.findOne({
      where: {
        isActive: true,
        startDate: LessThanOrEqual(date),
        endDate: MoreThanOrEqual(date),
      },
    });

    if (schedule) {
      return {
        is24h: schedule.is24h,
        openingTime: schedule.openingTime,
        closingTime: schedule.closingTime,
        scheduleType: schedule.scheduleType,
        scheduleName: schedule.name,
      };
    }

    // Varsayılan değerler
    return {
      is24h: false,
      openingTime: '08:00',
      closingTime: '23:00',
      scheduleType: ScheduleType.NORMAL,
      scheduleName: 'Normal Dönem',
    };
  }
}

