import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Reservation } from './reservation.entity';

export enum NotificationType {
  QR_WARNING = 'qr_warning',           // 25 dk QR uyarısı
  QR_EXPIRED = 'qr_expired',           // 30 dk QR timeout
  EXTEND_REMINDER = 'extend_reminder', // Son 30 dk uzatma hatırlatma
  LEAVE_WARNING = 'leave_warning',     // Son 10 dk çıkış uyarısı
  RESERVATION_CONFIRMED = 'reservation_confirmed',
  RESERVATION_CANCELLED = 'reservation_cancelled',
  CHECK_IN_SUCCESS = 'check_in_success',
}

@Entity('notification_logs')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', length: 50 })
  userId: string;

  @Column({ name: 'reservation_id', type: 'uuid', nullable: true })
  reservationId: string;

  @Column({
    name: 'notification_type',
    type: 'enum',
    enum: NotificationType,
  })
  notificationType: NotificationType;

  @Column({ length: 200, nullable: true })
  title: string;

  @Column({ type: 'text', nullable: true })
  body: string;

  @CreateDateColumn({ name: 'sent_at' })
  sentAt: Date;

  @Column({ name: 'read_at', type: 'timestamp', nullable: true })
  readAt: Date;

  @Column({ name: 'clicked_at', type: 'timestamp', nullable: true })
  clickedAt: Date;

  @Column({ name: 'fcm_message_id', length: 255, nullable: true })
  fcmMessageId: string;

  @Column({ name: 'fcm_status', length: 50, nullable: true })
  fcmStatus: string;

  // İlişkiler
  @ManyToOne(() => Reservation)
  @JoinColumn({ name: 'reservation_id' })
  reservation: Reservation;
}

