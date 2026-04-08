import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Table } from './table.entity';

@Entity('halls')
export class Hall {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column()
  floor: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  // Kroki bilgileri
  @Column({ name: 'layout_width' })
  layoutWidth: number;

  @Column({ name: 'layout_height' })
  layoutHeight: number;

  @Column({ name: 'layout_background_url', length: 500, nullable: true })
  layoutBackgroundUrl: string;

  @Column({ name: 'layout_config', type: 'jsonb', nullable: true })
  layoutConfig: {
    walls?: Array<{ x1: number; y1: number; x2: number; y2: number }>;
    doors?: Array<{ x: number; y: number; width: number; label?: string }>;
    windows?: Array<{ x: number; y: number; width: number; height: number; side: string }>;
    zones?: Array<{ id: string; name: string; polygon: number[][] }>;
  };

  // Konum (QR doğrulama için)
  @Column({ name: 'center_latitude', type: 'decimal', precision: 10, scale: 8, nullable: true })
  centerLatitude: number;

  @Column({ name: 'center_longitude', type: 'decimal', precision: 11, scale: 8, nullable: true })
  centerLongitude: number;

  @Column({ name: 'allowed_radius_meters', default: 50 })
  allowedRadiusMeters: number;

  @Column()
  capacity: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'display_order', default: 0 })
  displayOrder: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // İlişkiler
  @OneToMany(() => Table, (table) => table.hall)
  tables: Table[];
}

