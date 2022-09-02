import { Injectable } from '@nestjs/common';
import { DataSource, QueryRunner } from 'typeorm';
import {
  GameApiException,
  GameApiHttpStatus,
} from '../exception/request.exception';
import { BlockchainService } from '../bc-core/blockchain/blockchain.service';
import { SequenceRepository } from './repository/sequence.repository';

@Injectable()
export class SequenceUtil {
  constructor(
    private readonly blockchainService: BlockchainService,
    private dataSource: DataSource,
    private sequenceRepository: SequenceRepository,
  ) {}

  //todo 대납 상황에 맞춰서 다시 개발 필요
  public async getSequenceNumber(accAddress: string): Promise<any> {
    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
    await queryRunner.startTransaction('SERIALIZABLE');
    let nextSequenceNumber = 0;
    try {
      const sequenceFromBlockchain: number = (
        await this.blockchainService
          .blockChainClient()
          .client.account(accAddress)
      ).sequence;

      let sequenceFromDB: number = (
        await this.sequenceRepository.getSequenceNumber(queryRunner, accAddress)
      ).sequenceNumber;

      if (sequenceFromDB === -1) {
        // init sequence number
        await this.sequenceRepository.registerSequence(
          queryRunner,
          accAddress,
          sequenceFromBlockchain,
        );
        sequenceFromDB = sequenceFromBlockchain;
      } else if (sequenceFromDB < sequenceFromBlockchain) {
        // sync sequence number between DB and blockchain network
        await this.sequenceRepository.updateSequenceFromBlockchain(
          queryRunner,
          accAddress,
          sequenceFromBlockchain,
        );
        sequenceFromDB = sequenceFromBlockchain;
      }

      await this.sequenceRepository.updateSequenceFromDb(
        queryRunner,
        accAddress,
      );
      nextSequenceNumber = Number(sequenceFromDB);
      await queryRunner.commitTransaction();
      return nextSequenceNumber;
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw new GameApiException(
        e.message,
        e.stack,
        GameApiHttpStatus.INTERNAL_SERVER_ERROR,
      );
    } finally {
      await queryRunner.release();
    }
  }
}