import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('GameApiTransaction')
export class GameApiTransactionEntity {
  @PrimaryColumn({ type: 'varchar' })
  transactionId: string;

  @Column({ type: 'varchar' })
  signTransaction: string;

  @Column({ type: 'varchar', default: '' })
  transactionHash: string;

  @Column({ type: 'boolean', default: false })
  status: boolean;

  @Column({ type: 'varchar', default: '' })
  message: string;

  @Column({ type: 'numeric', default: 0.0 })
  executionTime: number;

  @CreateDateColumn()
  createdAt: string;

  @UpdateDateColumn()
  updatedAt: string;
}
