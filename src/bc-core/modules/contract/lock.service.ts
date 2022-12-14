import { Injectable } from '@nestjs/common';
import { BlockchainService } from '../../blockchain/blockchain.service';
import { MnemonicKey, MsgExecuteContract } from '@xpla/xpla.js';
import { Tx } from '@xpla/xpla.js/dist/core';
import { CommonService } from '../common.service';
import { CW721Service } from './cw721.service';
import { type } from 'os';
import {
  BlockchainException,
  BlockchainStatus,
} from '../../../exception/blockchain.exception';
import { GameApiHttpStatus } from '../../../exception/request.exception';

// nft lock, unlock tx 생성
//TODO LOCK CONTRACT 필요
@Injectable()
export class LockService {
  private bc = this.blockchainService.blockChainClient();
  private lcd = this.blockchainService.lcdClient();
  //TODO hsm 접근 필요
  private lockOwner = {
    address: 'terra1x46rqay4d3cssq8gxxvqz8xt6nwlz4td20k38v',
    mnemonic:
      'notice oak worry limit wrap speak medal online prefer cluster roof addict wrist behave treat actual wasp year salad speed social layer crew genius',
  };

  constructor(
    private readonly blockchainService: BlockchainService,
    private readonly commonService: CommonService,
    private readonly cw721Service: CW721Service,
  ) {}

  //이미 lock 상태일때 (Error: cannot append signature)
  public async lock(
    senderAddress: string,
    lockContract: string,
    nftContract: string,
    tokenId: string,
  ): Promise<MsgExecuteContract> {
    //TODO type 정의 필요

    try {
      const nftInfo = await this.bc.client.contractQuery(nftContract, {
        nft_info: { token_id: tokenId },
      });

      let lockInfo = '';

      if (
        typeof nftInfo.token_uri !== undefined ||
        typeof nftInfo.token_uri !== null
      ) {
        lockInfo = nftInfo.token_uri;
      }

      const uriData = `{"lock":{"lock_info":"${lockInfo}"}}`;
      const tokenUri64 = Buffer.from(uriData, 'utf8').toString('base64');

      return await this.cw721Service.sendToken(
        nftContract,
        lockContract,
        senderAddress,
        tokenId,
        //lock msg
        tokenUri64,
      );
    } catch (err) {
      throw new BlockchainException(
        {
          message: err.response.data.message,
        },
        err.response?.data,
        BlockchainStatus.NFT_LOCK_ERROR,
      );
    }
  }

  public async unLock(
    lockContract: string,
    nftContract: string,
    tokenId: string,
    address: string,
  ): Promise<MsgExecuteContract> {
    try {
      const executeMsg = {
        unlock: {
          nft_address: nftContract,
          token_id: tokenId,
        },
      };

      return new MsgExecuteContract(address, lockContract, {
        ...executeMsg,
      });
    } catch (err) {
      throw new BlockchainException(
        {
          message: err.response.data.message,
        },
        err.response?.data,
        BlockchainStatus.NFT_UNLOCK_ERROR,
      );
    }
  }

  //ownerAddress => lock contract owner
  public async unLockSign(tx: Tx, ownerAddress: string): Promise<Tx> {
    try {
      //TODO ownerAddress로 hsm 접근 필요
      const ownerWallet = this.bc.client.wallet(this.lockOwner.mnemonic);

      return await this.commonService.sign(ownerWallet, tx);
    } catch (err) {
      throw new BlockchainException(
        {
          message: err.response.data.message,
        },
        err.response?.data,
        BlockchainStatus.NFT_INLOCK_SIGN_ERROR,
      );
    }
  }

  public async lockNftList(
    nftContract: string,
    ownerAddress: string,
  ): Promise<any> {
    try {
      return await this.lcd.wasm.contractQuery(nftContract, {
        tokens: { owner: ownerAddress },
      });
    } catch (err) {
      throw new BlockchainException(
        {
          message: err.response.data.message,
        },
        err.response?.data,
        BlockchainStatus.NFT_LOCK_LIST_ERROR,
      );
    }
  }
}
