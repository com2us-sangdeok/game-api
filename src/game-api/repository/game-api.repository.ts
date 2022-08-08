import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryRunner, Repository } from 'typeorm';
import { NonFungibleTokenEntity } from './non-fungible-token.entity';
import {TransactionEntity} from "./transaction.entity";

@Injectable()
export class GameApiRepository {
  constructor(
    @InjectRepository(NonFungibleTokenEntity)
    private readonly nftRepo: Repository<NonFungibleTokenEntity>,
    @InjectRepository(TransactionEntity)
    private readonly txRepo: Repository<TransactionEntity>,
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
          appId: nftEntity.appId,
          accAddress: nftEntity.accAddress,
          playerId: nftEntity.playerId,
        },
      ])
      .execute();
    return token.raw.insertId;
  }

  public async registerTx(tx: TransactionEntity): Promise<void> {
    await this.txRepo.save(tx);
  }
}
