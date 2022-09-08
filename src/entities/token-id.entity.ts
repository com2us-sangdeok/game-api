import {
  Column,
  CreateDateColumn,
  Entity, PrimaryColumn,
} from 'typeorm';

@Entity('tb_token_id')
export class TokenIdEntity {
  @PrimaryColumn({ name: 'nft_address', type: 'varchar', length: 64 })
  nftAddress: string;

  @Column({ name: 'app_id', type: 'varchar', length: 64 })
  appId: string;

  @Column({ name: 'token_id', type: 'bigint' })
  tokenId: number;

  @CreateDateColumn()
  createdAt: string;
}
