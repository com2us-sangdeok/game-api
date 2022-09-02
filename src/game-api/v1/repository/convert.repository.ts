import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionEntity } from '../../../entities';

@Injectable()
export class ConvertRepository {
  constructor(
    @InjectRepository(TransactionEntity)
    private readonly txRepo: Repository<TransactionEntity>,
  ) {}

  public async saveTx(tx: TransactionEntity) {
    try {
      return await this.txRepo.save(tx);
    } catch (err) {
      console.log('&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&');
      console.log(err);
      console.log('&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&');
    }
  }
}
