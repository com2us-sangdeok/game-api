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
import { txEncoding, txDecoding } from '../../../util/encoding';
import { Msg } from '@xpla/xpla.js/dist/core';
import { RequestContext } from '../../../commom/context/request.context';
import { getNamespace } from 'cls-hooked';
import { TransactionEntity } from '../../../entities';
import { TxType } from '../../../enum';
import { ConvertRepository } from '../repository/convert.repository';
import { MnemonicKey, Wallet, Tx } from '@xpla/xpla.js';

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
      return this.checkGameCurrency(param);
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

    //교환수량 계산 입력값*교환비 => game-api 호출시 필요
    const exchangeAmount = Number(param.amount) * Number(currency.exchangeRate);
    const userAddress = param.accAddress;

    //TODO . convert시 받을 주소 변경 필요!!
    const receiverAddress = 'xpla16v6y48xllwy7amcmvhkv0a3zp7jepl44yvhvxt';
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
      //bigint로 계산
      const tokenAmount =
        BigInt(splitAmount[0]) * 10n ** BigInt(currency.tokenAmount.decimals) +
        BigInt(splitAmount[1]) *
          10n **
            (BigInt(currency.tokenAmount.decimals) -
              BigInt(splitAmount[1].length));

      msg = await this.cw20Service.transferToken(
        param.tokenContract,
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

    const data = {
      gameIndex: param.gameIndex,
      appId: param.appId,
      serverId: param.serverId,
      channelId: param.channelId,
      playerId: param.playerId,
      requestId: requestId,
      //station-server와 같은 방법으로 인코딩
      unSignedTx: encodedUnSignedTx,
    };

    try {
      const txEntity = new TransactionEntity({
        requestId,
        senderAddress: userAddress,
        contractAddress: param?.tokenContract,
        tx: encodedUnSignedTx,
        params: JSON.stringify(param),
        txType: TxType.CONVERTTOCURRENCY,
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

    //TODO. broadcast 삭제 필요
    const sender = {
      address: 'xpla1nlnang3a8wwgwx0sm4zut9ygx8mrvdes5n9m3g',
      mnemonic:
        'diet seed crumble ranch witness legal all swear goat night chef album gold useful antenna nose similar jazz elite cute wrestle enroll route unfold',
    };
    try {
      const tt = await this.convertBroadcast({
        encodedUnSignedTx: encodedUnSignedTx,
        mnemonoc: sender.mnemonic,
      });
      console.log(tt);
      return { code: GameApiHttpStatus.OK, data: encodedUnSignedTx };
    } catch (err) {
      console.log(err);
    }
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

    const exchangeRate = currency.exchangeRate;

    //게임 재화 수량 감소 업데이트 api 호출
    const gameServerApiResult = { code: 1, message: 'success' };

    if (gameServerApiResult.code !== 1) {
      //exception
      return;
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
    const adminAddress = 'xpla16v6y48xllwy7amcmvhkv0a3zp7jepl44yvhvxt';

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
        param.tokenContract,
        adminAddress,
        param.accAddress,
        String(tokenAmount),
      );
    }

    console.log(msg);

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

    console.log('%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%');
    console.log(txHash);
    console.log('%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%');
    try {
      const txEntity = new TransactionEntity({
        requestId,
        senderAddress: adminAddress,
        contractAddress: param?.tokenContract,
        tx: encodedUnSignedTx,
        txHash: txHash.txhash,
        params: JSON.stringify(param),
        txType: TxType.CONVERTTOTOKEN,
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
    return msg;
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
    //gameIndex, appId 별로 console-api 에서 게임 url정보 가져오기
    //TODO. domain정해지면 바꾸기
    // const gameUrlInfo: any = this.axiosClientUtil.get(
    //   `https://hive-bc-game-api/${param.appId}`,
    // );

    const consoleGameInfo = {
      code: 200,
      message: 'success',
      data: {
        id: 1,
        company: 1,
        gameindex: 1,
        betagameLauncherId: 1,
        appid: 'com.com2us.c2xwallet.global.normal',
        gameTokenName: 'HST',
        gameTokenImage: 'icon.png',
        settingCompleteTypeCd: '1001000901',
        apiSettingCompleteTypeCd: '1001000902',
        activeTypeCd: '1001000601',

        convert: [
          //xpla<->game currency
          {
            convertTypeCd: '1001000801',
            goodsName: 'soulstone',
            goodsCode: 'soulstoneCode',
            goodsImage: 'soulstone.png',
            minConvertQuantityOneTime: 1000,
            maxConvertQuantityDays: 100000,
            exchangeRate: 1000,
          },
          //game token <-> game currency
          {
            convertTypeCd: '1001000802',
            goodsName: 'gold',
            goodsCode: 'goldCode',
            goodsImage: 'gold.png',
            minConvertQuantityOneTime: 1000,
            maxConvertQuantityDays: 100000,
            exchangeRate: 100,
          },
        ],
      },
    };

    const haveCurrencyInfo = [
      //1001000801 => (xpla<->soulstone)
      {
        goodsCode: 'goldCode',
        goodsName: 'gold',
        amount: 100000,
        avalibleAmount: 10000,
      },
      //1001000802 => (HST<->gold)
      {
        goodsCode: 'soulstoneCode',
        goodsName: 'soulstone',
        amount: 1000000,
        avalibleAmount: 100000,
      },
    ];

    //TODO xpla로 변경 필요
    const xplaBalance = (
      await this.commonService.getBalance(param.accAddress)
    ).filter((v) => v.denom === 'axpla')[0];

    let gameTokenBalance: any = await this.cw20Service.tokenBalance(
      param.tokenContract,
      param.accAddress,
    );

    gameTokenBalance = {
      tokenName: gameTokenBalance.tokenName,
      tokenSymbol: gameTokenBalance.tokenSymbol,
      decimals: gameTokenBalance.decimals,
      amount: gameTokenBalance.balance?.balance,
    };

    const currency = consoleGameInfo.data.convert.map((v) => {
      let tempAmount: number;
      let tempAvalibleAmount: number;
      for (let i = 0; i < haveCurrencyInfo.length; i++) {
        if (v.goodsCode === haveCurrencyInfo[i].goodsCode) {
          tempAmount = haveCurrencyInfo[i].amount;
          tempAvalibleAmount = haveCurrencyInfo[i].avalibleAmount;
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

    //game api 호출!(제약사항, 해당 유저 컨버트 가능 수량등 정보 필요)
    //TODO. dummy data 수정 필요
    // let currencyInfo = this.axiosClientUtil.post(gameUrlInfo.url, {});

    return {
      gameIndex: consoleGameInfo.data.gameindex,
      appId: consoleGameInfo.data.appid,
      serverId: '1',
      channelId: '1',
      playerId: '1',
      currency: currency,
    };
  }

  //게임 정보 업데이트
  private updGameCurrency() {}
}
