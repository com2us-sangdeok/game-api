import { Inject, Injectable } from '@nestjs/common';
import { LCDClient } from '@xpla/xpla.js';
import { BlockchainClient } from '@blockchain/chain-bridge';

@Injectable()
export class BlockchainService {
  constructor(
    @Inject('BLOCKCHAIN_CLIENT')
    private bc: BlockchainClient,
  ) {}

  public lcdClient(): any {
    return this.bc.client.getLcdClient();
  }

  public blockChainClient(): BlockchainClient {
    return this.bc;
  }
}
