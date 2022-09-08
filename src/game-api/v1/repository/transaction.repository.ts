import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryRunner, Repository } from 'typeorm';
import { TransactionEntity } from '../../../entities';
import { TxStatus } from '../../../enum';

@Injectable()
export class TransactionRepository {
  constructor(
    @InjectRepository(TransactionEntity)
    private readonly txRepo: Repository<TransactionEntity>,
  ) {}

  public async saveTx(tx: TransactionEntity) {
    return await this.txRepo.save(tx);
  }

  public async insertTx(queryRunner: QueryRunner, tx: TransactionEntity) {
    return await queryRunner.manager
      .getRepository(TransactionEntity)
      .createQueryBuilder()
      .useTransaction(true)
      .setLock('pessimistic_read')
      .setLock('pessimistic_write')
      .insert()
      .into(TransactionEntity)
      .values(tx)
      .execute();
  }

  public async updTxStatus(
    queryRunner: QueryRunner,
    requestId: string,
    status: TxStatus,
    tx?: string,
    txHash?: string,
  ): Promise<any> {
    return await queryRunner.manager
      .getRepository(TransactionEntity)
      .createQueryBuilder()
      .useTransaction(true)
      .setLock('pessimistic_read')
      .setLock('pessimistic_write')
      .update(TransactionEntity)
      .set({ status: status, tx: tx, txHash: txHash })
      .where('requestId = :requestId', { requestId: requestId })
      .execute();
  }
}
