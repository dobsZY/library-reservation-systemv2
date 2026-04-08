import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('user_preferences')
export class UserPreference {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', length: 50, unique: true })
  userId: string;

  // Favori özellikler
  @Column({ name: 'preferred_features', type: 'uuid', array: true, nullable: true })
  preferredFeatures: string[];

  @Column({ name: 'preferred_halls', type: 'uuid', array: true, nullable: true })
  preferredHalls: string[];

  // Bildirim tercihleri
  @Column({ name: 'notify_qr_warning', default: true })
  notifyQrWarning: boolean;

  @Column({ name: 'notify_extend_reminder', default: true })
  notifyExtendReminder: boolean;

  @Column({ name: 'notify_leave_warning', default: true })
  notifyLeaveWarning: boolean;

  // FCM Token
  @Column({ name: 'fcm_token', length: 500, nullable: true })
  fcmToken: string;

  @Column({ name: 'fcm_token_updated_at', type: 'timestamp', nullable: true })
  fcmTokenUpdatedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

