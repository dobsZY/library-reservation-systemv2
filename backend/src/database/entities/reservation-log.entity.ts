import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Reservation } from './reservation.entity';

export enum ReservationLogEvent {
  CREATED = 'created',
  CHECKED_IN = 'checked_in',
  EXTENDED = 'extended',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
  EXPIRED = 'expired',
  NO_SHOW = 'no_show',
  QR_WARNING = 'qr_warning',
  EXTEND_REMINDER = 'extend_reminder',
  // Backward compatibility for existing DB rows from older releases.
  VACATE_SEAT_REMINDER = 'vacate_seat_reminder',
  // Backward compatibility for legacy extension flow logs.
  EXTENSION_DECLINED = 'extension_declined',
  LEAVE_WARNING = 'leave_warning',
}

@Entity('reservation_logs')
export class ReservationLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'reservation_id' })
  reservationId: string;

  @Column({ name: 'user_id', length: 100 })
  userId: string;

  @Column({
    type: 'enum',
    enum: ReservationLogEvent,
  })
  event: ReservationLogEvent;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // İlişkiler
  @ManyToOne(() => Reservation, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reservation_id' })
  reservation: Reservation;
}
