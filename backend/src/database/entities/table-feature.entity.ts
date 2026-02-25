import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToMany,
} from 'typeorm';
import { Table } from './table.entity';

@Entity('table_features')
export class TableFeature {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50, unique: true })
  code: string; // "power_outlet", "window_view", "quiet_zone"

  @Column({ length: 100 })
  name: string; // "Priz", "Cam Kenarı", "Sessiz Bölge"

  @Column({ length: 50 })
  icon: string; // "🔌", "🪟", "🤫" veya icon class adı

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'display_order', default: 0 })
  displayOrder: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // İlişkiler
  @ManyToMany(() => Table, (table) => table.features)
  tables: Table[];
}

