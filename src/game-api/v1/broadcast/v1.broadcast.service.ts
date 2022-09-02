import { Injectable } from '@nestjs/common';
import { txDecoding } from '../../../util/encoding';
import { TransactionRepository } from '../repository/transaction.repository';
import { DataSource } from 'typeorm';
import { TxStatus } from '../../../enum';
import { CommonService } from '../../../bc-core/modules/common.service';
import { V1GameApiBroadcastOutputDto } from '../dto/game-api-v1-broadcast.dto';

@Injectable()
export class V1BroadcastService {
  constructor(
    private commonService: CommonService,
    private txRepo: TransactionRepository,
    private readonly dataSource: DataSource,
  ) {}

  async broadcast(requestId, signedTx): Promise<V1GameApiBroadcastOutputDto> {
    const decodedTx = txDecoding(signedTx);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('SERIALIZABLE');

    try {
      const result = await this.txRepo.updTxStatus(
        queryRunner,
        requestId,
        TxStatus.PENDING,
      );

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
    const txHash = await this.commonService.broadcast(decodedTx);
    return {
      txHash: txHash.txhash,
    };
  }
}
