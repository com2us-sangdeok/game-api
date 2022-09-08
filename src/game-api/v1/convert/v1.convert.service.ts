import { Injectable } from '@nestjs/common';
import { BlockchainService } from '../../../bc-core/blockchain/blockchain.service';
import {
  V1ConvertCurrencyInfoInputDto,
  V1ConvertCurrencyInfoOutputDto,
} from '../dto/game-api-v1-convert.dto';
import { AxiosClientUtil } from '../../../util/axios-client.util';
import { CommonCode } from '../../../commom/common-code';
import { CW20Service } from '../../../bc-core/modules/contract/cw20.service';
import { CommonService } from '../../../bc-core/modules/common.service';
import {
  GameApiException,
  GameApiHttpStatus,
} from '../../../exception/request.exception';
import { txDecoding, txEncoding } from '../../../util/encoding';
import { Msg } from '@xpla/xpla.js/dist/core';
import { RequestContext } from '../../../commom/context/request.context';
import { getNamespace } from 'cls-hooked';
import { TransactionEntity } from '../../../entities';
import {
  BlockchainError,
  CurrencyUpdateType,
  TxStatus,
  TxType,
} from '../../../enum';
import { TransactionRepository } from '../repository/transaction.repository';
import { MnemonicKey, Tx, Wallet } from '@xpla/xpla.js';
import { DataSource, QueryRunner } from 'typeorm';
import { SequenceRepository } from '../../../util/repository/sequence.repository';
import BigNumber from 'bignumber.js';

// noinspection DuplicatedCode
@Injectable()
export class V1ConvertService {
  private bc = this.blockchainService.blockChainClient();

  //TODO 수수료 받을 생태계 지갑( 서비스 올라가기전에 삭제 필요)
  private convertPool = {
    address: 'xpla1dtc79w9599470xxr6jnz9w0zdvdjfpfuv9vkjx',
    mnemonic:
      'onion legal sunny dog nurse trial venue venue dress frozen scout parrot tag usual rhythm oyster regret dutch later view copper web glad pistol',
  };

  constructor(
    private readonly blockchainService: BlockchainService,
    private readonly cw20Service: CW20Service,
    private readonly commonService: CommonService,
    private readonly axiosClientUtil: AxiosClientUtil,
    private readonly txRepo: TransactionRepository,
    private readonly sequenceRepo: SequenceRepository,
    private readonly dataSource: DataSource,
  ) {}

  private lcd = this.blockchainService.lcdClient();

