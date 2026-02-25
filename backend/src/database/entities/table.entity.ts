import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Hall } from './hall.entity';
import { TableFeature } from './table-feature.entity';
import { Reservation } from './reservation.entity';

export enum TableStatus {
  AVAILABLE = 'available',
  MAINTENANCE = 'maintenance',
  RESERVED = 'reserved',
}

@Entity('tables')
export class Table {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'hall_id' })
  hallId: string;

  @Column({ name: 'table_number', length: 20 })
  tableNumber: string; // "A-01", "B-12"

  // Kroki üzerindeki konum
  @Column({ name: 'position_x' })
  positionX: number;

  @Column({ name: 'position_y' })
  positionY: number;

  @Column({ default: 40 })
  width: number;

  @Column({ default: 40 })
  height: number;

  @Column({ default: 0 })
  rotation: number; // 0, 90, 180, 270

  // QR Kod
  @Column({ name: 'qr_code', length: 255, unique: true })
  qrCode: string;

  @Column({ name: 'qr_generated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  qrGeneratedAt: Date;

  // Durum
  @Column({
    type: 'enum',
    enum: TableStatus,
    default: TableStatus.AVAILABLE,
  })
  status: TableStatus;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // İlişkiler
  @ManyToOne(() => Hall, (hall) => hall.tables, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'hall_id' })
  hall: Hall;

  @ManyToMany(() => TableFeature, (feature) => feature.tables)
  @JoinTable({
    name: 'table_feature_mappings',
    joinColumn: { name: 'table_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'feature_id', referencedColumnName: 'id' },
  })
  features: TableFeature[];

  @OneToMany(() => Reservation, (reservation) => reservation.table)
  reservations: Reservation[];
}

