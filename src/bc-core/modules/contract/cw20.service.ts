import { Injectable } from '@nestjs/common';
import { BlockchainService } from '../../blockchain/blockchain.service';
import { MsgExecuteContract } from '@xpla/xpla.js';
import { TokenBalance } from '../modules.inerface';
import {
  BlockchainException,
  BlockchainStatus,
} from '../../../exception/blockchain.exception';

@Injectable()
export class CW20Service {
  private bc = this.blockchainService.blockChainClient();

  constructor(private readonly blockchainService: BlockchainService) {}

  //token balance 조회
  public async tokenBalance(
    tokenContract: string,
    address: string,
  ): Promise<TokenBalance> {
    try {
      const contractInfo = await this.bc.client.contractQuery(tokenContract, {
        token_info: {},
      });
      const balance = await this.bc.client.contractQuery(tokenContract, {
        balance: { address: address },
      });
      return {
        balance: balance,
        decimals: contractInfo.decimals,
        tokenName: contractInfo.name,
        tokenSymbol: contractInfo.symbol,
      };
    } catch (err) {
      throw new BlockchainException(
        err.message,
        err.response?.data,
        BlockchainStatus.GET_TOKEN_BALANCE_ERROR,
      );
    }
  }

  //token 전송
  public async transferToken(
    tokenContract: string,
    sender: string,
    receiver: string,
    amount: string,
  ): Promise<MsgExecuteContract> {
    try {
      const executeMsg = {
        transfer: {
          recipient: receiver,
          amount: amount,
        },
      };

      return new MsgExecuteContract(
        sender,
        tokenContract,
        { ...executeMsg },
        {},
      );
    } catch (err) {
      throw new BlockchainException(
        err.message,
        err.response?.data,
        BlockchainStatus.TRANSFER_TOKEN_ERROR,
      );
    }
  }
}