  public async currencyInfo(
    param: V1ConvertCurrencyInfoInputDto,
  ): Promise<any> {
    try {
      const currenctyInfo = await this.checkGameCurrency(param);
      delete currenctyInfo.apiList;

      return currenctyInfo;
    } catch (e) {
      throw new GameApiException(
        e.message,
        e.stack,
        GameApiHttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  //토큰, 코인 -> 게임 재화(한도 없음) 수수료는 amount에서 빼고 교환 후 지급
  //ex) 100xpla -> gold , 97 xpla를 gold로
  //유저 사인 필요 => 후 작업에서 game server currency update api 호출
  public async convertToCurrency(param: any): Promise<any> {
    const requestId = getNamespace(RequestContext.NAMESPACE).get(
      RequestContext.REQUEST_ID,
    );

    const currencyInfo = await this.checkGameCurrency(param);

    const currency = currencyInfo.currency.filter(
      (v) => v.convertTypeCd === param.convertTypeCd,
    )[0];

    //TODO ---------------- 교환비 dummy ------------------
    let exchangeRate = '1000';

    if (param.convertTypeCd === CommonCode.CONVERT_TOKEN_GAME)
      exchangeRate = '100';
    //TODO ---------------- 교환비 dummy ------------------

    const splitAmount = param.amount.split('.');

    if (splitAmount.length === 1) splitAmount.push('0');

    //교환수량 계산 입력값*교환비 => game-api 호출시 필요
    // const exchangeAmount = Number(param.amount) * Number(currency.exchangeRate);
    const userAddress = param.accAddress;

    //TODO . convert시 받을 주소 provider가 맞는지?
    const receiverAddress = currencyInfo.providerAddress;
    let msg: Msg;

    if (param.convertTypeCd === CommonCode.CONVERT_COIN_GAME) {
      //bigint로 계산
      const tokenAmount =
        BigInt(splitAmount[0]) * 10n ** 18n +
        BigInt(splitAmount[1]) * 10n ** (18n - BigInt(splitAmount[1].length));

      // const convertFee = tokenAmount * 0.03;
      console.log('%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%');
      // console.log(tt * 0.03);
      const tt = new BigNumber(param.amount);
      console.log(tt);
      console.log(tt.multipliedBy(1000000000000000000).toString());
      console.log('%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%');

      msg = await this.commonService.transferCoin(
        userAddress,
        receiverAddress,
        String(tokenAmount),
        'axpla',
      );
    }

    if (param.convertTypeCd === CommonCode.CONVERT_TOKEN_GAME) {
      if (!currencyInfo.tokenContract) {
        throw new GameApiException(
          'game token contract error',
          '',
          GameApiHttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      //bigint로 계산
      const tokenAmount =
        BigInt(splitAmount[0]) * 10n ** BigInt(currency.tokenAmount.decimals) +
        BigInt(splitAmount[1]) *
          10n **
            (BigInt(currency.tokenAmount.decimals) -
              BigInt(splitAmount[1].length));

      msg = await this.cw20Service.transferToken(
        currencyInfo.tokenContract,
        userAddress,
        receiverAddress,
        String(tokenAmount),
      );
    }

    const signer = [
      {
        address: param.accAddress,
      },
    ];
    //대납이 없을때
    const unSignedTx: Tx = await this.commonService.makeTx(signer, [msg]);
    const encodedUnSignedTx = txEncoding(unSignedTx);

    try {
      const txEntity = new TransactionEntity({
        requestId: requestId,
        senderAddress: userAddress,
        contractAddress: currencyInfo?.tokenContract || null,
        tx: encodedUnSignedTx,
        params: JSON.stringify(param),
        txType: TxType.CONVERTTOCURRENCY,
        status: TxStatus.WAIT,
        appId: param.appId,
        playerId: param.playerId,
      });

      const result = await this.txRepo.saveTx(txEntity);
    } catch (err) {
      throw new GameApiException(
        err.message,
        err.stack,
        GameApiHttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return {
      requestId: requestId,
      encodedUnSignedTx: encodedUnSignedTx,
      ...param,
    };
  }

  //게임 재화 -> 토큰, 코인 한도적용 필요
  public async convertToToken(param): Promise<any> {
    const requestId = getNamespace(RequestContext.NAMESPACE).get(
      RequestContext.REQUEST_ID,
    );

    const currencyInfo = await this.checkGameCurrency(param);

    const currency = currencyInfo.currency.filter(
      (v) => v.convertTypeCd === param.convertTypeCd,
    )[0];

    //TODO ---------------- 교환비 dummy ------------------
    let exchangeRate = '100';

    if (param.convertTypeCd === CommonCode.CONVERT_TOKEN_GAME)
      exchangeRate = '1';
    //TODO ---------------- 교환비 dummy ------------------

    const gameApiInfo = currencyInfo.apiList.filter(
      (v) => v.apiTypeCd === CommonCode.GAME_USER_CURRENCY_UPDATE,
    );

    let decimals = 18n;
    let msg: Msg;
    if (param.convertTypeCd === CommonCode.CONVERT_TOKEN_GAME) {
      decimals = BigInt(currency.tokenAmount.decimals);
    }

    //token amount
    const inputAmount =
      (BigInt(param.amount) * 10n ** decimals) / BigInt(exchangeRate);

    console.log('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@');
    console.log(currency);
    console.log('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@');

    //TODO 게임재화 -> 코인, 토큰 ///// 다른 경우의수가 있는지 한번 더 생각 필요
    //입력 수량(게임 재화)/교환비가 최소 가능 수량(코인)보다 적은 경우
    // if (inputAmountTransToken < Number(currency.minConvertQuantityOneTime)) {
    //   return {
    //     message: '입력 수량이 최소 교환 수량보다 적음',
    //   };
    // }
    // //남은 일일 한도가 입력 수량보다 적은 경우
    // if (inputAmountTransToken < Number(param.amount)) {
    //   return {
    //     message: '입력 수량이 교환 가능 수량보다 많음',
    //   };
    // }
    // //게임 재화 보유 수량이 입력 수량(재화) 보다 적은 경우
    // if (Number(currency.currencyAmount) < Number(param.amount)) {
    //   return {
    //     message: '게임 재화 보유 수량이 입력 수량보다 적음',
    //   };
    // }

    // 게임 재화 수량 감소 업데이트 api 호출(200 or 201이 아닐때)
    // type : '1 = 게임재화 -> C2X, 2 = C2X -> 게임재화, 3 = 게임재화 -> 게임토큰, 4 = 게임토큰 -> 게임재화',
    const gameCurrencyUpd = (
      await this.axiosClientUtil.post(gameApiInfo[0].apiUrl, {
        playerId: param.playerId,
        server: [param.serverId, param.channelId],
        selectedCid: param.characterId,
        goodsCode: currency.goodsCode,
        goodsName: currency.goodsName,
        amount: param.amount,
        type:
          currency.convertTypeCd === CommonCode.CONVERT_COIN_GAME
            ? CurrencyUpdateType.CURRENCYTOXPLA
            : CurrencyUpdateType.CURRENCYTOGAMETOKEN,
      })
    ).body;

    if (
      !(
        GameApiHttpStatus.OK <= gameCurrencyUpd.code &&
        gameCurrencyUpd.code <= GameApiHttpStatus.CREATED
      )
    ) {
      throw new GameApiException(
        'game-server-api update status Error',
        JSON.stringify(gameCurrencyUpd),
        GameApiHttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const adminAddress = currencyInfo.providerAddress;

    if (param.convertTypeCd === CommonCode.CONVERT_COIN_GAME) {
      msg = await this.commonService.transferCoin(
        adminAddress,
        param.accAddress,
        String(inputAmount),
        'axpla',
      );
    }

    if (param.convertTypeCd === CommonCode.CONVERT_TOKEN_GAME) {
      msg = await this.cw20Service.transferToken(
        currencyInfo.tokenContract,
        adminAddress,
        param.accAddress,
        String(inputAmount),
      );
    }

    const signer = [
      {
        address: adminAddress,
      },
    ];

    //TODO ---------- hsm 연동 필요 ----------
    const admin = {
      address: 'xpla16v6y48xllwy7amcmvhkv0a3zp7jepl44yvhvxt',
      mnemonic:
        'predict junior nation volcano boat melt glance climb target rubber lyrics rain fall globe face catch plastic receive antique picnic domain head hat glue',
    };
    //TODO ---------- hsm 연동 필요 ----------

    const wallet = this.bc.client.wallet(admin.mnemonic);
    const unSignedTx: Tx = await this.commonService.makeTx(signer, [msg]);
    const encodedUnSignedTx = txEncoding(unSignedTx);

    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('SERIALIZABLE');

    //lock contract owner address info
    const lockOwnerInfo = await this.sequenceRepo.getSequenceNumber(
      queryRunner,
      admin.address,
    );
    const signTx = await this.commonService.sign(
      wallet,
      unSignedTx,
      lockOwnerInfo.sequenceNumber,
    );

    const txHash = await this.commonService.broadcast(signTx);

    try {
      if (!lockOwnerInfo) {
        throw new GameApiException(
          'lock contract owner info error',
          '',
          GameApiHttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      if (txHash.code && txHash.code !== BlockchainError.SUCCESS) {
        throw new GameApiException(
          txHash.raw_log,
          'broadcast error',
          GameApiHttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const dbParam = {
        ...param,
        ...currencyInfo,
      };
      const txEntity = new TransactionEntity({
        requestId,
        senderAddress: adminAddress,
        contractAddress: currencyInfo?.tokenContract || null,
        tx: encodedUnSignedTx,
        txHash: txHash?.txhash || null,
        params: JSON.stringify(dbParam),
        txType: TxType.CONVERTTOTOKEN,
        status: TxStatus.PENDING,
        appId: param.appId,
        playerId: param.playerId,
      });

      await this.txRepo.insertTx(queryRunner, txEntity);
      await this.sequenceRepo.updateSequenceFromDb(queryRunner, admin.address);

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
      txHash: txHash.txhash,
      ...param,
    };
  }

  //###############################################################
  //######################### 내부 공통 함수 #########################
  //###############################################################

  //게임 재화 정보 확인
  private async checkGameCurrency(
    param,
  ): Promise<V1ConvertCurrencyInfoOutputDto> {
    //appId 별로 console-api 에서 게임 url정보 가져오기
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

    if (
      !(
        GameApiHttpStatus.OK <= consoleGameInfo.code &&
        consoleGameInfo.code <= GameApiHttpStatus.CREATED
      )
    ) {
      throw new GameApiException(
        'console-api Status Error',
        JSON.stringify(consoleGameInfo),
        GameApiHttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    let gameCurrencyInfo;

    if (consoleGameInfo.data.apiLists.length > 0) {
      const gameApiInfo = consoleGameInfo.data.apiLists.filter(
        (v) => v.apiTypeCd === CommonCode.GAME_USER_CURRENCY,
      );

      console.log('@#@#@#@#@# game api info @#@#@##$#$#$');
      console.log(gameApiInfo);
      console.log('@#@#@#@#@# game api info @#@#@##$#$#$');
      if (gameApiInfo.length > 0) {
        gameCurrencyInfo = (
          await this.axiosClientUtil.post(gameApiInfo[0].apiUrl, {
            playerId: param.playerId,
            server: [param.serverId, param.channelId],
            selectedCid: param.characterId,
          })
        ).body;

        console.log('%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%');
        console.log(gameCurrencyInfo);
        console.log('%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%');
      }
    }

    if (
      !(
        GameApiHttpStatus.OK <= gameCurrencyInfo.code &&
        consoleGameInfo.code <= GameApiHttpStatus.CREATED
      )
    ) {
      throw new GameApiException(
        'game-server-api get currency Status Error',
        JSON.stringify(gameCurrencyInfo),
        GameApiHttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const xplaBalance = (
      await this.commonService.getBalance(param.accAddress)
    ).filter((v) => v.denom === 'axpla')[0];

    let gameTokenBalance: any = {};
    if (consoleGameInfo.data?.gameTokenContract) {
      gameTokenBalance = await this.cw20Service.tokenBalance(
        consoleGameInfo.data.gameTokenContract,
        param.accAddress,
      );

      gameTokenBalance = {
        tokenName: gameTokenBalance.tokenName,
        tokenSymbol: gameTokenBalance.tokenSymbol,
        decimals: gameTokenBalance.decimals,
        amount: gameTokenBalance.balance?.balance,
      };
    }

    const currency = consoleGameInfo.data.convertLists.map((v) => {
      let tempAmount: number = 0;
      let tempAvalibleAmount: number = 0;
      for (let i = 0; i < gameCurrencyInfo.data.length; i++) {
        if (v.goodsCode === gameCurrencyInfo.data[i].goodsCode) {
          tempAmount = gameCurrencyInfo.data[i].amount;
          tempAvalibleAmount = gameCurrencyInfo.data[i].avalibleAmount;
        }
      }

      let tokenName: string = '';
      let tokenImage: string = '';
      let tokenAmount: any = {};

      if (v.convertTypeCd === CommonCode.CONVERT_COIN_GAME) {
        //xpla 고정
        tokenName = 'XPLA';
        tokenImage = 'xpla.png';
        tokenAmount = xplaBalance;
      }
      if (v.convertTypeCd === CommonCode.CONVERT_TOKEN_GAME) {
        tokenName = consoleGameInfo.data.gameTokenName;
        tokenImage = consoleGameInfo.data.gameTokenImage;
        tokenAmount = gameTokenBalance;
      }

      return {
        ...v,
        tokenName: tokenName,
        tokenImage: tokenImage,
        tokenAmount: tokenAmount,
        currencyAmount: tempAmount.toString(),
        avalibleAmount: tempAvalibleAmount.toString(),
      };
    });

    return {
      // gameIndex: consoleGameInfo.data.gameindex,
      appId: consoleGameInfo.data.appid,
      serverId: param.serverId,
      playerId: param.playerId,
      characterId: param.characterId,
      providerAddress: consoleGameInfo.data.gameProviderAddress,
      tokenContract: consoleGameInfo.data?.gameTokenContract || null,
      apiList: consoleGameInfo.data?.apiLists || null,
      currency: currency,
    };
  }

  //게임 정보 업데이트
  private updGameCurrency() {}
}
