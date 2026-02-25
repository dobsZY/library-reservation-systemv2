import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Table } from './table.entity';
import { Hall } from './hall.entity';

export enum ReservationStatus {
  PENDING = 'pending',       // QR bekleniyor
  ACTIVE = 'active',         // Check-in yapıldı, kullanımda
  COMPLETED = 'completed',   // Normal bitiş
  EXTENDED = 'extended',     // Zincir ile devam edildi
  CANCELLED = 'cancelled',   // Kullanıcı iptali
  EXPIRED = 'expired',       // QR timeout (30 dk)
  NO_SHOW = 'no_show',       // Gelindi ama QR okutulmadı
}

@Entity('reservations')
export class Reservation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', length: 50 })
  userId: string; // Öğrenci numarası

  @Column({ name: 'table_id' })
  tableId: string;

  @Column({ name: 'hall_id' })
  hallId: string;

  // Zaman bilgileri
  @Column({ name: 'reservation_date', type: 'date' })
  reservationDate: Date;

  @Column({ name: 'start_time', type: 'timestamp' })
  startTime: Date;

  @Column({ name: 'end_time', type: 'timestamp' })
  endTime: Date;

  @Column({ name: 'lock_end_time', type: 'timestamp' })
  lockEndTime: Date; // start + 3 saat

  @Column({ name: 'duration_hours' })
  durationHours: number; // 1, 2 veya 3

  // Zincir rezervasyon
  @Column({ name: 'is_chain', default: false })
  isChain: boolean;

  @Column({ name: 'chain_id', type: 'uuid', nullable: true })
  chainId: string;

  @Column({ name: 'chain_sequence', default: 1 })
  chainSequence: number;

  @Column({ name: 'previous_reservation_id', type: 'uuid', nullable: true })
  previousReservationId: string;

  // Durum
  @Column({
    type: 'enum',
    enum: ReservationStatus,
    default: ReservationStatus.PENDING,
  })
  status: ReservationStatus;

  // Check-in bilgileri
  @Column({ name: 'checked_in_at', type: 'timestamp', nullable: true })
  checkedInAt: Date;

  @Column({ name: 'check_in_latitude', type: 'decimal', precision: 10, scale: 8, nullable: true })
  checkInLatitude: number;

  @Column({ name: 'check_in_longitude', type: 'decimal', precision: 11, scale: 8, nullable: true })
  checkInLongitude: number;

  @Column({ name: 'check_in_distance_meters', type: 'decimal', precision: 8, scale: 2, nullable: true })
  checkInDistanceMeters: number;

  @Column({ name: 'qr_deadline', type: 'timestamp', nullable: true })
  qrDeadline: Date;

  // Bildirim durumları
  @Column({ name: 'notif_qr_warning_sent', default: false })
  notifQrWarningSent: boolean;

  @Column({ name: 'notif_qr_expired_sent', default: false })
  notifQrExpiredSent: boolean;

  @Column({ name: 'notif_extend_reminder_sent', default: false })
  notifExtendReminderSent: boolean;

  @Column({ name: 'notif_leave_warning_sent', default: false })
  notifLeaveWarningSent: boolean;

  // Audit
  @Column({ name: 'cancelled_at', type: 'timestamp', nullable: true })
  cancelledAt: Date;

  @Column({ name: 'cancelled_reason', length: 255, nullable: true })
  cancelledReason: string;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // İlişkiler
  @ManyToOne(() => Table, (table) => table.reservations)
  @JoinColumn({ name: 'table_id' })
  table: Table;

  @ManyToOne(() => Hall)
  @JoinColumn({ name: 'hall_id' })
  hall: Hall;

  @ManyToOne(() => Reservation)
  @JoinColumn({ name: 'previous_reservation_id' })
  previousReservation: Reservation;

  @OneToMany(() => Reservation, (reservation) => reservation.previousReservation)
  chainedReservations: Reservation[];
}

