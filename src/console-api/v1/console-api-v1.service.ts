import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { TransactionUtil } from '../../util/transacation.util';
import { BlockchainGameRepository } from './repository/blockchain-game.repository';
import {
  BlockchainGameEntitty,
  BlockchainGameApiInfoEntity,
  ConvertSettingInfoEntity,
  MintCategorySettingInfoEntity,
  MintFeeInfoEntity,
  BlockchainGameApiTestInfoEntity,
} from '../../entities/blockchain-game.entitty';
import { CommonRepository } from '../../commom/repository/common.repository';
import { GameApiHttpStatus } from '../../exception/exception';
import {
  BlockChainGameActiveUpdateReqDto,
  BlockChainGameApiUpdateReqDto,
  BlockChainGameCreateReqDto,
  BlockChainGameServerUpdateReqDto,
  BlockChainGameTemporaryUpdateReqDto,
  BlockChainGameUpdateReqDto,
} from './dto/console-api-v1.req.dto';
import {
  BlockchainGameApiResDto,
  BlockchainGameApiTestResDto,
  BlockChainGameResDto,
  ConvertSettingResDto,
  GameServerDto,
  MintCategorySettingResDto,
  MintFeeResDto,
} from './dto/console-api-v1.res.dto';
import { BetagameRepository } from '../../beta-game-api/v1/repository/beta-game.repository';
import {
  CompanyEntity,
  CompanyNameEntity,
  GameInfoEntity,
  GameServerEntity,
  GameNameEntity,
  AppInfoEntity,
  BlockChainGameServerEntity,
} from '../../commom/repository/common.entitty';

@Injectable()
export class ConsoleApiV1Service {
  private TxUtil: TransactionUtil = new TransactionUtil(
    this.configService.get('SERVICE_USERAGENT'),
    this.configService.get('SERVICE_URL'),
    parseInt(this.configService.get('SERVICE_TIMEOUT')),
  );

