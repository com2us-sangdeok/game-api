import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  Table,
  TableIndex,
} from 'typeorm';
import { MintType, MintLogStatus } from '../enum';

@Entity('MintLog')
export class MintLogEntity {
  @PrimaryColumn({ type: 'varchar' })
  requestId: string;

  @Column({ type: 'enum', enum: MintType, default: MintType.ITEM })
  mintType: MintType;

  @Column({ type: 'bigint' })
  playerId: number;

  @Column({ type: 'varchar' })
  server: string;

  @Column({ type: 'varchar' })
  accAddress: string;

  @Column({ type: 'varchar' })
  appId: string;

  @Column({ type: 'varchar' })
  goodsId: string;

  @Column({ type: 'bigint' })
  serviceFee: number;

  @Column({ type: 'bigint' })
  gameFee: number;

  @Column({ type: 'enum', enum: MintLogStatus, default: MintLogStatus.READY })
  status: MintLogStatus;

  @CreateDateColumn()
  createdAt: string;
}

export const DB_TABLE_MINT_LOG = new Table({
  name: 'afk_mint_log',
  columns: [
    {
      name: 'request_id',
      type: 'varchar',
      isPrimary: true,
      length: '100',
      // isGenerated: true, // Auto-increment
      // generationStrategy: 'increment',
    },
    {
      name: 'mint_type',
      type: 'enum',
      enum: [MintType.ITEM, MintType.ITEMS, MintType.CHARACTER],
      enumName: 'mint_typs_enum',
      default: `'${MintType.ITEM}'`,
    },
    {
      name: 'player_id',
      type: 'bigint',
      isNullable: false,
    },
    {
      name: 'server',
      type: 'varchar',
      isNullable: false,
    },
    {
      name: 'acc_address',
      type: 'varchar',
      length: '100',
      isNullable: false,
    },
    {
      name: 'app_id',
      type: 'varchar',
      length: '100',
      isNullable: false,
    },
    {
      name: 'goods_id',
      type: 'varchar',
      length: '100',
      isNullable: false,
    },
    {
      name: 'tx_fee',
      type: 'bigint',
      isNullable: false,
    },
    {
      name: 'service_fee',
      type: 'bigint',
      isNullable: false,
    },
    {
      name: 'created_at',
      type: 'timestamp',
      isNullable: false,
      default: 'now()',
    },
    {
      name: 'status',
      type: 'enum',
      enum: [MintType.ITEM, MintType.ITEMS, MintType.CHARACTER],
      enumName: 'mint_typs_enum',
      default: `'${MintType.ITEM}'`,
    },
    {
      name: 'updated_at',
      type: 'timestamp',
      isNullable: false,
      default: 'now()',
    },
  ],
});

export const DB_INDEX_MINT_LOG = [
  // new TableIndex({
  //   name: 'idx_ml_player_id',
  //   columnNames: ['player_id'],
  // }),
];
