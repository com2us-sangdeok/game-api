import { Injectable } from '@nestjs/common';
import { txDecoding } from '../../../util/encoding';
import { TransactionRepository } from '../repository/transaction.repository';
import { DataSource } from 'typeorm';
import { BlockchainError, TxStatus } from '../../../enum';
import { CommonService } from '../../../bc-core/modules/common.service';
import { V1GameApiBroadcastOutputDto } from '../dto/game-api-v1-broadcast.dto';
import { BlockchainException } from '../../../exception/blockchain.exception';
import {
  GameApiException,
  GameApiHttpStatus,
} from '../../../exception/request.exception';

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

    let txHash;
    try {
      txHash = await this.commonService.broadcast(decodedTx);

      if (!txHash.code || txHash.code === BlockchainError.SUCCESS) {
        const result = await this.txRepo.updTxStatus(
          queryRunner,
          requestId,
          TxStatus.PENDING,
          signedTx,
          txHash.txhash,
        );
        await queryRunner.commitTransaction();
      } else {
        throw txHash.txhash;
      }
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new GameApiException(
        'broadcast error' + err,
        '',
        GameApiHttpStatus.INTERNAL_SERVER_ERROR,
      );
    } finally {
      await queryRunner.release();
    }
    return {
      txHash: txHash.txhash,
    };
  }

  async txCheck(txHash: string): Promise<any> {
    return await this.commonService.txDetail(txHash);
  }
}
