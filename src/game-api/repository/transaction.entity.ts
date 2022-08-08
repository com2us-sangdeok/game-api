import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('Transaction')
export class TransactionEntity {
  @PrimaryColumn({ type: 'varchar' })
  requestId: string;

  @Column({ type: 'varchar'})
  txHash: string;

  @Column({ type: 'json' })
  tx: object;

  @Column({ type: 'boolean', default: false })
  status: boolean;

  @Column({ type: 'varchar'})
  appId: string;

  @Column({ type: 'bigint'})
  playerId: number;

  @Column({ type: 'varchar'})
  accAddress: string;

  @CreateDateColumn()
  createdAt: string;

  @UpdateDateColumn()
  updatedAt: string;
}