  constructor(
    private configService: ConfigService,
    // Repository 추가
    private readonly blockchainGameRepo: BlockchainGameRepository,
    private readonly betagameRepo: BetagameRepository,
    private readonly commonRepo: CommonRepository,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {}

  async syncCompany(
    dto: any,
  ): Promise<[statusCode: number, message: string, result?: any]> {
    for (const companyData of dto) {
      await this.commonRepo.updateHiveCompany(<CompanyEntity>{
        company: companyData.company,
        code: companyData.code,
      });
      for (const value of companyData.locale) {
        await this.commonRepo.updateHiveCompanyName(<CompanyNameEntity>{
          company: companyData.company,
          language: value.language,
          name: value.name,
        });
      }
    }
    return [GameApiHttpStatus.OK, 'success'];
  }

  async syncGame(
    dto: any,
  ): Promise<[statusCode: number, message: string, result?: any]> {
    await this.commonRepo.updateHiveGames(<GameInfoEntity>{
      company: dto.company,
      gameindex: dto.gameindex,
      gameId: dto.gameId,
      iconImage: dto.iconImage,
      genre: dto.genre,
      hiveCertificationKey: dto.hiveCertificationKey,
    });

    /** 게임 서버 정보 삭제 */
    await this.commonRepo.deleteHiveGameServer(dto.gameindex);

    /** 게임 서버 정보 등록 */
    for (const value of dto.server) {
      await this.commonRepo.updateHiveGameServer(<GameServerEntity>{
        gameindex: dto.gameindex,
        serverId: value.serverId,
        serverNameKO: value.serverNameKO,
        serverNameEN: value.serverNameEN,
        timezone: value.timezone,
      });
    }

    /** 게임명 등록 */
    for (const value of dto.locale) {
      await this.commonRepo.updateHiveGameName(<GameNameEntity>{
        gameindex: dto.gameindex,
        language: value.language,
        name: value.title,
      });
    }

    return [GameApiHttpStatus.OK, 'success'];
  }

  async syncApp(
    dto: any,
  ): Promise<[statusCode: number, message: string, result?: any]> {
    const save = await this.commonRepo.updateHiveApps(<AppInfoEntity>{
      appindex: dto.appindex,
      gameindex: dto.gameindex,
      appid: dto.appid,
      market: dto.market,
      marketUrl: dto.marketUrl,
      marketApplicationId: dto.marketApplicationId,
      os: dto.os,
      serviceType: dto.serviceType,
    });
    return [GameApiHttpStatus.OK, 'success'];
  }

  /**
   * 베타 게임 런처에서 신청 완료 시, 해당 Service를 통해 대기중 상태로 등록
   * @param request: BlockChainGameCreateDto
   */
  async create(
    request: BlockChainGameCreateReqDto,
  ): Promise<[statusCode: number, message: string, result?: any]> {
    try {
      // 이미 등록되어 있는지 확인 (중복방지) : DB에 유니크지만 에러나는건 시러~
      if (
        await this.blockchainGameRepo.overlap(
          request.company,
          request.gameindex,
        )
      ) {
        return [GameApiHttpStatus.CONFLICT, 'duplicate game'];
      }

      /** 앱아이디 정보 조회 */
      const appid: string = await this.findAppid(request.gameindex);

      // 중복이 아니라면 등록
      const insert_id = await this.blockchainGameRepo.insert(<
        BlockchainGameEntitty
      >{
        betagameLauncherId: request.blci_id,
        company: request.company,
        gameindex: request.gameindex,
        // TODO: 앱센터 연동 후, appid 까지 등록하도록 해야 함. 임의 텍스트 등록
        appid: appid,
        gameTokenName: request.gameTokenName,
        distributionType: request.distributionType,
        xplaConvertPoolInitialRatioGoods:
          request.xplaConvertPoolInitialRatioGoods,
        gameTokenConvertPoolInitialRatioGoods:
          request.gameTokenConvertPoolInitialRatioGoods,
        gameProviderAddress: request.gameProviderAddress,
        createAdmin: request.createAdmin,
      });

      return [GameApiHttpStatus.OK, 'success', { id: insert_id }];
    } catch (e) {
      this.logger.error('exception: ', e.stack);
      return [e.response.statusCode, e.response.message];
    }
  }

  /**
   * 블록체인 런처 진행 현황 목록 조회
   * @param query
   */
  async lists(
    query,
  ): Promise<[statusCode: number, message: string, result?: any]> {
    try {
      const result: any = await this.blockchainGameRepo.selectLists(query);

      let data = {
        lists: null,
        meta: null,
      };

      if (result.data.length > 0) {
        let BetaGameRes: BlockChainGameResDto[] = [];
        for (const value of result.data) {
          BetaGameRes.push(<BlockChainGameResDto>{
            id: value.id,
            company: value.company,
            gameindex: value.gameindex,
            betagameLauncherId: value.betagameLauncherId,
            appid: value.appid,
            gameTokenName: value.gameTokenName,
            gameTokenImage: value.gameTokenImage,
            settingCompleteTypeCd: value.settingCompleteTypeCd,
            apiSettingCompleteTypeCd: value.apiSettingCompleteTypeCd,
            mintActiveTypeCd: value.mintActiveTypeCd,
            unionMintActiveTypeCd: value.unionMintActiveTypeCd,
            charMintActiveTypeCd: value.charMintActiveTypeCd,
            governanceTokenConvertTypeCd: value.governanceTokenConvertTypeCd,
            gameTokenConvertTypeCd: value.gameTokenConvertTypeCd,
            activeTypeCd: value.activeTypeCd,
            serverAddress: value.serverAddress,
            gameContract: value.gameContract,
            fanHolderAddress: value.xplaHolderAddress,
            gameProviderAddress: value.gameProviderAddress,
            gameTokenContract: value.gameTokenContract,
            lockContract: value.lockContract,
            nftContract: value.nftContract,
            treasuryAddress: value.treasuryAddress,
            xplaContract: value.xplaContract,
            xplaHolderAddress: value.fanHolderAddress,
          });
        }

        const ids = BetaGameRes.map((game) => game.id);
        const hiveGameServers: BlockChainGameServerEntity[] =
          await this.commonRepo.selectBlockChainGameServer(ids);

        BetaGameRes = BetaGameRes.map((game, index) => {
          let gameServerLists: GameServerDto[] = [];
          gameServerLists = hiveGameServers.map((server) => {
            if (Number(server.bgiId) === Number(game.id)) {
              const data = <GameServerDto>{
                serverId: server.serverId,
                serverNameKO: server.serverNameKO,
                serverNameEN: server.serverNameEN,
                timezone: server.timezone,
              };
              console.log(data);
              return data;
            }
          });
          game.gameServerLists = gameServerLists;
          return game;
        });

        // 검색이 되었을때 데이터 주입
        data = {
          lists: BetaGameRes,
          meta: {
            totalItems: result.meta.totalItems,
            currentPage: result.meta.currentPage,
            totalPages: result.meta.totalPages,
          },
        };
      }

      return [GameApiHttpStatus.OK, 'success', data];
    } catch (e) {
      this.logger.error('exception: ', e.stack);
      return [e.response.statusCode, e.response.message];
    }
  }

  async findAppid(gameindex: number): Promise<string | null> {
    try {
      const appinfo: AppInfoEntity = await this.commonRepo.findAppInfo(
        gameindex,
        'C2XWALLET',
      );
      return appinfo.appid;
    } catch (e) {
      this.logger.error('exception: ', e.stack);
      return null;
    }
  }

  /**
   * 블록체인 게임 상세 정보 조회
   * @param id
   */
  async findBlockChainGame(
    id: number,
  ): Promise<[statusCode: number, message: string, result?: any]> {
    // 조회 가능한 데이터가 있는지 확인
    try {
      // 등록되어 있는지 확인
      if (!(await this.blockchainGameRepo.checkId(id))) {
        return [GameApiHttpStatus.CONFLICT, 'Blockchain Game Id not found'];
      }

      const info: BlockchainGameEntitty =
        await this.blockchainGameRepo.selectBlockChainGame(id);

      // API 리스트 조회
      const api: BlockchainGameApiInfoEntity[] =
        await this.blockchainGameRepo.selectGameApi(info.id);
      const apiLists = [];
      for (const value of api) {
        apiLists.push(<BlockchainGameApiResDto>{
          apiTypeCd: value.apiTypeCd,
          apiUrl: value.apiUrl,
          verification: value.verification,
        });
      }

      // API 테스트 리스트 조회
      const apiTest: BlockchainGameApiTestInfoEntity[] =
        await this.blockchainGameRepo.selectGameTestApi(info.id);
      const apiTestLists = [];
      for (const value of apiTest) {
        apiTestLists.push(<BlockchainGameApiTestResDto>{
          apiTypeCd: value.apiTypeCd,
          apiUrl: value.apiUrl,
          verification: value.verification,
        });
      }
      /*
      alter table tb_blockchain_game_info
      modify character_select tinyint default 0 not null comment '케릭터 선택 유무 ( 0: 캐릭터 선택 미사용, 1: 캐릭터 선택 사용 )';

      alter table tb_blockchain_game_info
      add channel_select tinyint default 0 not null comment '케릭터 선택 유무 ( 0: 캐릭터 선택 미사용, 1: 캐릭터 선택 사용 )';
      */
      // 민팅 카테고리 설정 조회
      const category: MintCategorySettingInfoEntity[] =
        await this.blockchainGameRepo.selectMintCategory(info.id);

      const categoryIds = [];
      for (const value of category) {
        // 수수료 정보 조회를 위해 고유 번호 추출
        categoryIds.push(value.id);
      }

      const categoryLists = [];
      if (categoryIds.length > 0) {
        // 민팅 수수료 조회
        const fee: MintFeeInfoEntity[] =
          await this.blockchainGameRepo.selectFeeInfo(categoryIds);
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

      // 컨버트 세팅 정보 조회
      const convert: ConvertSettingInfoEntity[] =
        await this.blockchainGameRepo.selectConvert(info.id);
      const convertLists = [];
      for (const value of convert) {
        convertLists.push(<ConvertSettingResDto>{
          convertTypeCd: value.convertTypeCd,
          goodsName: value.goodsName,
          goodsCode: value.goodsCode,
          goodsImage: value.goodsImage,
          minConvertQuantityOneTime: value.minConvertQuantityOneTime,
          maxConvertQuantityDays: value.maxConvertQuantityDays,
        });
      }

      // 응답 정보 구성
      return [
        GameApiHttpStatus.OK,
        'success',
        <BlockChainGameResDto>{
          id: info.id,
          company: info.company,
          gameindex: info.gameindex,
          betagameLauncherId: info.betagameLauncherId,
          appid: info.appid,
          gameTokenName: info.gameTokenName,
          gameTokenImage: info.gameTokenImage,
          characterSelect: info.characterSelect,
          channelSelect: info.channelSelect,
          settingCompleteTypeCd: info.settingCompleteTypeCd,
          apiSettingCompleteTypeCd: info.apiSettingCompleteTypeCd,
          activeTypeCd: info.activeTypeCd,
          mintActiveTypeCd: info.mintActiveTypeCd,
          unionMintActiveTypeCd: info.unionMintActiveTypeCd,
          charMintActiveTypeCd: info.charMintActiveTypeCd,
          governanceTokenConvertTypeCd: info.governanceTokenConvertTypeCd,
          gameTokenConvertTypeCd: info.gameTokenConvertTypeCd,
          serverAddress: info.serverAddress,
          gameContract: info.gameContract,
          fanHolderAddress: info.xplaHolderAddress,
          gameProviderAddress: info.gameProviderAddress,
          gameTokenContract: info.gameTokenContract,
          lockContract: info.lockContract,
          nftContract: info.nftContract,
          treasuryAddress: info.treasuryAddress,
          xplaContract: info.xplaContract,
          xplaHolderAddress: info.fanHolderAddress,
          apiLists: apiLists,
          apiTestLists: apiTestLists,
          categoryLists: categoryLists,
          convertLists: convertLists,
        },
      ];
    } catch (e) {
      this.logger.error('exception: ', e.stack);
      return [e.response.statusCode, e.response.message];
    }
  }

  /**
   * 블록체인 게임 설정 업데이트 요청 (API 정보 제외)
   * @param id
   * @param dto
   */
  async update(
    id: number,
    dto: BlockChainGameUpdateReqDto | BlockChainGameTemporaryUpdateReqDto,
  ): Promise<[statusCode: number, message: string, result?: any]> {
    try {
      // 등록되어 있는지 확인
      if (!(await this.blockchainGameRepo.checkId(id))) {
        return [GameApiHttpStatus.NOT_FOUND, 'Blockchain Game Id not found'];
      }

      const gameUpdate = await this.blockchainGameRepo.update(id, <
        BlockchainGameEntitty
      >{
        mintActiveTypeCd: dto.mintActiveTypeCd,
        unionMintActiveTypeCd: dto.unionMintActiveTypeCd,
        charMintActiveTypeCd: dto.charMintActiveTypeCd,
        governanceTokenConvertTypeCd: dto.governanceTokenConvertTypeCd,
        gameTokenConvertTypeCd: dto.gameTokenConvertTypeCd,
        gameTokenImage: dto.gameTokenImage,
        settingCompleteTypeCd: dto.settingCompleteTypeCd,
        channelSelect: dto.channelSelectActiveTypeCd,
        characterSelect: dto.characterSelectActiveTypeCd,
        updateAdmin: dto.updateAdmin,
      });

      let insert = null;

      // 업데이트가 성공하면 다른 정보 추가 삽입
      if (gameUpdate) {
        // 카테고리 정보
        const insertFeeInfo = [];
        if (dto.category) {
          await this.blockchainGameRepo.deleteCategory(id);
          insert = [];
          for (const value of dto.category) {
            const category_id = await this.blockchainGameRepo.insertCategory(<
              MintCategorySettingInfoEntity
            >{
              bgiId: id,
              name: value.name,
              mintTypeCd: value.mintTypeCd,
              activeTypeCd: value.activeTypeCd,
            });

            for (const fee of value.feeInfo) {
              insertFeeInfo.push(<MintFeeInfoEntity>{
                bgiId: id,
                mcsiId: category_id,
                xplaFee: fee.xplaFee,
                gameTokenFee: fee.gameTokenFee,
                mintCount: fee.mintCount,
              });
            }
          }

          // 수수료 정보
          if (insertFeeInfo.length > 0) {
            await this.blockchainGameRepo.deleteFee(id);
            await this.blockchainGameRepo.insertFee(insertFeeInfo);
          }

          // 컨버트 정보
          if (dto.convert) {
            await this.blockchainGameRepo.deleteConvert(id);
            insert = [];
            for (const value of dto.convert) {
              insert.push(<ConvertSettingInfoEntity>{
                bgiId: id,
                convertTypeCd: value.convertTypeCd,
                goodsName: value.goodsName,
                goodsCode: value.goodsCode,
                goodsImage: value.goodsImage,
                minConvertQuantityOneTime: value.minConvertQuantityOneTime,
                maxConvertQuantityDays: value.maxConvertQuantityDays,
              });
            }
            await this.blockchainGameRepo.insertConvert(insert);
          }
        }
      }

      return [GameApiHttpStatus.OK, 'success'];
    } catch (e) {
      this.logger.error('exception: ', e.stack);
      return [e.response.statusCode, e.response.message];
    }
  }

  /**
   * 게임 API 정보 변경
   * @param id
   * @param dto
   */
  async updateGameApi(
    id: number,
    dto: BlockChainGameApiUpdateReqDto,
  ): Promise<[statusCode: number, message: string, result?: any]> {
    try {
      // 등록되어 있는지 확인
      if (!(await this.blockchainGameRepo.checkId(id))) {
        return [GameApiHttpStatus.CONFLICT, 'Blockchain Game Id not found'];
      }

      // API 코드 타입 정보 가져오기
      const codes = await this.commonRepo.findCodes('API_TYPE');

      // typeCd 가 중복이 있는지 확인 필요
      let apiTypecdLists = [];
      for (const value of dto.apiLists) {
        apiTypecdLists.push(value.apiTypeCd);
      }

      // 중복 제거
      apiTypecdLists = await this._arrayUnique(apiTypecdLists);

      // 중복제거한 개수와 dto로 들어온 개수가 같은지 확인. 같지 않으면 에러
      if (apiTypecdLists.length != dto.apiLists.length) {
        return [GameApiHttpStatus.CONFLICT, 'Duplicate apiTypeCd'];
      }

      // 설정중, 설정완료 확인 ( 게임 API 코드 개수와 같으면 설정완료 처리 )
      // if (dto.apiLists.length == Object.keys(codes).length) {
      //   dto.apiSettingCompleteTypeCd = '1001000901'; // 설정 완료
      // } else {
      //   dto.apiSettingCompleteTypeCd = '1001000902'; // 설정중
      // }

      await this.blockchainGameRepo.update(id, <BlockchainGameEntitty>{
        apiSettingCompleteTypeCd: dto.apiSettingCompleteTypeCd,
      });

      // API 정보 삭제
      await this.blockchainGameRepo.deleteApi(id);
      await this.blockchainGameRepo.deleteApiTest(id);

      // API 정보 재 등록
      let insert = [];
      for (const value of dto.apiLists) {
        insert.push(<BlockchainGameApiInfoEntity>{
          bgiId: id,
          apiUrl: value.apiUrl,
          apiTypeCd: value.apiTypeCd,
          verification: value.verification,
        });
      }
      await this.blockchainGameRepo.insertApi(insert);

      // TEST API 정보 재 등록
      insert = []; // 배열 초기화
      for (const value of dto.apiTestLists) {
        insert.push(<BlockchainGameApiTestInfoEntity>{
          bgiId: id,
          apiUrl: value.apiUrl,
          apiTypeCd: value.apiTypeCd,
          verification: value.verification,
        });
      }
      await this.blockchainGameRepo.insertApiTest(insert);

      return [GameApiHttpStatus.OK, 'success'];
    } catch (e) {
      this.logger.error('exception: ', e.stack);
      return [e.response.statusCode, e.response.message];
    }
  }

  /**
   * 게임의 운영 설정 ON/OFF 변경
   * @param id
   * @param request
   */
  async gameActive(
    id: number,
    request: BlockChainGameActiveUpdateReqDto,
  ): Promise<[statusCode: number, message: string, result?: any]> {
    try {
      // 등록되어 있는지 확인
      if (!(await this.blockchainGameRepo.checkId(id))) {
        return [GameApiHttpStatus.NOT_FOUND, 'Blockchain Game Id not found'];
      }
      // 게임 운영 설정 변경
      await this.blockchainGameRepo.gameActive(id, request.activeTypeCd);
      return [GameApiHttpStatus.OK, 'success'];
    } catch (e) {
      this.logger.error('exception: ', e.stack);
      return [e.response.statusCode, e.response.message];
    }
  }

  async checkHiveCompanyInfo(company: number): Promise<boolean> {
    return await this.commonRepo.checkHiveCompanyInfo(company);
  }

  /** 콘솔에서 기본적으로 필요한 데이터를 조회하여 전달함. */
  async consoleInitData(company: number): Promise<object> {
    /** company 회사 코드가 있는지 검색 */
    const hiveCompany = await this.commonRepo.findHiveCompanyInfo(company);

    const codeGroups = await this.commonRepo.findCodeGroups([
      'PROGRESS_STATUS',
      'DEVELOP_STATUS',
      'SERVICE_LINK_TYPE',
      'SETTING_COMPLETE_TYPE',
      'ACTIVE_TYPE',
      'API_TYPE',
    ]);
    let hiveGames = await this.commonRepo.findHiveGames(company);
    const gameIndexs = hiveGames.map((game) => game.gameindex);
    const hiveGameServers: GameServerEntity[] =
      await this.commonRepo.selectHiveGameServerLists(gameIndexs);

    hiveGames = hiveGames.map((game, index) => {
      let gameServerLists: any = [];
      gameServerLists = hiveGameServers.filter(
        (server) => Number(server.gameindex) === Number(game.gameindex),
      );
      game.gameServerLists = gameServerLists;
      return game;
    });

    const initData = {
      company: hiveCompany,
      hiveGames: hiveGames,
      codeGroups: codeGroups,
    };
    return initData;
  }

  /**
   * 특정회사에서 베타게임에 등록되지 않은 게임만 조회하여 전달함
   * @param company
   */
  async notRegBetaGameHiveGame(company: number): Promise<any> {
    /** 해당 회사의 하이브 게임 목록을 조회함 */
    const hiveGames = await this.commonRepo.findHiveGames(company);

    /** 베타게임에 미등록한 게임을 찾기 위해 gameindex를 모두 추림 */
    const gameindexLists = [];
    for (const key in hiveGames) {
      gameindexLists.push(hiveGames[key].gameindex);
    }

    /** 베타게임에 등록된 게임만 조회 */
    const regBetaGame = await this.betagameRepo.regBetaGame(
      company,
      gameindexLists,
    );

    const regGameindex = [];
    for (const key in regBetaGame) {
      regGameindex.push(regBetaGame[key]['gameindex']);
    }

    /** 해당 게임들의 appid 조회 */
    const appidLists = await this.commonRepo.findAppLists(
      gameindexLists,
      'C2XWALLET',
    );

    const isAppidGame = [];
    for (const key in appidLists) {
      isAppidGame[appidLists[key]['gameindex']] = {
        appid: appidLists[key]['appid'],
      };
    }

    /** 하이브 게임 리스트에서 등록된 게임 제외 / appid 가 존재하지 않으면 게임 제외 */
    const notRegBetaGameLists = [];
    for (const key in hiveGames) {
      if (!regGameindex.includes(hiveGames[key].gameindex)) {
        if (isAppidGame[hiveGames[key].gameindex]) {
          hiveGames[key].appid = isAppidGame[hiveGames[key].gameindex].appid;
        } else {
          hiveGames[key].appid = null;
        }
        notRegBetaGameLists.push(hiveGames[key]);
      }
    }

    return notRegBetaGameLists;
  }

  async blockchainGameLists(company: number): Promise<any> {
    return await this.blockchainGameRepo.blockchainGameLists(company);
  }

  async bcGameServerUpdate(
    bgiId: number,
    gameindex: number,
    servers: string[],
  ): Promise<boolean> {
    try {
      const gameServer: GameServerEntity[] =
        await this.commonRepo.selectHiveGameServerLists(gameindex);

      const gameServerLists = gameServer.filter((server) => {
        if (servers.includes(server.serverId)) {
          return <GameServerDto>{
            serverId: server.serverId,
            serverNameKO: server.serverNameKO,
            serverNameEN: server.serverNameEN,
            timezone: server.timezone,
          };
        }
      });

      console.log(servers, gameServerLists);

      if (gameServerLists.length > 0) {
        /** 기존 서버 정보 먼저 삭제 */
        await this.blockchainGameRepo.deleteBlockChainGameServer(bgiId);

        for (const value of gameServerLists) {
          const gameServer: BlockChainGameServerEntity = {
            bgiId: bgiId,
            gameindex: gameindex,
            serverId: value.serverId,
            serverNameKO: value.serverNameKO,
            serverNameEN: value.serverNameEN,
            timezone: value.timezone,
          };
          await this.blockchainGameRepo.saveBlockChainGameServer(gameServer);
        }
      }
    } catch (e) {
      return false;
    }
    return true;
  }

  private async _columnToArray(column: string, result: any): Promise<any[]> {
    const columns = [];
    for (const value of result) {
      columns.push(value[column]);
    }
    // 중복 제거 후 전달
    return columns.filter((item, index) => columns.indexOf(item) === index);
  }

  private async _columnToKeyObject(column: string, result: any): Promise<any> {
    const object = {};
    for (const value of result) {
      object[value[column]] = value;
    }
    return object;
  }

  private async _arrayUnique(array): Promise<any> {
    return Array.from(new Set(array));
  }
}
