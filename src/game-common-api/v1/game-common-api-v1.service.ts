import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { TransactionUtil } from '../../util/transacation.util';
import { GameCommonApiRepository } from './repository/game-common-api.repository';
import { CommonRepository } from '../../commom/repository/common.repository';
import {
  BlockchainGameEntitty,
  BlockchainGameApiInfoEntity,
  ConvertSettingInfoEntity,
  MintCategorySettingInfoEntity,
  MintFeeInfoEntity,
  BlockchainGameApiTestInfoEntity,
} from '../../entities/blockchain-game.entitty';
import { GameApiHttpStatus } from '../../exception/exception';
import {
  BlockchainGameApiResDto,
  BlockchainGameApiTestResDto,
  BlockChainGameListResDto,
  BlockChainGameResDto,
  ConvertSettingResDto,
  MintCategorySettingResDto,
  MintFeeResDto,
} from '../../console-api/v1/dto/console-api-v1.res.dto';
import { AxiosClientUtil } from '../../util/axios-client.util';

@Injectable()
export class GameCommonApiV1Service {
  private TxUtil: TransactionUtil = new TransactionUtil(
    this.configService.get('SERVICE_USERAGENT'),
    this.configService.get('SERVICE_URL'),
    parseInt(this.configService.get('SERVICE_TIMEOUT')),
  );

