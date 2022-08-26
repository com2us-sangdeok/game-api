import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {DataSource, QueryRunner, Repository, Table} from 'typeorm';
import {
  NonFungibleTokenEntity,
  TransactionEntity,
  MintLogEntity, DB_TABLE_MINT_LOG, DB_INDEX_MINT_LOG,
} from '../../../entities';
import {MintType} from "../../../enum";

@Injectable()
export class ConsoleRepository {
  private queryRunner: QueryRunner;
  constructor(
    @InjectRepository(NonFungibleTokenEntity)
    private readonly nftRepo: Repository<NonFungibleTokenEntity>,
    @InjectRepository(TransactionEntity)
    private readonly txRepo: Repository<TransactionEntity>,
    @InjectRepository(MintLogEntity)
    private readonly mintLogRepo: Repository<MintLogEntity>,
    private dataSource: DataSource,
  ) {
    this.queryRunner = this.dataSource.createQueryRunner();
  }

  async create() {
    // transaction
    // mint_log
    await this.queryRunner.createTable(DB_TABLE_MINT_LOG, true);
    await this.queryRunner.createIndices(DB_TABLE_MINT_LOG, DB_INDEX_MINT_LOG);
  }

  async drop() {
    await this.queryRunner.dropTable(DB_TABLE_MINT_LOG, true);
    await this.queryRunner.dropIndices(DB_TABLE_MINT_LOG, DB_INDEX_MINT_LOG);
  }
}
