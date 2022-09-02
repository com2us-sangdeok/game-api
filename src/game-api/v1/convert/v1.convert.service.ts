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
import { CurrencyUpdateType, TxStatus, TxType } from '../../../enum';
import { ConvertRepository } from '../repository/convert.repository';
import { MnemonicKey, Tx, Wallet } from '@xpla/xpla.js';

@Injectable()
export class V1ConvertService {
  constructor(
    private readonly blockchainService: BlockchainService,
    private readonly cw20Service: CW20Service,
    private readonly commonService: CommonService,
    private readonly axiosClientUtil: AxiosClientUtil,
    private readonly convertRepository: ConvertRepository,
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
      console.log('%%%%%%%%%%%%%%%%%%%%%%');
      console.log(e);
      console.log('%%%%%%%%%%%%%%%%%%%%%%');
    }
  }

  //token : user wallet -> console wallet
  public async convertToCurrency(param: any): Promise<any> {
    const requestId = getNamespace(RequestContext.NAMESPACE).get(
      RequestContext.REQUEST_ID,
    );

    const currencyInfo = await this.checkGameCurrency(param);

    const currency = currencyInfo.currency.filter(
      (v) => v.convertTypeCd === param.convertTypeCd,
    )[0];

    //TODO
    // 1. 게임재화->토큰, 게임재화->코인, 코인->게임재화, 토큰->게임재화
    // - 입력 수량 체크 (입력수량<=0)
    // - 토큰 보유수량 체크
    // - 최소 교환 수량체크
    // - 일일 한도 체크

    // if (param.amount < currency.minConvertQuantityOneTime) {
    //   return {
    //     code: GameApiHttpStatus.NO_CONTENT,
    //     data: '입력 수량이 최소 교환 수량보다 적음',
    //   };
    // }
    //
    // if (param.amount > currency.avalibleAmount) {
    //   return {
    //     code: GameApiHttpStatus.NO_CONTENT,
    //     data: '입력 수량이 교환 가능한 수량보다 많음',
    //   };
    // }
    // if (currency.tokenAmount.amount <= 0) {
    //   return {
    //     code: GameApiHttpStatus.NO_CONTENT,
    //     data: '토큰 보유 수량이 0보다 적음',
    //   };
    // }

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

      const result = await this.convertRepository.saveTx(txEntity);
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

  //token : console wallet -> user wallet
  public async convertToToken(param): Promise<any> {
    const requestId = getNamespace(RequestContext.NAMESPACE).get(
      RequestContext.REQUEST_ID,
    );

    const currencyInfo = await this.checkGameCurrency(param);

    const currency = currencyInfo.currency.filter(
      (v) => v.convertTypeCd === param.convertTypeCd,
    )[0];

    //TODO 교환비 dummy
    const exchangeRate = '100';

    const gameApiInfo = currencyInfo.apiList.filter(
      (v) => v.apiTypeCd === CommonCode.GAME_USER_CURRENCY_UPDATE,
    );

    // //게임 재화 수량 감소 업데이트 api 호출(200 or 201이 아닐때)
    // '1 = 게임재화 -> C2X, 2 = C2X -> 게임재화, 3 = 게임재화 -> 게임토큰, 4 = 게임토큰 -> 게임재화',
    const gameCurrencyUpd = (
      await this.axiosClientUtil.post(gameApiInfo[0].apiUrl, {
        playerId: param.playerId,
        server: [param.serverId, param.channelId],
        selectedCid: param.characterId,
        goodsCode: currency.goodsCode,
        goodsName: currency.goodsName,
        amount: -param.amount,
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

    let decimals = 18n;
    let msg: Msg;
    if (param.convertTypeCd === CommonCode.CONVERT_TOKEN_GAME) {
      decimals = BigInt(currency.tokenAmount.decimals);
    }

    //token amount
    const tokenAmount =
      (BigInt(param.amount) * 10n ** decimals) / BigInt(exchangeRate);

    //TODO db에서 sequence number 가져오기 && HSM 연동 필요
    const adminAddress = currencyInfo.providerAddress;

    if (param.convertTypeCd === CommonCode.CONVERT_COIN_GAME) {
      msg = await this.commonService.transferCoin(
        adminAddress,
        param.accAddress,
        String(tokenAmount),
        'axpla',
      );
    }

    if (param.convertTypeCd === CommonCode.CONVERT_TOKEN_GAME) {
      msg = await this.cw20Service.transferToken(
        currencyInfo.tokenContract,
        adminAddress,
        param.accAddress,
        String(tokenAmount),
      );
    }

    const signer = [
      {
        address: adminAddress,
      },
    ];

    const unSignedTx: Tx = await this.commonService.makeTx(signer, [msg]);
    const encodedUnSignedTx = txEncoding(unSignedTx);
    //TODO 테스트 로직 개선 필요
    const admin = {
      address: 'xpla16v6y48xllwy7amcmvhkv0a3zp7jepl44yvhvxt',
      mnemonic:
        'predict junior nation volcano boat melt glance climb target rubber lyrics rain fall globe face catch plastic receive antique picnic domain head hat glue',
    };
    const txHash = await this.convertBroadcast({
      encodedUnSignedTx: encodedUnSignedTx,
      mnemonic: admin.mnemonic,
    });
    try {
      const txEntity = new TransactionEntity({
        requestId,
        senderAddress: adminAddress,
        contractAddress: currencyInfo?.tokenContract || null,
        tx: encodedUnSignedTx,
        txHash: txHash?.txhash || null,
        params: JSON.stringify(param),
        txType: TxType.CONVERTTOTOKEN,
        status: TxStatus.PENDING,
        appId: param.appId,
        playerId: param.playerId,
      });

      const result = await this.convertRepository.saveTx(txEntity);
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
      txHash: txHash,
      ...param,
    };
  }

  //###############################################################
  //######################### 내부 공통 함수 #########################
  //###############################################################

  public async convertBroadcast(param) {
    //TODO  ********** 테스트 코드 **********

    const paramTx = txDecoding(param.encodedUnSignedTx);

    const wallet: Wallet = this.lcd.wallet(
      new MnemonicKey({ mnemonic: param.mnemonic }),
    );

    const signedTx = await this.commonService.sign(wallet, paramTx);
    //TODO  ********** 테스트 코드 **********

    return await this.commonService.broadcast(signedTx);
  }

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

      if (gameApiInfo.length > 0) {
        gameCurrencyInfo = (
          await this.axiosClientUtil.post(gameApiInfo[0].apiUrl, {
            playerId: param.playerId,
            server: [param.serverId, param.channelId],
            selectedCid: param.characterId,
          })
        ).body;
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
      for (let i = 0; i < gameCurrencyInfo.length; i++) {
        if (v.goodsCode === gameCurrencyInfo[i].goodsCode) {
          tempAmount = gameCurrencyInfo[i].amount;
          tempAvalibleAmount = gameCurrencyInfo[i].avalibleAmount;
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
