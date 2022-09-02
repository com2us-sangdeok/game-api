import { Injectable } from '@nestjs/common';
import { BlockchainService } from '../../../bc-core/blockchain/blockchain.service';
import { LockService } from '../../../bc-core/modules/contract/lock.service';
import { AxiosClientUtil } from '../../../util/axios-client.util';
import { CW721Service } from '../../../bc-core/modules/contract/cw721.service';
import {
  GameApiException,
  GameApiHttpStatus,
} from '../../../exception/request.exception';
import { getNamespace } from 'cls-hooked';
import { CommonService } from '../../../bc-core/modules/common.service';
import { txDecoding, txEncoding } from '../../../util/encoding';
import { V1LockOutputDto } from '../dto/game-api-v1-lock.dto';
import { SequenceRepository } from '../../../util/repository/sequence.repository';
import { RequestContext } from '../../../commom/context/request.context';
import { DataSource } from 'typeorm';
import { BlockchainError, TxStatus, TxType } from '../../../enum';
import { TransactionEntity } from '../../../entities';
import { TransactionRepository } from '../repository/transaction.repository';

@Injectable()
export class V1LockService {
  private bc = this.blockchainService.blockChainClient();
  private lcd = this.blockchainService.lcdClient();

  constructor(
    private readonly blockchainService: BlockchainService,
    private readonly lockService: LockService,
    private readonly cw721Service: CW721Service,
    private readonly axiosClientUtil: AxiosClientUtil,
    private readonly commonService: CommonService,
    private readonly sequenceRepo: SequenceRepository,
    private readonly dataSource: DataSource,
    private readonly txRepo: TransactionRepository,
  ) {}

