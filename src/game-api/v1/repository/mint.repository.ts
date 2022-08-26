import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  NonFungibleTokenEntity,
  TransactionEntity,
  MintLogEntity,
} from '../../../entities';

@Injectable()
export class MintRepository {
  constructor(
    @InjectRepository(NonFungibleTokenEntity)
    private readonly nftRepo: Repository<NonFungibleTokenEntity>,
    @InjectRepository(TransactionEntity)
    private readonly txRepo: Repository<TransactionEntity>,
    @InjectRepository(MintLogEntity)
    private readonly mintLogRepo: Repository<MintLogEntity>,
  ) {}

  public async getNftId(nftEntity: NonFungibleTokenEntity): Promise<number> {
    // const existedToken = this.nftRepo.findOneBy({appName: nftEntity.appName})
    // if (existedToken === undefined || existedToken === null) {
    // }
    const token = await this.nftRepo
      .createQueryBuilder()
      .insert()
      .into(NonFungibleTokenEntity)
      .values([
        {
          gameIndex: nftEntity.gameIndex,
          accAddress: nftEntity.accAddress,
          playerId: nftEntity.playerId,
        },
      ])
      .execute();
    return token.raw.insertId;
  }

  public async getTxByRequestId(requestId: string): Promise<TransactionEntity> {
    return await this.txRepo.findOneBy({ requestId: requestId });
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
      .where('mintLogEntity.requestId = :requestId', { requestId: requestId })
      .andWhere(
        'mintLogEntity.createdAt >= date_add(now(), interval -5 minute )',
      )
      .getOne();
  }
}
