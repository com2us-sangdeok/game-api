import {
  Column,
  CreateDateColumn,
  Entity, PrimaryColumn,
} from 'typeorm';

@Entity('tb_token_id')
export class TokenIdEntity {
  @PrimaryColumn({ type: 'varchar', length: 64 })
  nftAddress: string;

  @Column({ type: 'varchar', length: 64 })
  appId: string;

  @Column({ type: 'bigint' })
  sequenceNumber: number;

  @CreateDateColumn()
  createdAt: string;
}