  public async lockedNftList(param): Promise<any> {
    const consoleGameInfo = await this.consoleApi(param.appId);

    const senderAdress = param.accAddress;
    const lockContract = consoleGameInfo.data?.lockContract || null;

    if (!lockContract) {
      throw new GameApiException(
        'empty lock contract',
        '',
        GameApiHttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const lockedNft = await this.lockService.lockNftList(
      lockContract,
      senderAdress,
    );

    return {
      appId: consoleGameInfo.data.appId,
      serverId: consoleGameInfo.data.serverId,
      characterId: consoleGameInfo.data?.characterId,
      playerId: consoleGameInfo.data.playerId,
      accAddress: param.accAddress,
      nftContract: param.nftContract,
      lockedNft: lockedNft,
    };
  }

  //게임 내 사용 불가 요청
  public async lock(param): Promise<V1LockOutputDto> {
    const requestId = getNamespace(RequestContext.NAMESPACE).get(
      RequestContext.REQUEST_ID,
    );

    let consoleGameInfo;
    try {
      consoleGameInfo = (
        await this.axiosClientUtil.get(
          `${process.env.CONSOLE_URL}/v1/game/${param.appId}`,
        )
      ).body;
    } catch (err) {
      throw new GameApiException(
        err.message,
        err.stack,
        GameApiHttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const senderAdress = param.accAddress;
    const nftContract = consoleGameInfo.data?.nftContract || null;
    const lockContract = consoleGameInfo.data?.lockContract || null;

    if (!nftContract || !lockContract) {
      throw new GameApiException(
        'contract error',
        '',
        GameApiHttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    const tokenId = param.tokenId;

    const nftList = await this.cw721Service.nftList(nftContract, senderAdress);

    if (nftList.tokens.length < 1) {
      //exception
      throw new GameApiException(
        'empty nft list',
        '',
        GameApiHttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const isOwnedNft = nftList.tokens.filter((v) => v === tokenId);

    if (isOwnedNft.length === 0) {
      //exception
      throw new GameApiException(
        'this nft is not yours',
        '',
        GameApiHttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const msg = await this.lockService.lock(
      senderAdress,
      lockContract,
      nftContract,
      tokenId,
    );
    const signer = [{ address: senderAdress }];
    const unSignedTx = await this.commonService.makeTx(signer, [msg]);
    const encodedUnSignedTx = txEncoding(unSignedTx);

    const dbParam = {
      ...param,
      ...consoleGameInfo.data,
    };
    try {
      const txEntity = new TransactionEntity({
        requestId,
        senderAddress: senderAdress,
        contractAddress: consoleGameInfo.data?.lockContract || null,
        tx: encodedUnSignedTx,
        txHash: null,
        params: JSON.stringify(dbParam),
        txType: TxType.LOCK,
        status: TxStatus.WAIT,
        appId: param.appId,
        playerId: param.playerId,
      });

      const result = await this.txRepo.saveTx(txEntity);
    } catch (err) {
      console.log(err);
      throw new GameApiException(
        err.message,
        err.stack,
        GameApiHttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return {
      requestId: requestId,
      tokenId: tokenId,
      nftContract: nftContract,
      unSignedTx: encodedUnSignedTx,
    };
  }

  //게임 내 사용 가능 요청
  public async unLock(param): Promise<any> {
    const requestId = getNamespace(RequestContext.NAMESPACE).get(
      RequestContext.REQUEST_ID,
    );

    const admin = {
      address: 'xpla1xvh9tt6gsrn0yem2fv6xjfrfyefal42ezzxhca',
      mnemonic:
        'pave taste ball fortune will casual fresh gain aunt horror town leave breeze horn satoshi warfare bind skate lucky plastic check nose position pencil',
    };

    let consoleGameInfo;
    try {
      consoleGameInfo = (
        await this.axiosClientUtil.get(
          `${process.env.CONSOLE_URL}/v1/game/${param.appId}`,
        )
      ).body;
    } catch (err) {
      throw new GameApiException(
        err.message,
        err.stack,
        GameApiHttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const senderAdress = param.accAddress;
    const nftContract = consoleGameInfo.data?.nftContract || null;
    const lockContract = consoleGameInfo.data?.lockContract || null;
    const tokenId = param.tokenId;

    if (!nftContract || !lockContract) {
      throw new GameApiException(
        'contract error',
        '',
        GameApiHttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const lockNftList = await this.lockService.lockNftList(
      lockContract,
      senderAdress,
    );

    if (lockNftList.length < 1) {
      throw new GameApiException(
        'empty lock nft list error',
        '',
        GameApiHttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('SERIALIZABLE');

    const msg = await this.lockService.unLock(
      lockContract,
      nftContract,
      tokenId,
      admin.address,
    );
    const signer = [{ address: admin.address }];
    const unSignedTx = await this.commonService.makeTx(signer, [msg]);

    const wallet = this.bc.client.wallet(admin.mnemonic);

    //lock contract owner address info
    const lockOwnerInfo = await this.sequenceRepo.getSequenceNumber(
      queryRunner,
      admin.address,
    );

    if (!lockOwnerInfo) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      throw new GameApiException(
        'lock contract owner info error',
        '',
        GameApiHttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    const signTx = await this.commonService.sign(
      wallet,
      unSignedTx,
      lockOwnerInfo.sequenceNumber,
    );

    let txHash;
    try {
      txHash = await this.commonService.broadcast(signTx);

      if (!txHash.code || txHash.code === BlockchainError.SUCCESS) {
        //TODO console-api 에서 받아온 주소로 변경 필요
        await this.sequenceRepo.updateSequenceFromDb(
          queryRunner,
          admin.address,
        );

        const dbParam = {
          ...param,
          ...consoleGameInfo.data,
        };
        try {
          const txEntity = new TransactionEntity({
            requestId,
            senderAddress: senderAdress,
            contractAddress: consoleGameInfo.data?.lockContract || null,
            tx: txEncoding(signTx),
            txHash: null,
            params: JSON.stringify(dbParam),
            txType: TxType.LOCK,
            status: TxStatus.PENDING,
            appId: param.appId,
            playerId: param.playerId,
          });

          const result = await this.txRepo.saveTx(txEntity);
        } catch (err) {
          console.log(err);
          throw new GameApiException(
            err.message,
            err.stack,
            GameApiHttpStatus.INTERNAL_SERVER_ERROR,
          );
        }

        await queryRunner.commitTransaction();
      } else {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
        throw new GameApiException(
          'broadcast error',
          '',
          GameApiHttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    } catch (err) {
      await queryRunner.rollbackTransaction();

      throw new GameApiException(
        err.message,
        err.stack,
        GameApiHttpStatus.INTERNAL_SERVER_ERROR,
      );
    } finally {
      await queryRunner.release();
    }

    return {
      requestId: requestId,
      tokenId: tokenId,
      nftContract: nftContract,
      txHash: txHash,
    };
  }

  private async consoleApi(appId) {
    try {
      return (
        await this.axiosClientUtil.get(
          `${process.env.CONSOLE_URL}/v1/game/${appId}`,
        )
      ).body;
    } catch (err) {
      throw new GameApiException(
        err.message,
        err.stack,
        GameApiHttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