  constructor(
    private configService: ConfigService,
    private axiosClient: AxiosClientUtil,
    // Repository 추가
    private readonly gameCommonRepo: GameCommonApiRepository,
    private readonly commonRepo: CommonRepository,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {}

  async findHiveGameCertificationKey(appid: string): Promise<string | null> {
    const result: any = await this.commonRepo.selectAppidHiveGame(appid);
    return !result ? null : result.hiveCertificationKey;
  }

  /**
   * 베타게임 런처 진행 현황 목록 조회
   * @param query
   */
  async lists(
    query,
  ): Promise<[statusCode: number, message: string, result?: any]> {
    try {
      const result: any = await this.gameCommonRepo.selectLists(query);
      let lists = null;

      // 코드 그룹 정보 가져오기
      const codeGroups = await this.commonRepo.findCodeGroups([
        'SETTING_COMPLETE_TYPE',
        'API_TYPE',
      ]);

      if (result.data.length > 0) {
        lists = [];
        for (const value of result.data) {
          const gameInfo: any = await this.commonRepo.selectHiveGameInfo(
            value.gameindex,
          );

          const appInfo: any = await this.commonRepo.findAppIdInfo(value.appid);

          const gameName: any = await this.commonRepo.selectHiveGameName(
            value.gameindex,
          );

          const gameServer: any = await this.commonRepo.selectHiveGameServer(
            value.gameindex,
          );

          // const betaGameInfo: any =
          //   await this.gameCommonRepo.selectBetaGameInfo(
          //     value.betagameLauncherId,
          //   );

          const gameServerInfo = [];
          for (const gameServerValue of gameServer) {
            if (gameServerValue['serverId'] === 'GLOBAL') {
              gameServerInfo.push({
                serverId: gameServerValue['serverId'],
                serverNameKO: gameServerValue['serverNameKO'],
                serverNameEN: gameServerValue['serverNameEN'],
                timezone: gameServerValue['timezone'],
              });
            }
          }

          gameInfo.name = [];
          for (const gameNameValue of gameName) {
            gameInfo.name.push({
              language: gameNameValue['language'],
              name: gameNameValue['name'],
            });
          }

          lists.push(<BlockChainGameListResDto>{
            gameindex: value.gameindex,
            appid: value.appid,
            title: gameInfo.name,
            iconImage: gameInfo.iconImage,
            genre: gameInfo.genre,
            serviceType: appInfo.serviceType,
            characterSelect: value.characterSelect == '1001000601' ? 1 : 0,
            channelSelect: value.channelSelect == '1001000601' ? 1 : 0,
            gameTokenName: value.gameTokenName,
            gameTokenImage:
              this.configService.get('AWS_S3_VIEW_URL') +
              '/' +
              value.gameTokenImage,
            settingCompleteTypeCd: value.settingCompleteTypeCd,
            apiSettingCompleteTypeCd: value.apiSettingCompleteTypeCd,
            activeTypeCd: value.activeTypeCd,
            governanceTokenConvertTypeCd: value.governanceTokenConvertTypeCd,
            gameTokenConvertTypeCd: value.gameTokenConvertTypeCd,
            mintActiveTypeCd: value.mintActiveTypeCd,
            unionMintActiveTypeCd: value.unionMintActiveTypeCd,
            charMintActiveTypeCd: value.charMintActiveTypeCd,
            androidDownLink:
              'https://play.google.com/store/apps/details?id=com.com2us.chronicles.android.google.kr.normal&referrer=utm_source%3Dglobal%26utm_medium%3Dhub%26utm_term%3Dfix%26utm_content%3D%26utm_campaign%3Dsp_so',
            iosDownLink:
              'https://apps.apple.com/kr/app/chronicleskr/id1612757020',
            pcDownLink: null,
            gameServerLists: gameServerInfo,
          });
        }
      } else {
        // 데이터 없음
        throw new NotFoundException();
      }

      return [
        GameApiHttpStatus.OK,
        'success',
        {
          lists: lists,
          meta: {
            totalItems: result.meta.totalItems,
            currentPage: result.meta.currentPage,
            totalPages: result.meta.totalPages,
          },
        },
      ];
    } catch (e) {
      this.logger.error('exception: ', e.stack);
      return [e.response.statusCode, e.response.message];
    }
  }

  /**
   * 블록체인 게임 정보 조회
   */
  async findGame(
    appid: string,
  ): Promise<
    [statusCode: number, message: string, result?: BlockChainGameResDto]
  > {
    try {
      if (!(await this.gameCommonRepo.checkAppId(appid))) {
        throw new NotFoundException();
      }

      // 게임 기본 정보 조회
      const info: BlockchainGameEntitty =
        await this.gameCommonRepo.selectBlockChainGameAppid(appid);

      // API 정보 조회
      const apiLists: BlockchainGameApiResDto[] = await this.findApi(info.id);

      // API 테스트 정보 조회
      const apiTestLists: BlockchainGameApiTestResDto[] =
        await this.findApiTest(info.id);

      // 카테고리 설정 정보 조회
      const category: MintCategorySettingResDto[] = await this.findCategory(
        info.id,
      );

      const categoryIds = [];
      for (const value of category) {
        // 수수료 정보 조회를 위해 고유 번호 추출
        categoryIds.push(value.id);
      }

      const categoryLists = [];
      if (categoryIds.length > 0) {
        // 민팅 수수료 조회
        const fee: MintFeeInfoEntity[] =
          await this.gameCommonRepo.selectFeeInfo(categoryIds);
        const feeLists = {};
        for (const value of fee) {
          if (!Array.isArray(feeLists[value.mcsiId])) {
            feeLists[value.mcsiId] = [];
          }
          feeLists[value.mcsiId].push(<MintFeeResDto>{
            xplaFee: value.xplaFee,
            gameTokenFee: value.gameTokenFee,
            mintCount: value.mintCount,
          });
        }

        // 카테고리 정보화 수수료 정보를 합처서 생성
        for (const value of category) {
          categoryLists.push(<MintCategorySettingResDto>{
            id: value.id,
            activeTypeCd: value.activeTypeCd,
            mintTypeCd: value.mintTypeCd,
            name: value.name,
            feeInfo: feeLists[value.id],
          });
        }
      }

      // 컨버스 설정 정보 조회
      const convertLists: ConvertSettingResDto[] = await this.findConvert(
        info.id,
      );

      const gameInfo: any = await this.commonRepo.selectHiveGameInfo(
        info.gameindex,
      );

      const gameName: any = await this.commonRepo.selectHiveGameName(
        info.gameindex,
      );

      gameInfo.name = [];
      for (const gameNameValue of gameName) {
        gameInfo.name.push({
          language: gameNameValue['language'],
          name: gameNameValue['name'],
        });
      }

      const gameServer: any = await this.commonRepo.selectHiveGameServer(
        info.gameindex,
      );

      const gameServerInfo = [];
      for (const gameServerValue of gameServer) {
        if (gameServerValue['serverId'] === 'GLOBAL') {
          gameServerInfo.push({
            serverId: gameServerValue['serverId'],
            serverNameKO: gameServerValue['serverNameKO'],
            serverNameEN: gameServerValue['serverNameEN'],
            timezone: gameServerValue['timezone'],
          });
        }
      }

      return [
        GameApiHttpStatus.OK,
        'success',
        <BlockChainGameResDto>{
          gameindex: info.gameindex,
          title: gameInfo.name,
          iconImage: gameInfo.iconImage,
          genre: gameInfo.genre,
          gameTokenName: info.gameTokenName,
          gameTokenImage:
            this.configService.get('AWS_S3_VIEW_URL') +
            '/' +
            info.gameTokenImage,
          settingCompleteTypeCd: info.settingCompleteTypeCd,
          apiSettingCompleteTypeCd: info.apiSettingCompleteTypeCd,
          activeTypeCd: info.activeTypeCd,
          serverAddress: info.serverAddress,
          fanHolderAddress: info.fanHolderAddress,
          gameProviderAddress: info.gameProviderAddress,
          gameTokenContract: info.gameTokenContract,
          lockContract: info.lockContract,
          nftContract: info.nftContract,
          treasuryAddress: info.treasuryAddress,
          xplaContract: info.xplaContract,
          xplaHolderAddress: info.xplaHolderAddress,
          distributionType: info.distributionType,
          xplaConvertPoolInitialRatioGoods:
            info.xplaConvertPoolInitialRatioGoods,
          gameTokenConvertPoolInitialRatioGoods:
            info.gameTokenConvertPoolInitialRatioGoods,
          apiLists: apiLists,
          apiTestLists: apiTestLists,
          categoryLists: categoryLists,
          convertLists: convertLists,
          gameServerLists: gameServerInfo,
        },
      ];
    } catch (e) {
      this.logger.error('exception: ', e.stack);
      return [e.response.statusCode, e.response.message];
    }
  }

  /**
   * gameindex에 해당하는 고유식별 코르를 리턴함
   * @param gameindex
   */
  async findGameindex(
    gameindex: number,
  ): Promise<[statusCode: number, message: string, result?: number]> {
    try {
      const game = await this.gameCommonRepo.selectBlockChainGame(gameindex);
      return [GameApiHttpStatus.OK, 'success', game.id];
    } catch (e) {
      this.logger.error('exception: ', e.stack);
      return [e.response.statusCode, e.response.message];
    }
  }

  /**
   * appid에 해당하는 고유식별 코르를 리턴함
   * @param gameindex
   */
  async findAppId(
    appid: string,
  ): Promise<[statusCode: number, message: string, result?: number]> {
    try {
      const game = await this.gameCommonRepo.selectBlockChainGameAppid(appid);
      return [GameApiHttpStatus.OK, 'success', game.id];
    } catch (e) {
      this.logger.error('exception: ', e.stack);
      return [e.response.statusCode, e.response.message];
    }
  }

  /**
   * API 리스트 조회
   * @param id
   */
  async findApi(id: number): Promise<BlockchainGameApiResDto[]> {
    // API 테스트 리스트 조회
    const result: BlockchainGameApiInfoEntity[] =
      await this.gameCommonRepo.selectGameApi(id);
    let lists = [];

    if (result) {
      for (const value of result) {
        lists.push(<BlockchainGameApiResDto>{
          apiTypeCd: value.apiTypeCd,
          apiUrl: value.apiUrl,
        });
      }
    } else {
      lists = null;
    }
    return lists;
  }

  /**
   * API TEST 리스트 조회
   * @param id
   */
  async findApiTest(id: number): Promise<BlockchainGameApiTestResDto[]> {
    // API 테스트 리스트 조회
    const result: BlockchainGameApiTestInfoEntity[] =
      await this.gameCommonRepo.selectGameTestApi(id);
    let lists = [];

    if (result) {
      for (const value of result) {
        lists.push(<BlockchainGameApiTestResDto>{
          apiTypeCd: value.apiTypeCd,
          apiUrl: value.apiUrl,
        });
      }
    } else {
      lists = null;
    }
    return lists;
  }

  /**
   * category 설정 정보 조회
   * @param id
   */
  async findCategory(id: number): Promise<MintCategorySettingResDto[]> {
    // API 테스트 리스트 조회
    const result: MintCategorySettingInfoEntity[] =
      await this.gameCommonRepo.selectMintCategory(id);
    let lists = [];

    if (result) {
      for (const value of result) {
        lists.push(<MintCategorySettingResDto>{
          id: value.id,
          activeTypeCd: value.activeTypeCd,
          mintTypeCd: value.mintTypeCd,
          name: value.name,
        });
      }
    } else {
      lists = null;
    }
    return lists;
  }

  /**
   * 민팅 수수료 설정 정보 조회
   * @param id
   */
  async findMintFee(
    id: number,
  ): Promise<[statusCode: number, message: string, result?: MintFeeResDto[]]> {
    try {
      // 카테고리가 존재 하는지 확인
      const category = await this.gameCommonRepo.selectMintCategoryId(id);

      // 없는 카테고리면 에러
      if (!category) {
        return [GameApiHttpStatus.NOT_FOUND, 'Category not fount'];
      }

      // API 테스트 리스트 조회
      const result: MintFeeInfoEntity[] =
        await this.gameCommonRepo.selectFeeInfo(category.id);
      const lists = [];

      if (result) {
        for (const value of result) {
          lists.push(<MintFeeResDto>{
            xplaFee: value.xplaFee,
            gameTokenFee: value.gameTokenFee,
            mintCount: value.mintCount,
          });
        }
        return [GameApiHttpStatus.OK, 'success', lists];
      } else {
        // 조회가 안되었으면 NOT_FOUND
        return [GameApiHttpStatus.NOT_FOUND, 'Mint fee not found'];
      }
    } catch (e) {
      this.logger.error('exception: ', e.stack);
      return [e.response.statusCode, e.response.message];
    }
  }

  /**
   * convert 설정 정보 조회
   * @param id
   */
  async findConvert(id: number): Promise<ConvertSettingResDto[]> {
    // API 테스트 리스트 조회
    const result: ConvertSettingInfoEntity[] =
      await this.gameCommonRepo.selectConvert(id);
    let lists = [];
    if (result) {
      for (const value of result) {
        lists.push(<ConvertSettingResDto>{
          convertTypeCd: value.convertTypeCd,
          goodsName: value.goodsName,
          goodsCode: value.goodsCode,
          goodsImage:
            this.configService.get('AWS_S3_VIEW_URL') + '/' + value.goodsImage,
          minConvertQuantityOneTime: value.minConvertQuantityOneTime,
          maxConvertQuantityDays: value.maxConvertQuantityDays,
        });
      }
    } else {
      lists = null;
    }
    return lists;
  }
}
