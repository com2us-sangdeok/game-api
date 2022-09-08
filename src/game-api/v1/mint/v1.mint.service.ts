import {
  Inject,
  Injectable,
  LoggerService,
} from '@nestjs/common';
import {
  GameApiV1BurnItemDto, GameApiV1BurnItemReqDto,
  GameApiV1BurnItemResDto, GameApiV1CalculateMintingDataDto,
  GameApiV1CalculateMintingFeeDto,
  GameApiV1MintDto,
  GameApiV1MintItemDto,
  GameApiV1ResMintItemDto,
  GameApiV1ResponseMintDto,
  GameApiV1ResponseValidItemDto,
  GameApiV1ValidItemDto,
  TestDto,
} from '../dto/game-api-v1-mint.dto';
import { ConfigService } from '@nestjs/config';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { BlockchainService } from '../../../bc-core/blockchain/blockchain.service';
import { LockService } from '../../../bc-core/modules/contract/lock.service';
import {
  GameApiException,
  GameApiHttpStatus,
} from '../../../exception/request.exception';
import { AxiosClientUtil } from '../../../util/axios-client.util';
import { AssetV1Service } from '../../../asset-api/v1/asset-v1.service';
import { CW20Service } from '../../../bc-core/modules/contract/cw20.service';
import { CW721Service } from '../../../bc-core/modules/contract/cw721.service';
import { MintRepository } from '../repository/mint.repository';
import { CommonService } from '../../../bc-core/modules/common.service';
import {
  MintLogEntity,
  TokenIdEntity,
  TransactionEntity,
} from '../../../entities';
import { getNamespace } from 'cls-hooked';
import { RequestContext } from '../../../commom/context/request.context';
import { Tx } from '@xpla/xpla.js/dist/core';
import { SequenceUtil } from '../../../util/sequence.util';
import { MetadataV1Service } from '../../../metadata-api/v1/metadata-v1.service';
import {
  MintException,
  MintHttpStatus,
} from '../../../exception/mint.exception';
import { GameCategory, GameServerApiCode } from '../../../enum/game-api.enum';
import { MintType, TxStatus, TxType } from '../../../enum';
import { txDecoding, txEncoding } from '../../../util/encoding';
import BigNumber from 'bignumber.js';
import { TransactionRepository } from '../repository/transaction.repository';

const Diff = require('diff');

