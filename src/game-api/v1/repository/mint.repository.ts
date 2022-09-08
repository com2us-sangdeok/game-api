import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import {
  TokenIdEntity,
  MintLogEntity,
} from '../../../entities';
import {
  GameApiException,
  GameApiHttpStatus,
} from '../../../exception/request.exception';

@Injectable()
export class MintRepository {
  constructor(
    @InjectRepository(TokenIdEntity)
    private readonly nftRepo: Repository<TokenIdEntity>,
    @InjectRepository(MintLogEntity)
    private readonly mintLogRepo: Repository<MintLogEntity>,
    private dataSource: DataSource,
  ) {}

  public async getNftId(entity: TokenIdEntity): Promise<number> {
    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
    await queryRunner.startTransaction('SERIALIZABLE');
    let nextSequenceNumber = 0;
    try {
      let sequenceProviderEntity = await queryRunner.manager
        .getRepository(TokenIdEntity)
        .createQueryBuilder('tokenIdEntity')
        .useTransaction(true)
        .setLock('pessimistic_read')
        .setLock('pessimistic_write')
        .where('nft_address = :nftAddress', { nftAddress: entity.nftAddress })
        .getOne();

      if (
        sequenceProviderEntity === undefined ||
        sequenceProviderEntity === null
      ) {
        await queryRunner.manager
          .getRepository(TokenIdEntity)
          .createQueryBuilder('tokenIdEntity')
          .useTransaction(true)
          .setLock('pessimistic_read')
          .setLock('pessimistic_write')
          .insert()
          .into(TokenIdEntity)
          .values([
            {
              nftAddress: entity.nftAddress,
              appId: entity.appId,
              tokenId: 1,
            },
          ])
          .execute();
        nextSequenceNumber = 1;
      } else {
        await queryRunner.manager
          .getRepository(TokenIdEntity)
          .createQueryBuilder('tokenIdEntity')
          .useTransaction(true)
          .setLock('pessimistic_read')
          .setLock('pessimistic_write')
          .update(TokenIdEntity)
          .set({ tokenId: () => '`token_id`+1' })
          .where('nft_address = :nftAddress', { nftAddress: entity.nftAddress })
          .execute();
        const currentSequence = sequenceProviderEntity.tokenId ?? 0;
        nextSequenceNumber = Number(currentSequence) + 1;
      }
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

  public async registerMintLog(mintLogEntity: MintLogEntity): Promise<void> {
    await this.mintLogRepo.save(mintLogEntity);
  }

  public async getMintLogByRequestId(
    requestId: string,
  ): Promise<MintLogEntity> {
    // return await this.mintLogRepo.findOneBy({requestId: requestId})
    return await this.mintLogRepo
      .createQueryBuilder('mintLogEntity')
      .where('mintLogEntity.request_id = :requestId', { requestId: requestId })
      // .andWhere(
      //   'mintLogEntity.createdAt >= date_add(now(), interval -5 minute )',
      // )
      .getOne();
  }

}
