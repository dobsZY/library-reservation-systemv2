import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export enum ScheduleType {
  NORMAL = 'normal',
  EXAM_MIDTERM = 'exam_midterm',
  EXAM_FINAL = 'exam_final',
  HOLIDAY = 'holiday',
}

@Entity('operating_schedules')
export class OperatingSchedule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string; // "Normal Dönem", "Vize Haftası", "Final Haftası"

  @Column({
    name: 'schedule_type',
    type: 'enum',
    enum: ScheduleType,
    default: ScheduleType.NORMAL,
  })
  scheduleType: ScheduleType;

  @Column({ name: 'start_date', type: 'date' })
  startDate: Date;

  @Column({ name: 'end_date', type: 'date' })
  endDate: Date;

  @Column({ name: 'is_24h', default: false })
  is24h: boolean;

  @Column({ name: 'opening_time', type: 'time', default: '08:00' })
  openingTime: string;

  @Column({ name: 'closing_time', type: 'time', default: '23:00' })
  closingTime: string;

  // Özel kurallar
  @Column({ name: 'max_duration_hours', default: 3 })
  maxDurationHours: number;

  @Column({ name: 'chain_qr_timeout_minutes', default: 15 })
  chainQrTimeoutMinutes: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

