import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  GameApiV1CalculateMintingFeeDto,
  GameApiV1MintDto,
  GameApiV1MintItemDto, GameApiV1ResMintItemDto,
  GameApiV1ResponseMintDto,
  GameApiV1ResponseValidItemDto,
  GameApiV1ValidItemDto,
} from '../dto/game-api-v1-mint.dto';
import { ConfigService } from '@nestjs/config';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { BlockchainService } from '../../../bc-core/blockchain/blockchain.service';
import {
  betagameInfoApi,
  getMinterKey,
  updateGameServerForMintingApi,
} from '../game-api.mock';
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
import { Fee, SimplePublicKey } from '@xpla/xpla.js';
import { CommonService } from '../../../bc-core/modules/common.service';
import {
  ConvertPoolEntity,
  MintLogEntity,
  NonFungibleTokenEntity,
} from '../../../entities';
import { getNamespace } from 'cls-hooked';
import { RequestContext } from '../../../commom/context/request.context';
import { compareObject } from '../../../util/common.util';
import { GameApiV1BroadcastDto } from '../dto/game-api-v1-broadcast.dto';
import { Tx as Tx_pb } from '@terra-money/terra.proto/cosmos/tx/v1beta1/tx';
import { Tx } from '@xpla/xpla.js/dist/core';
import { SequenceUtil } from '../../../util/sequence.util';
import { MetadataV1Service } from '../../../metadata-api/v1/metadata-v1.service';
import {
  MintException,
  MintHttpStatus,
} from '../../../exception/mint.exception';
import { GameCategory, GameServerApiCode } from '../../../enum/game-api.enum';
import { MintType } from '../../../enum';


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

  private MINT_LIST_API_TYPE = new Map(
      Object.entries({
        item: GameServerApiCode.MINT_ITEM_LIST,
        character: GameServerApiCode.MINT_CHARACTER_LIST,
      }),
  );

  constructor(
    private configService: ConfigService,
    private readonly blockchainService: BlockchainService,
    @InjectRepository(ConvertPoolEntity)
    private readonly usersRepository: Repository<ConvertPoolEntity>,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
    private readonly cw20Service: CW20Service,
    private readonly cw721Service: CW721Service,
    private readonly lockService: LockService,
    private axiosClient: AxiosClientUtil,
    private assetV1Service: AssetV1Service,
    private readonly metadataV1Service: MetadataV1Service,
    private readonly gameApiRepository: MintRepository,
    private commonService: CommonService,
    private sequenceUtil: SequenceUtil,
  ) {}

  async confirmItems(
    gameApiV1ValidItemDto: GameApiV1ValidItemDto,
  ): Promise<GameApiV1ResponseValidItemDto> {
    const requestId = getNamespace(RequestContext.NAMESPACE).get(
      RequestContext.CORRELATION_ID,
    );

    try {
      const gameServerData = await this.gameServerData(gameApiV1ValidItemDto);

      // fixme: use apiLists
      // replyForMint = gameServerInfo.body.data.apiLists.filter(
      //   (item) => item.apiTypeCd === ApiTypeCode.NOTI_OF_COMPLETION_FOR_MINT,
      // )[0];
      const gameServerApi = gameServerData.apiTestLists.filter(
        (item) => item.apiTypeCd === GameServerApiCode.CONFIRM_MINTING,
      )[0];

      const mintingFee = await this.calculateMintingFee(
        gameApiV1ValidItemDto,
        gameServerData,
      );

      // call game server to confirm items
      const confirmedItem = await this.axiosClient.post(
        gameServerApi.apiUrl,
        {
          playerId: gameApiV1ValidItemDto.playerId,
          server: gameApiV1ValidItemDto.server,
          selectedCid: gameApiV1ValidItemDto.selectedCid,
          items: gameApiV1ValidItemDto.items,
        },
        {
          correlationId: requestId,
        },
      );
      if (!(confirmedItem.status === 200 || confirmedItem.status === 201)) {
        throw new GameApiException(
          'bad request',
          '',
          GameApiHttpStatus.BAD_REQUEST,
        );
      }

      await this.gameApiRepository.registerMintLog(<MintLogEntity>{
        requestId: requestId,
        mintType: gameApiV1ValidItemDto.mintType,
        playerId: gameApiV1ValidItemDto.playerId,
        server: gameApiV1ValidItemDto.server.join(),
        accAddress: gameApiV1ValidItemDto.accAddress,
        appId: gameApiV1ValidItemDto.appId,
        goodsId: confirmedItem.body.data.uniqueId,
        serviceFee: mintingFee.serviceFee,
        gameFee: mintingFee.gameFee,
      });

      return <GameApiV1ResponseValidItemDto>{
        serviceFee: mintingFee.serviceFee,
        gameFee: mintingFee.gameFee,
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
    gameApiV1ValidItemDto: GameApiV1ValidItemDto,
    gameServer: any,
  ): Promise<GameApiV1CalculateMintingFeeDto> {
    if (
      gameApiV1ValidItemDto.tokens !== undefined ||
      gameApiV1ValidItemDto.tokens.length > 0
    ) {
      // const lockedNft = await this.lockService.lockNftList(
      //   gameServer.nftContract,
      //   gameApiV1ValidItemDto.accAddress,
      // );
      // let unmatchedToken = [];
      // if (lockedNft !== undefined) {
      //   unmatchedToken = gameApiV1ValidItemDto.tokens.filter(
      //     (token) => !lockedNft.tokens.includes(token.tokenId),
      //   );
      // }
      // this.logger.debug(lockedNft);
      // this.logger.debug(unmatchedToken);
      // if (unmatchedToken.length > 0) {
      //   throw new GameApiException(
      //     'token id mismatched',
      //     '',
      //     GameApiHttpStatus.BAD_REQUEST,
      //   );
      // }
    }

    // active category from betagame
    const category = gameServer.categoryLists.filter(
      (item) =>
        item.mintTypeCd ===
          this.CATEGORY_MINT_TYPE.get(gameApiV1ValidItemDto.mintType) &&
        // todo: active? 리스트에서 비노출?
        item.activeTypeCd === GameCategory.ACTIVE,
    )[0];

    // todo: calculate minting fee
    //      call betagame to get fee info
    let serviceFee: number = 0;
    let gameFee: number = 0;
    switch (gameApiV1ValidItemDto.mintType) {
      case MintType.ITEM || MintType.CHARACTER:
        serviceFee = Number(category.feeInfo.xplaFee);
        gameFee = Number(category.feeInfo.gameTokenFee);
        break;
      case 'items':
        break;
    }

    // todo: get fee by fee code from betagame
    // await gameApiV1MintDto.items.forEach(function (item) {
    // })
    // await gameApiV1MintDto.tokens.forEach(function (item) {
    // })

    const userTokenBalance = 12;
    // await this.bcClient.getBalance(
    //   gameApiV1ValidItemDto.accAddress,
    // );
    if (userTokenBalance < serviceFee) {
      throw new GameApiException(
        'user token balance is insufficient.',
        '',
        GameApiHttpStatus.BAD_REQUEST,
      );
    }

    const userGameTokenBalance = 12;
    //     await this.bcClient.getBalance(
    //   gameApiV1ValidItemDto.accAddress,
    // );
    if (userGameTokenBalance < gameFee) {
      throw new GameApiException(
        'game token balance is insufficient.',
        '',
        GameApiHttpStatus.BAD_REQUEST,
      );
    }

    return <GameApiV1CalculateMintingFeeDto>{
      serviceFee: serviceFee,
      gameFee: gameFee,
    };
  }

  async mintNft(
    gameApiV1MintDto: GameApiV1MintDto,
  ): Promise<GameApiV1ResponseMintDto> {
    try {

      const gameServerData = await this.gameServerData(gameApiV1MintDto);

      // fixme: use apiLists
      // replyForMint = gameServerInfo.body.data.apiLists.filter(
      //   (item) => item.apiTypeCd === ApiTypeCode.NOTI_OF_COMPLETION_FOR_MINT,
      // )[0];
      const gameServerApi = gameServerData.apiTestLists.filter(
          (item) => item.apiTypeCd === this.MINT_LIST_API_TYPE.get(gameApiV1MintDto.mintType),
      )[0];


      // // todo: call betagame api for api url
      // // const betagameInfo = await this.axiosClient.get('/v1/')
      const betagame = betagameInfoApi(gameApiV1MintDto.appId);
      // fixme: redis로 변경
      // todo: 시간확인 필요?
      const mintLog = await this.gameApiRepository.getMintLogByRequestId(
        gameApiV1MintDto.requestId,
      );

      let c2xFee;
      let tokenFee;
      if (mintLog !== null || mintLog !== undefined) {
        if (
          !compareObject(
            {
              appId: gameApiV1MintDto.appId,
              playerId: String(gameApiV1MintDto.playerId),
              accAddress: gameApiV1MintDto.accAddress,
              mintType: gameApiV1MintDto.mintType,
              requestId: gameApiV1MintDto.requestId,
              goodsId: gameApiV1MintDto.id,
              ctxFee: String(gameApiV1MintDto.ctxFee),
              tokenFee: String(gameApiV1MintDto.tokenFee),
            },
            {
              appId: mintLog.appId,
              playerId: String(mintLog.playerId),
              accAddress: mintLog.accAddress,
              mintType: mintLog.mintType,
              requestId: mintLog.requestId,
              goodsId: mintLog.goodsId,
              ctxFee: String(mintLog.serviceFee),
              tokenFee: String(mintLog.gameFee),
            },
          )
        ) {
          throw new GameApiException(
            'error occurred while comparing minting items',
            '',
            GameApiHttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
        c2xFee = gameApiV1MintDto.ctxFee;
        tokenFee = gameApiV1MintDto.tokenFee;
      } else {
        const mintingFee = await this.calculateMintingFee(
          gameApiV1MintDto,
          betagame,
        );
        c2xFee = mintingFee.serviceFee;
        tokenFee = mintingFee.gameFee;
      }

      // todo: call game server for updating game info
      // const updatedGameRes = await this.axiosClient.post('http://localhost:7423/v1/game/game-code/user/user-id/item/item-code/mint',{
      //     gameId: '',
      //     serverId: '',
      //     channelId: '',
      //     characterId: '',
      //     tokenId: '',
      //     itemId: ''
      // })
      const updatedGameRes = updateGameServerForMintingApi({
        gameId: '',
        serverId: '',
        channelId: '',
        characterId: '',
        categoryCode: '',
        tokenId: '',
        itemId: '',
      });

      // todo: get minter from hsm
      const minter = await getMinterKey();

      // todo: create a token id
      const tokenId = String(
        await this.gameApiRepository.getNftId(<NonFungibleTokenEntity>{
          gameIndex: gameApiV1MintDto.gameIndex,
          accAddress: gameApiV1MintDto.accAddress,
          playerId: gameApiV1MintDto.playerId,
        }),
      );

      if (updatedGameRes.code !== 200) {
        throw new GameApiException(
          'error occurred while updating item status for minting.',
          '',
          GameApiHttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const uploadedImage = await this.assetV1Service.uploadImageByUrl({
        url: gameApiV1MintDto.metadata.image,
      });

      gameApiV1MintDto.metadata.image = uploadedImage.uri;
      gameApiV1MintDto.metadata.attributes.push({ trait_type: '', value: '' });
      const uploadedMetadata = await this.metadataV1Service.uploadMetadata(
        gameApiV1MintDto.metadata,
      );

      // C2X
      // todo: create tx
      //  gameProvider, token contract required (if the token contract is the governance token)
      const c2xContractAddress = '';
      const gameProviderAddress = betagame.data.gameProviderAddress;
      const gameProviderC2xAmount = String(Math.round(c2xFee * 0.5));
      const gameProviderC2xExe = await this.cw20Service.transferToken(
        c2xContractAddress,
        gameApiV1MintDto.accAddress,
        gameProviderAddress,
        gameProviderC2xAmount,
      );

      const treasuryAddress = betagame.data.treasuryAddress;
      const treasuryC2xAmount = String(Math.round(c2xFee * 0.16));
      const treasuryC2xExe = await this.cw20Service.transferToken(
        c2xContractAddress,
        gameApiV1MintDto.accAddress,
        treasuryAddress,
        treasuryC2xAmount,
      );

      const serverAddress = betagame.data.serverAddress;
      const serverC2xAmount = String(Math.round(c2xFee * 0.04));
      const serverC2xExe = await this.cw20Service.transferToken(
        c2xContractAddress,
        gameApiV1MintDto.accAddress,
        serverAddress,
        serverC2xAmount,
      );

      const c2xHolderAddress = betagame.data.c2xHolderAddress;
      const c2XHolderC2xAmount = String(Math.round(c2xFee * 0.3));
      const c2XHolderC2xExe = await this.cw20Service.transferToken(
        c2xContractAddress,
        gameApiV1MintDto.accAddress,
        c2xHolderAddress,
        c2XHolderC2xAmount,
      );

      // token
      const gameTokenContractAddress = betagame.data.gameTokenCa;
      const minterAddress = minter.accAddress;
      const minterTokenAmount = String(Math.round(tokenFee * 0.5));
      const minterTokenExe = await this.cw20Service.transferToken(
        gameTokenContractAddress,
        gameApiV1MintDto.accAddress,
        minterAddress,
        minterTokenAmount,
      );

      // const treasuryAddress = '';
      const treasuryTokenAmount = String(Math.round(tokenFee * 0.16));
      const treasuryTokenExe = await this.cw20Service.transferToken(
        gameTokenContractAddress,
        gameApiV1MintDto.accAddress,
        treasuryAddress,
        treasuryTokenAmount,
      );

      // const serverAddress = '';
      const serverTokenAmount = String(Math.round(tokenFee * 0.04));
      const serverTokenExe = await this.cw20Service.transferToken(
        gameTokenContractAddress,
        gameApiV1MintDto.accAddress,
        serverAddress,
        serverTokenAmount,
      );

      const fanHolderAddress = betagame.data.fanHolderAddress;
      const fanHolderAmount = String(Math.round(tokenFee * 0.3));
      const fanHolderTokenExe = await this.cw20Service.transferToken(
        gameTokenContractAddress,
        gameApiV1MintDto.accAddress,
        fanHolderAddress,
        fanHolderAmount,
      );

      // todo  set tokenId, tokenUrl, extension
      const nftContractAddress = betagame.data.nftCa;
      const mintingExe = await this.cw721Service.mint(
        minterAddress,
        nftContractAddress,
        gameApiV1MintDto.accAddress,
        tokenId,
        '',
        {},
      );

      // todo set memo
      const memo = String(tokenId) + '-' + gameApiV1MintDto.appId + '-nft';

      // todo: broadcast 시 minter sequence number를 조회하는데 여기서 sequence가 필요한가?
      const minterSequenceNumber = await this.sequenceUtil.getSequenceNumber(
        minterAddress,
      );

      const user = await this.bcClient.account(gameApiV1MintDto.accAddress);

      const mintringFee = await this.lcdClient.tx.estimateFee(
        [
          {
            sequenceNumber: user.sequenceNumber,
            publicKey: new SimplePublicKey(user.publicKey),
          },
          { sequenceNumber: minterSequenceNumber, publicKey: minter.publicKey },
        ],
        {
          msgs: [
            gameProviderC2xExe,
            treasuryC2xExe,
            serverC2xExe,
            c2XHolderC2xExe,
            minterTokenExe,
            treasuryTokenExe,
            serverTokenExe,
            fanHolderTokenExe,
            mintingExe,
          ],
          memo: memo,
          gasAdjustment: 1.3,
        },
      );
      mintringFee.payer = minter.accAddress;

      const fee = new Fee(
        mintringFee.gas_limit,
        mintringFee.amount.toString(),
        minter.accAddress,
      );
      const tx = await this.bcClient.createTx([], {
        msgs: [
          gameProviderC2xExe,
          treasuryC2xExe,
          serverC2xExe,
          c2XHolderC2xExe,
          minterTokenExe,
          treasuryTokenExe,
          serverTokenExe,
          fanHolderTokenExe,
          mintingExe,
        ],
        memo,
        fee,
      });

      // todo: save tx info into db
      // todo: 테이블 구조 협의 필요
      // await this.gameApiRepository.registerTx(<TransactionEntity>{
      //   requestId: getNamespace(RequestContext.NAMESPACE).get(
      //     RequestContext.CORRELATION_ID,
      //   ),
      //   // fixme txHash
      //   txHash: tx.txHash,
      //   tx: tx,
      //   status: true,
      //   appId: gameApiV1MintDto.appId,
      //   playerId: gameApiV1MintDto.playerId,
      //   accAddress: gameApiV1MintDto.accAddress,
      // });

      const unsignedTx = Buffer.from(tx.toBytes()).toString('base64');

      return <GameApiV1ResponseMintDto>{
        tokenId: tokenId,
        unsignedTx: unsignedTx,
        payerAddress: minter.accAddress,
        tokenUri: uploadedMetadata.url,
      };
    } catch (e) {
      // todo: send exception request to rabbitMQ
      throw new MintException(
        e.message,
        e.stack,
        MintHttpStatus.MINTING_FAILED,
      );
    }
  }

  async items(gameApiV1MintItemDto: GameApiV1MintItemDto): Promise<GameApiV1ResMintItemDto> {
    try {
      const gameServerData = await this.gameServerData(gameApiV1MintItemDto);

      // fixme: use apiLists
      // replyForMint = gameServerInfo.body.data.apiLists.filter(
      //   (item) => item.apiTypeCd === ApiTypeCode.NOTI_OF_COMPLETION_FOR_MINT,
      // )[0];
      const gameServerApi = gameServerData.apiTestLists.filter(
        (item) => item.apiTypeCd === this.MINT_LIST_API_TYPE.get(gameApiV1MintItemDto.mintType),
      )[0];

      // todo: check prams to request
      // call game server to confirm items
      const gameItems = await this.axiosClient.post(gameServerApi.apiUrl, {
        playerId: gameApiV1MintItemDto.playerId,
        server: gameApiV1MintItemDto.server,
        selectedCid: gameApiV1MintItemDto.selectedCid,
        categoryId: gameApiV1MintItemDto.categoryId,
        categoryName: gameApiV1MintItemDto.categoryName,
        categoryType: gameApiV1MintItemDto.categoryType,
      });
      if (!(gameItems.status === 200 || gameItems.status === 201)) {
        throw new GameApiException(
          'bad request',
          '',
          GameApiHttpStatus.BAD_REQUEST,
        );
      }

      let items = [];
      let characters = [];
      if (gameApiV1MintItemDto.mintType === MintType.ITEM){
        items = gameItems.body.data;
      } else {
        characters = gameItems.body.data;
      }

      return <GameApiV1ResMintItemDto>{
        items: items,
        characters: characters
      };
    } catch (e) {
      throw new MintException(
        e.message,
        e.stack,
        MintHttpStatus.SEARCHING_FAILED,
      );
    }
  }

  async burnNft() {}

  async broadcast(gameApiV1BroadcastDto: GameApiV1BroadcastDto) {
    try {
      const txFromDb = await this.gameApiRepository.getTxByRequestId(
        gameApiV1BroadcastDto.requestId,
      );
      if (txFromDb === undefined || txFromDb === null) {
        throw new GameApiException(
          'error occurred while finding the tx',
          '',
          GameApiHttpStatus.BAD_REQUEST,
        );
      }

      // todo: validate tx

      const tx_pb = Tx_pb.decode(
        Buffer.from(String(gameApiV1BroadcastDto.signedTx), 'base64'),
      );
      const tx = Tx.fromProto(tx_pb);
      // todo: get fee payer key
      const feePayer = await getMinterKey();

      const sequenceNumber = await this.sequenceUtil.getSequenceNumber(
        feePayer.accAddress,
      );

      const feePayerWallet = this.lcdClient.wallet(feePayer);

      //fixme : minter의 경우 sequence를 이미 증가 시킴, 또다시 증가 필요?
      const account = await this.bcClient.account(
        gameApiV1BroadcastDto.feePayerAddress,
      );
      // const signOption: SignOptions = {
      //     chainID,
      //     accountNumber: account.account_number,
      //     sequence: sequenceNumber,
      //     signMode: SignMode.SIGN_MODE_LEGACY_AMINO_JSON
      // }

      await this.commonService.sign(feePayerWallet, tx);

      // todo: save signed tx
    } catch (e) {
      // todo: handling error
      throw new GameApiException(
        e.message,
        e.stack,
        GameApiHttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async gameServerData(
    gameApiV1MintDto: GameApiV1MintItemDto | GameApiV1ValidItemDto,
  ): Promise<any> {
    const gameServerData = await this.axiosClient.get(
      this.configService
        .get('BG_DETAIL_GAME_INFO')
        .replace('{APP_ID}', gameApiV1MintDto.appId),
    );
    if (gameServerData.status !== 200) {
      throw new GameApiException(
        'bad request',
        '',
        GameApiHttpStatus.BAD_REQUEST,
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
}
