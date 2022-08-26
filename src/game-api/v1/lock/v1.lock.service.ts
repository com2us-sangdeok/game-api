import { Injectable } from '@nestjs/common';
import { BlockchainService } from '../../../bc-core/blockchain/blockchain.service';

@Injectable()
export class V1LockService {
  private bc = this.blockchainService.blockChainClient();
  private lcdClient = this.blockchainService.lcdClient();

  constructor(private readonly blockchainService: BlockchainService) {}
}