@Injectable()
export class V1MintService {
  private bcClient = this.blockchainService.blockChainClient().client;
  private lcdClient = this.blockchainService.lcdClient();
  private CATEGORY_MINT_TYPE = new Map(
    Object.entries({
      item: GameCategory.MINT_ITEM,
      items: GameCategory.MINT_ITEMS,
      character: GameCategory.MINT_CHARACTER,
    }),
  );
  private MINT_API_TYPE = new Map(
    Object.entries({
      item: GameServerApiCode.MINT_ITEM_LIST,
      character: GameServerApiCode.MINT_CHARACTER_LIST,
      mint: GameServerApiCode.MINT,
      lock: GameServerApiCode.LOCK_NFT,
      // lock: GameServerApiCode.LOCK_CHARACTER_NFT,
    }),
  );
  private readonly BC_DECIMAL = Number(this.configService.get('BC_DECIMAL'));
  private readonly BC_GAME_DECIMAL = Number(
    this.configService.get('BC_GAME_DECIMAL'),
  );

  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
    private sequenceUtil: SequenceUtil,
    private axiosClient: AxiosClientUtil,
    private configService: ConfigService,
    private readonly blockchainService: BlockchainService,
    private readonly cw20Service: CW20Service,
    private readonly cw721Service: CW721Service,
    private readonly lockService: LockService,
    private readonly metadataV1Service: MetadataV1Service,
    private commonService: CommonService,
    private assetV1Service: AssetV1Service,
    private readonly mintRepo: MintRepository,
    private readonly txRepo: TransactionRepository,
  ) {}

  async confirmItems(
    reqDto: any,
  ): Promise<GameApiV1ResponseValidItemDto> {

    const requestId = getNamespace(RequestContext.NAMESPACE).get(
      RequestContext.REQUEST_ID,
    );

    try {
      const gameServerData = await this.gameServerData(reqDto.appId);
      const gameServerApi = gameServerData.apiLists.filter(
        (item) => item.apiTypeCd === GameServerApiCode.MINT_CONFIRM,
      )[0];

      const mintingData = await this.calculateMintingFee(reqDto, gameServerData);

      // call game server to confirm items
      const queryString =
          `?cid=${reqDto.characterId}
          &type=${reqDto.mintType}
          &items=${mintingData.items.join()}
          &tokenId=${mintingData.tokens.join()}`;
      const confirmedItem = await this.axiosClient.get(
        gameServerApi.apiUrl + queryString,
        {
          appid: reqDto.appId,
          server: reqDto.server,
          pid: reqDto.playerId,
        },
      );
      if (!(confirmedItem.status === 200 || confirmedItem.status === 201)) {
        throw new GameApiException(
          'failed to respond on game server',
          '',
          GameApiHttpStatus.EXTERNAL_SERVER_ERROR,
        );
      }

      await this.mintRepo.registerMintLog(<MintLogEntity>{
        requestId: requestId,
        mintType: reqDto.mintType,
        playerId: reqDto.playerId,
        server: reqDto.server.join(),
        accAddress: reqDto.accAddress,
        appId: reqDto.appId,
        id: confirmedItem.body.data.uniqueId,
        metadata: confirmedItem.body.data.extension,
        serviceFee: mintingData.serviceFee,
        gameFee: mintingData.gameFee,
      });

      return <GameApiV1ResponseValidItemDto>{
        serviceFee: mintingData.serviceFee,
        gameFee: mintingData.gameFee,
        metadata: confirmedItem.body.data.extension,
        requestId: requestId,
        id: confirmedItem.body.data.uniqueId,
      };
    } catch (e) {
      throw new MintException(
        e.message,
        e.stack,
        MintHttpStatus.VALIDATION_FAILED,
      );
    }
  }

  private async calculateMintingFee(
    reqDto: GameApiV1ValidItemDto,
    gameServer: any,
  ): Promise<GameApiV1CalculateMintingDataDto> {
    const tokenData = reqDto.tokens ?? false;
    const itemData = reqDto.items ?? false;

    // fixme: 조건 정리
    //  1.token or item
    //  2.item: one item or one token
    //  3.character: one item or one token
    //  4.items: items or tokens
    if (!tokenData && !itemData) {
      throw new GameApiException(
        'token or item is required.',
        '',
        GameApiHttpStatus.BAD_REQUEST,
      );
    } else if (tokenData && itemData) {
      if (reqDto.mintType !== 'items') {
        throw new GameApiException(
          'token and item requested!',
          '',
          GameApiHttpStatus.BAD_REQUEST,
        );
      }
    } else if (tokenData && reqDto.mintType !== 'items') {
      if (tokenData.length > 1) {
        throw new GameApiException(
          'more than one token requested!',
          '',
          GameApiHttpStatus.BAD_REQUEST,
        );
      }
    } else if (itemData && reqDto.mintType !== 'items') {
      if (itemData.length > 1) {
        throw new GameApiException(
          'more than one item requested!',
          '',
          GameApiHttpStatus.BAD_REQUEST,
        );
      }
    }

    let requestedItems = [];
    if (itemData && itemData.length > 0) {
      reqDto.items.forEach((i) => {
        requestedItems.push(i.uniqueId)
      })
    }
    // validate locked nft
    let requestedTokens = [];
    if (tokenData && tokenData.length > 0) {
      reqDto.tokens.forEach((t) => {
        requestedTokens.push(t.tokenId);
      });
      const lockedNft = await this.validateLockNft(
        gameServer.nftContract,
          reqDto.accAddress,
        requestedTokens,
      );
      if (lockedNft) {
        throw new MintException(
          'requested token is already existed!',
          '',
          MintHttpStatus.NFT_EXISTED,
        );
      }
    }

    // get active category from betagame
    const category =
      gameServer.categoryLists.filter(
        (item) =>
          item.mintTypeCd ===
            this.CATEGORY_MINT_TYPE.get(reqDto.mintType) &&
          item.activeTypeCd === GameCategory.ACTIVE,
      )[0] ?? false;
    if (!category) {
      throw new GameApiException(
        `category not found`,
        '',
        GameApiHttpStatus.NOT_FOUND,
      );
    }

    // calculate fee
    let serviceFee = new BigNumber(0);
    let gameFee = new BigNumber(0);
    const digits = BigNumber(10 ** this.BC_DECIMAL);
    switch (reqDto.mintType) {
      case 'item' || 'character':
        serviceFee = BigNumber(category.feeInfo[0].xplaFee).times(digits);
        gameFee = BigNumber(category.feeInfo[0].gameTokenFee).times(digits);
        break;
      case 'items':
        const feeLIst = category.feeInfo;

        if (itemData && itemData.length > 0) {
          reqDto.items.forEach(function (gameItem) {
            const mintingFee = feeLIst.filter(
              (feeInfo) => feeInfo.mintCount === gameItem.mintingFeeCode,
            )[0];

            serviceFee = BigNumber(mintingFee.xplaFee)
              .times(digits)
              .plus(serviceFee);
            gameFee = BigNumber(mintingFee.gameTokenFee)
              .times(digits)
              .plus(gameFee);
          });
        }

        if (tokenData && tokenData.length > 0) {
          reqDto.tokens.forEach(function (gameItem) {
            const mintingFee = feeLIst.filter(
              (feeInfo) => feeInfo.mintCount === gameItem.mintingFeeCode,
            )[0];

            serviceFee = BigNumber(mintingFee.xplaFee)
              .times(digits)
              .plus(serviceFee);
            gameFee = BigNumber(mintingFee.gameTokenFee)
              .times(digits)
              .plus(gameFee);
          });
        }
        break;
    }

    const userTokenBalance = await this.bcClient.getBalance(
        reqDto.accAddress,
    );
    if (userTokenBalance < serviceFee.div(digits)) {
      throw new MintException(
        'user token balance is insufficient.',
        '',
        MintHttpStatus.NOT_ENOUGH_TOKEN,
      );
    }

    const userGameTokenBalance = await this.bcClient.getBalance(
        reqDto.accAddress,
    );
    if (userGameTokenBalance < gameFee.div(digits)) {
      throw new MintException(
        'game token balance is insufficient.',
        '',
        MintHttpStatus.NOT_ENOUGH_TOKEN,
      );
    }

    return <GameApiV1CalculateMintingDataDto>{
      items: requestedItems,
      tokens: requestedTokens,
      serviceFee: serviceFee.div(digits).toFixed(this.BC_DECIMAL),
      gameFee: gameFee.div(digits).toFixed(this.BC_DECIMAL),
    };
  }

  async mintNft(reqDto: any): Promise<GameApiV1ResponseMintDto> {
    const requestId = getNamespace(RequestContext.NAMESPACE).get(
      RequestContext.REQUEST_ID,
    );

    try {
      // todo: burn and mint
      //   tokenId exists?
      const gameServerData = await this.gameServerData(reqDto.appId);

      const gameServerApi = gameServerData.apiLists.filter(
        (item) => item.apiTypeCd === this.MINT_API_TYPE.get('mint'),
      )[0];

      // todo: 시간확인 필요? ,redis로 변경
      const mintLog = await this.mintRepo.getMintLogByRequestId(
        reqDto.requestId,
      );

      let serviceFee;
      let gameFee;
      if (mintLog !== null || mintLog !== undefined) {
        const diff = Diff.diffJson(
            {
              appId: reqDto.appId,
              playerId: String(reqDto.playerId),
              accAddress: reqDto.accAddress,
              mintType: reqDto.mintType,
              requestId: reqDto.requestId,
              id: reqDto.id,
              serviceFee: reqDto.serviceFee,
              gameFee: reqDto.gameFee,
              meatadata: reqDto.metadata,
            },
            {
              appId: mintLog.appId,
              playerId: String(mintLog.playerId),
              accAddress: mintLog.accAddress,
              mintType: mintLog.mintType,
              requestId: mintLog.requestId,
              id: mintLog.id,
              serviceFee: String(mintLog.serviceFee),
              gameFee: String(mintLog.gameFee),
              meatadata: mintLog.metadata,
            },
            '',
        )
        this.logger.debug(`diff minting ingo: ${diff}`)
        if (
            diff.len > 1
        ) {
          throw new GameApiException(
            'requested data mismatched with confirmed data',
            '',
            GameApiHttpStatus.BAD_REQUEST,
          );
        }
        serviceFee = reqDto.serviceFee;
        gameFee = reqDto.gameFee;
      } else {
        throw new GameApiException(
          'need to confirm item before minting',
          '',
          GameApiHttpStatus.BAD_REQUEST,
        );
      }
      // else {
      //   const mintingFee = await this.calculateMintingFee(
      //     gameApiV1MintDto,
      //     betagame,
      //   );
      //   c2xFee = mintingFee.serviceFee;
      //   tokenFee = mintingFee.gameFee;
      // }

      // todo: call game server for updating game info
      const updatedGameRes = await this.axiosClient.post(gameServerApi.apiUrl, {
        // playerId: reqDto.playerId,
        // server: reqDto.server,
        requestId: reqDto.requestId,
        characterId: reqDto.characterId,
        tokenId: reqDto.id,
        // mintType: reqDto.mintType,
      },{
          appid: reqDto.appId,
          server: reqDto.server,
          pid: reqDto.playerId,
      });

      if (!(updatedGameRes.status === 200 || updatedGameRes.status === 201)) {
        throw new GameApiException(
          'failed to respond on game server to update game item',
          '',
          GameApiHttpStatus.EXTERNAL_SERVER_ERROR,
        );
      }

      // todo: get minter from hsm
      const minter = {
        address: 'xpla1my0sjrk4aysgqd42gre4m7ktmf20law6462h45',
        mnemonic:
          'hungry reward borrow menu puzzle frost grief escape long angle heart effort fiction maple quiz exact vault future valley sniff indicate million turtle brave',
      };

      // todo: create a token id
      //   if provider have more than two nft contracts
      let tokenId = reqDto.id;
      if (tokenId === '') {
        tokenId = String(
          await this.mintRepo.getNftId(<TokenIdEntity>{
            nftAddress: gameServerData.nftContract,
            appId: reqDto.appId,
          }),
        );
      }

      const uploadedImage = await this.assetV1Service.uploadImageByUrl({
        url: reqDto.metadata.image,
      });

      reqDto.metadata.image = uploadedImage.uri;
      reqDto.metadata.attributes.push({
        trait_type: 'thumbnailUri',
        value: uploadedImage.thumbnailUri,
      });
      const uploadedMetadata = await this.metadataV1Service.uploadMetadata(
        reqDto.metadata,
      );

      // xpla
      const digits = BigNumber(10 ** this.BC_DECIMAL);
      const gameProviderAddress = gameServerData.gameProviderAddress;
      const gameProviderC2xAmount = BigNumber(serviceFee)
        .times(digits)
        .times(0.5);
      const gameProviderC2xExe = await this.commonService.transferCoin(
        reqDto.accAddress,
        gameProviderAddress,
        String(gameProviderC2xAmount),
        'axpla',
      );

      const treasuryAddress = gameServerData.treasuryAddress;
      const treasuryC2xAmount = BigNumber(serviceFee).times(digits).times(0.16);
      const treasuryC2xExe = await this.commonService.transferCoin(
        reqDto.accAddress,
        treasuryAddress,
        String(treasuryC2xAmount),
        'axpla',
      );

      const serverAddress = gameServerData.serverAddress;
      const serverC2xAmount = BigNumber(serviceFee).times(digits).times(0.04);
      const serverC2xExe = await this.commonService.transferCoin(
        reqDto.accAddress,
        serverAddress,
        String(serverC2xAmount),
        'axpla',
      );

      const c2xHolderAddress = gameServerData.xplaHolderAddress;
      const c2XHolderC2xAmount = BigNumber(serviceFee).times(digits).times(0.3);
      const c2XHolderC2xExe = await this.commonService.transferCoin(
        reqDto.accAddress,
        c2xHolderAddress,
        String(c2XHolderC2xAmount),
        'axpla',
      );

      // token
      const game_digits = BigNumber(10 ** this.BC_GAME_DECIMAL);
      const gameTokenContractAddress = gameServerData.gameTokenContract;
      const minterAddress = minter.address;
      const minterTokenAmount = BigNumber(gameFee)
        .times(game_digits)
        .times(0.5);
      const minterTokenExe = await this.cw20Service.transferToken(
        gameTokenContractAddress,
        reqDto.accAddress,
        minterAddress,
        String(minterTokenAmount),
      );

      const treasuryTokenAmount = BigNumber(gameFee)
        .times(game_digits)
        .times(0.16);
      const treasuryTokenExe = await this.cw20Service.transferToken(
        gameTokenContractAddress,
        reqDto.accAddress,
        treasuryAddress,
        String(treasuryTokenAmount),
      );

      const serverTokenAmount = BigNumber(gameFee)
        .times(game_digits)
        .times(0.04);
      const serverTokenExe = await this.cw20Service.transferToken(
        gameTokenContractAddress,
        reqDto.accAddress,
        serverAddress,
        String(serverTokenAmount),
      );

      const fanHolderAddress = gameServerData.fanHolderAddress;
      const fanHolderAmount = BigNumber(gameFee).times(game_digits).times(0.3);
      const fanHolderTokenExe = await this.cw20Service.transferToken(
        gameTokenContractAddress,
        reqDto.accAddress,
        fanHolderAddress,
        String(fanHolderAmount),
      );

      const nftContractAddress = gameServerData.nftContract;
      const mintingExe = await this.cw721Service.mint(
        minterAddress,
        nftContractAddress,
        reqDto.accAddress,
        tokenId,
        uploadedMetadata.url,
        uploadedMetadata.extension,
      );

      // fixme: test code
      const signer = [
        {
          address: minterAddress,
        },
        {
          address: reqDto.accAddress,
        },
      ];

      const unSignedTx: Tx = await this.commonService.makeTx(signer, [
        mintingExe,
        gameProviderC2xExe,
        treasuryC2xExe,
        serverC2xExe,
        c2XHolderC2xExe,
        minterTokenExe,
        treasuryTokenExe,
        serverTokenExe,
        fanHolderTokenExe,
      ]);

      const wallet = this.bcClient.wallet(minter.mnemonic);
      const signTxByMinter = await this.commonService.sign(
        wallet,
        unSignedTx,
      );

      const encodedUnSignedTx = txEncoding(signTxByMinter);

      await this.txRepo.saveTx(<TransactionEntity>{
        requestId: requestId,
        senderAddress: reqDto.accAddress,
        contractAddress: gameServerData.nftContract,
        txHash: null,
        tx: encodedUnSignedTx,
        params: JSON.stringify(reqDto),
        txType: TxType.MINT,
        appId: reqDto.appId,
        playerId: reqDto.playerId,
        status: TxStatus.WAIT,
        message: '',
      });

      return <GameApiV1ResponseMintDto>{
        tokenId: tokenId,
        unsignedTx: encodedUnSignedTx,
        payerAddress: minter.address,
        tokenUri: uploadedMetadata.url,
      };
    } catch (e) {
      this.logger.error(e);
      throw new MintException(
        e.message,
        e.stack,
        MintHttpStatus.MINTING_FAILED,
      );
    }
  }

  async items(reqDto: any): Promise<GameApiV1ResMintItemDto> {
    try {
      const gameServerData = await this.gameServerData(reqDto.appId);

      // fixme : category active
      const gameServerApi = gameServerData.apiLists.filter(
        (item) => item.apiTypeCd === this.MINT_API_TYPE.get(reqDto.mintType),
      )[0];

      // todo: check prams to request
      const queryString = `?characterId=${reqDto.characterId}&categoryId=${reqDto.categoryId}&categoryType=${reqDto.categoryType}`;
      const gameItems = await this.axiosClient.get(gameServerApi.apiUrl+queryString,
{
        appid: reqDto.appId,
        server: reqDto.server.join(),
        pid: reqDto.playerId,
      });
      if (!(gameItems.status === 200 || gameItems.status === 201)) {
        throw new GameApiException(
          'failed to respond on game server to get game item',
          '',
          GameApiHttpStatus.BAD_REQUEST,
        );
      }

      let items = [];
      let characters = [];
      if (reqDto.mintType === MintType.ITEM) {
        items = gameItems.body.data;
      } else {
        characters = gameItems.body.data;
      }

      return <GameApiV1ResMintItemDto>{
        items: items,
        characters: characters,
      };
    } catch (e) {
      throw new MintException(
        e.message,
        e.stack,
        MintHttpStatus.ITEM_NOT_FOUND,
      );
    }
  }

  async burnNft(
    reqDto: any,
  ): Promise<GameApiV1BurnItemResDto> {
    const requestId = getNamespace(RequestContext.NAMESPACE).get(
      RequestContext.REQUEST_ID,
    );

    try {
      const gameServerData = await this.gameServerData(reqDto.appId);
      const lockedNft = await this.validateLockNft(
        gameServerData.nftContract,
        reqDto.accAddress,
        [reqDto.tokenId],
      );
      if (lockedNft) {
        throw new MintException(
          'requested token is locked!',
          '',
          MintHttpStatus.NFT_NOT_EXISTED,
        );
      }

      // todo: nft exists?
      const gameServerApi = gameServerData.apiLists.filter(
        (item) => item.apiTypeCd === this.MINT_API_TYPE.get('lock'),
      )[0];
      const updatedGameItem = await this.axiosClient.patch(
        gameServerApi.apiUrl,
        {
          requestId: requestId,
          characterId: reqDto.characterId,
          tokenId: reqDto.tokenId,
        },{
          appid: reqDto.appId,
          server: reqDto.server,
          pid: reqDto.playerId,
        }
      );

      if (!(updatedGameItem.status === 200 || updatedGameItem.status === 201)) {
        throw new GameApiException(
          'failed to respond on game server to update game item',
          '',
          GameApiHttpStatus.BAD_REQUEST,
        );
      }

      const msg = await this.cw721Service.burn(
        reqDto.accAddress,
        gameServerData.nftContract,
        reqDto.tokenId,
      );

      const signer = [{ address: reqDto.accAddress }];
      const unSignedTx = await this.commonService.makeTx(signer, [msg]);
      const encodedUnSignedTx = txEncoding(unSignedTx);

      await this.txRepo.saveTx(<TransactionEntity>{
        requestId: requestId,
        senderAddress: reqDto.accAddress,
        contractAddress: gameServerData.nftContract,
        tx: encodedUnSignedTx,
        params: JSON.stringify(reqDto),
        txType: TxType.MINT,
        appId: reqDto.appId,
        playerId: reqDto.playerId,
        status: TxStatus.WAIT,
      });

      return <GameApiV1BurnItemResDto>{
        unsignedTx: encodedUnSignedTx,
        requestId: requestId,
      };
    } catch (e) {
      this.logger.error(e);
      throw new MintException(e.message, e.stack, MintHttpStatus.BURN_FAILED);
    }
  }

  private async gameServerData(appId: string): Promise<any> {
    const gameServerData = await this.axiosClient.get(
      this.configService.get('BG_DETAIL_GAME_INFO').replace('{APP_ID}', appId),
    );
    if (gameServerData.status !== 200) {
      throw new GameApiException(
        'failed to respond on console server',
        '',
        GameApiHttpStatus.EXTERNAL_SERVER_ERROR,
      );
    }
    if (gameServerData.body.code === 404) {
      throw new GameApiException(
        'betagame not found',
        '',
        GameApiHttpStatus.NOT_FOUND,
      );
    }
    return gameServerData.body.data;
  }

  private async validateLockNft(
    nftContract: string,
    accAddress: string,
    tokens: string[],
  ): Promise<boolean> {
    const lockedNft =
      (await this.lockService.lockNftList(nftContract, accAddress)) ?? false;
    let matchedToken = [];
    if (lockedNft && lockedNft.length > 0) {
      matchedToken = tokens.filter((t) => lockedNft.tokens.includes(t));
    }
    this.logger.debug(lockedNft);
    this.logger.debug(matchedToken);
    if (matchedToken.length > 0) {
      return true;
    } else {
      return false;
    }
  }

  async testNft(testDto: TestDto): Promise<string> {
    const user = {
      address: testDto.address,
      mnemonic: testDto.mnemonic,
    };

    const encodedUnSignedTx = txDecoding(testDto.unsignedTx);

    const wallet = this.bcClient.wallet(user.mnemonic);

    console.log('seq >>>>>>>>', await wallet.sequence());

    const signTx = await this.commonService.sign(
      wallet,
      encodedUnSignedTx,
      // await wallet.sequence(),
    );
    const txHash = await this.commonService.broadcast(signTx);
    // return txEncoding(signTx);
    return txHash;
  }

  async testTransfer(): Promise<string> {
    const msg = await this.cw20Service.transferToken(
        'xpla1drrlzr6d44f9gm9u45h8td6y7scqcl9e853xvxzdc2mpfzjaqprsehpjd6',
        'xpla1my0sjrk4aysgqd42gre4m7ktmf20law6462h45',
        'xpla1h086yrxdzhgqzftk2hzcgst9gywttqd2d32g6q',
        '10000000000')

    const signer = [
      {
        address: 'xpla1my0sjrk4aysgqd42gre4m7ktmf20law6462h45',
      }
      ]
    const unSignedTx: Tx = await this.commonService.makeTx(
        signer, [msg]
    )

    const mnemonic = 'hungry reward borrow menu puzzle frost grief escape long angle heart effort fiction maple quiz exact vault future valley sniff indicate million turtle brave'
    const wallet = this.bcClient.wallet(mnemonic);

    const signTxByMinter = await this.commonService.sign(
        wallet,
        unSignedTx,
    );

    const txHash = await this.commonService.broadcast(signTxByMinter);

    return txHash;
  }

}
