import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  Table,
  TableIndex,
} from 'typeorm';
import { MintType, MintLogStatus } from '../enum';
import {Metadata} from "../metadata-api/v1/type/meta-info";
import {ExtensionDto} from "../metadata-api/v1/dto/metadata-v1.dto";

@Entity('tb_mint_log')
export class MintLogEntity {
  @PrimaryColumn({name: 'request_id', type: 'varchar' })
    requestId: string;

  @Column({ name: 'mint_type', type: 'enum', enum: MintType, default: MintType.ITEM })
  mintType: MintType;

  @Column({ name: 'player_id', type: 'bigint' })
  playerId: number;

  @Column({ name: 'server', type: 'varchar' })
  server: string;

  @Column({ name: 'acc_address', type: 'varchar' })
  accAddress: string;

  @Column({ name: 'app_id', type: 'varchar' })
  appId: string;

  @Column({ name: 'id', type: 'varchar' })
  id: string;

  @Column({ name: 'metadata', type: 'json' })
  metadata: ExtensionDto;

  @Column({ name: 'service_fee', type: 'varchar' })
  serviceFee: string;

  @Column({ name: 'game_fee', type: 'varchar' })
  gameFee: string;

  @Column({ name: 'status', type: 'enum', enum: MintLogStatus, default: MintLogStatus.READY })
  status: MintLogStatus;

  @CreateDateColumn({name: 'created_at'})
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
      enum: [MintLogStatus.READY, MintLogStatus.FAILURE, MintLogStatus.COMPLETE],
      enumName: 'mint_typs_enum',
      default: `'${MintLogStatus.READY}'`,
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
