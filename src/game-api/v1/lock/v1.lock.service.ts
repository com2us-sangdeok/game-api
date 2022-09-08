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
import { DataSource, QueryRunner } from 'typeorm';
import { BlockchainError, TxStatus, TxType } from '../../../enum';
import { TransactionEntity } from '../../../entities';
import { TransactionRepository } from '../repository/transaction.repository';
import { CommonCode } from '../../../commom/common-code';

// noinspection DuplicatedCode
@Injectable()
export class V1LockService {
  private bc = this.blockchainService.blockChainClient();

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
      address: 'xpla16v6y48xllwy7amcmvhkv0a3zp7jepl44yvhvxt',
      mnemonic:
        'predict junior nation volcano boat melt glance climb target rubber lyrics rain fall globe face catch plastic receive antique picnic domain head hat glue',
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
        'not found(nft || lock contract)',
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
        'not fount(locked nft)',
        '',
        GameApiHttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const msg = await this.lockService.unLock(
      lockContract,
      nftContract,
      tokenId,
      admin.address,
    );
    const signer = [{ address: admin.address }];

    const unSignedTx = await this.commonService.makeTx(signer, [msg]);

    const wallet = this.bc.client.wallet(admin.mnemonic);

    let gameUnlockApi = consoleGameInfo.data.apiLists.filter(
      (v) => v.apiTypeCd === CommonCode.GAME_ITEM_UNLOCK,
    );

    if (gameUnlockApi.length !== 1) {
      throw new GameApiException(
        'not found(game server unlock api url)',
        '',
        GameApiHttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    gameUnlockApi = gameUnlockApi[0];

    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('SERIALIZABLE');

    //lock contract owner address info
    const lockOwnerInfo = await this.sequenceRepo.getSequenceNumber(
      queryRunner,
      admin.address,
    );

    if (!lockOwnerInfo) {
      await queryRunner.rollbackTransaction();
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

    try {
      const gameApiResult = await this.axiosClientUtil.post(
        gameUnlockApi.apiUrl,
        { name: '?', description: '?', uniqueId: '', tokenId: param.tokenId },
      );
      if (gameApiResult.body.code !== 200) {
        await queryRunner.rollbackTransaction();
        throw new GameApiException(
          'game server unlock api error',
          '',
          GameApiHttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new GameApiException(
        'game server unlock api error',
        '',
        GameApiHttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    let txHash;
    try {
      txHash = await this.commonService.broadcast(signTx);

      if (txHash.code && txHash.code !== BlockchainError.SUCCESS) {
        throw new GameApiException(
          txHash.raw_log,
          'broadcast error',
          GameApiHttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      await this.sequenceRepo.updateSequenceFromDb(queryRunner, admin.address);

      const dbParam = {
        ...param,
        ...consoleGameInfo.data,
      };
      const txEntity = new TransactionEntity({
        requestId,
        senderAddress: senderAdress,
        contractAddress: consoleGameInfo.data?.lockContract || null,
        tx: txEncoding(signTx),
        txHash: txHash.txhash,
        params: JSON.stringify(dbParam),
        txType: TxType.UNLOCK,
        status: TxStatus.PENDING,
        appId: param.appId,
        playerId: param.playerId,
      });

      const result = await this.txRepo.saveTx(txEntity);

      await queryRunner.commitTransaction();
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
