import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Table } from './table.entity';
import { Reservation } from './reservation.entity';

export enum LockStatus {
  ACTIVE = 'active',       // Kilit aktif
  RELEASED = 'released',   // Kilit açıldı
  CANCELLED = 'cancelled', // Rezervasyon iptal edildi
}

@Entity('table_locks')
export class TableLock {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'table_id' })
  tableId: string;

  @Column({ name: 'reservation_id' })
  reservationId: string;

  @Column({ name: 'lock_date', type: 'date' })
  lockDate: Date;

  @Column({ name: 'lock_start', type: 'timestamp' })
  lockStart: Date;

  @Column({ name: 'lock_end', type: 'timestamp' })
  lockEnd: Date; // Her zaman start + 3 saat

  @Column({
    type: 'enum',
    enum: LockStatus,
    default: LockStatus.ACTIVE,
  })
  status: LockStatus;

  @Column({ name: 'release_scheduled_at', type: 'timestamp', nullable: true })
  releaseScheduledAt: Date; // 5 dk sonra açılacak

  @Column({ name: 'released_at', type: 'timestamp', nullable: true })
  releasedAt: Date; // Gerçek açılma zamanı

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // İlişkiler
  @ManyToOne(() => Table, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'table_id' })
  table: Table;

  @ManyToOne(() => Reservation, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reservation_id' })
  reservation: Reservation;
}

