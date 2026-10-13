import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

export const VACATION_STATUSES = ['PENDING', 'APPROVED', 'REJECTED'] as const;
export type VacationStatus = (typeof VACATION_STATUSES)[number];

@Entity('vacation_requests')
export class VacationRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  /** `YYYY-MM-DD`; the pg DATE parser is overridden so no timezone conversion happens. */
  @Column({ name: 'start_date', type: 'date' })
  startDate: string;

  @Column({ name: 'end_date', type: 'date' })
  endDate: string;

  @Column({ type: 'text', nullable: true })
  reason: string | null;

  @Column({ type: 'enum', enum: VACATION_STATUSES, enumName: 'vacation_status', default: 'PENDING' })
  status: VacationStatus;

  /** Validator decision comment; required by a CHECK constraint when status is REJECTED. */
  @Column({ type: 'text', nullable: true })
  comments: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
