import { Injectable, Inject } from '@nestjs/common';
import { BlockchainService } from '../../core/blockchain/blockchain.service';

@Injectable()
export class GameApiV2Service {
  private lcd = this.blockchainService.lcdClient();

  private bc = this.blockchainService.blockChainClient();

  constructor(private readonly blockchainService: BlockchainService) {}

  async createAccount(address: string): Promise<any> {
    return this.bc.client.account(address);
  }
}
