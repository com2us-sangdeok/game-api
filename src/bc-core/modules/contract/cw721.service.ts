import { Injectable } from '@nestjs/common';
import { BlockchainService } from '../../blockchain/blockchain.service';
import { Wallet, Tx, MsgExecuteContract } from '@xpla/xpla.js';
import { NftDetail } from '../modules.inerface';
import {
  BlockchainException,
  BlockchainStatus,
} from '../../../exception/blockchain.exception';
import { GameApiHttpStatus } from '../../../exception/request.exception';

@Injectable()
export class CW721Service {
  private bc = this.blockchainService.blockChainClient();

  constructor(private readonly blockchainService: BlockchainService) {}

  public async mint(
    nftContractOwner: string,
    nftContract: string,
    receiver: string,
    tokenId: string,
    tokenUri: string,
    extension: object,
  ): Promise<MsgExecuteContract> {
    //TODO extension 필수값 체크

    try {
      const executeMsg = {
        mint: {
          senderAddress: nftContractOwner,
          token_id: tokenId,
          owner: receiver,
          token_uri: tokenUri,
          extension: extension,
        },
      };

      return new MsgExecuteContract(
        nftContractOwner,
        nftContract,
        { ...executeMsg },
        {},
      );
    } catch (err) {
      throw new BlockchainException(
        {
          message: err.response.data.message,
        },
        err.response?.data,
        BlockchainStatus.NFT_MINT_ERROR,
      );
    }
  }

  // TODO 추가 예정
  public async burn(
    nftOwner: string,
    nftContract: string,
    tokenId: string,
  ): Promise<any> {
    try {
      return new MsgExecuteContract(nftOwner, nftContract, {
        burn: {
          token_id: tokenId,
        },
      });
    } catch (err) {
      throw new BlockchainException(
        {
          message: err.response.data.message,
        },
        err.response?.data,
        BlockchainStatus.NFT_BURN_ERROR,
      );
    }
  }

  //nft List 조회
  public async nftList(
    nftContract: string,
    address: string,
  ): Promise<{ tokens: string[] }> {
    try {
      return await this.bc.client.contractQuery(nftContract, {
        tokens: { owner: address },
      });
    } catch (err) {
      throw new BlockchainException(
        {
          message: err.response.data.message,
        },
        err.response?.data,
        BlockchainStatus.GET_NFT_LIST_ERROR,
      );
    }
  }

  //nft Detail 조회
  public async nftDetail(
    nftContract: string,
    tokenId: string,
  ): Promise<Partial<NftDetail>> {
    try {
      return await this.bc.client.contractQuery(nftContract, {
        nft_info: { token_id: tokenId },
      });
    } catch (err) {
      throw new BlockchainException(
        {
          message: err.response.data.message,
        },
        err.response?.data,
        BlockchainStatus.GET_NFT_DETAIL_ERROR,
      );
    }
  }

  //token 전송 address->address
  public async transferToken(
    nftContract: string,
    sender: string,
    receiver: string,
    tokenId: string,
  ): Promise<MsgExecuteContract> {
    try {
      const executeMsg = {
        transfer_nft: {
          recipient: receiver,
          token_id: tokenId,
        },
      };

      return new MsgExecuteContract(sender, nftContract, { ...executeMsg }, {});
    } catch (err) {
      throw new BlockchainException(
        {
          message: err.response.data.message,
        },
        err.response?.data,
        BlockchainStatus.NFT_TRANSFER_ERROR,
      );
    }
  }

  //token 전송 address->contract
  public async sendToken(
    nftContract: string,
    toContract: string,
    sender: string,
    tokenId: string,
    msg: string,
  ): Promise<MsgExecuteContract> {
    try {
      const executeMsg = {
        send_nft: {
          msg: msg,
          //to contract
          contract: toContract,
          token_id: tokenId,
        },
      };

      return new MsgExecuteContract(sender, nftContract, { ...executeMsg }, {});
    } catch (err) {
      throw new BlockchainException(
        {
          message: err.response.data.message,
        },
        err.response?.data,
        BlockchainStatus.NFT_SEND_ERROR,
      );
    }
  }
}
