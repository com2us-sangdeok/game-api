import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import {
  CodeEntity,
  CodeGroupEntity,
  CodeGroupCodeEntity,
  CompanyEntity,
  AppInfoEntity,
  CompanyNameEntity,
  GameInfoEntity,
  GameServerEntity,
  GameNameEntity,
  BlockChainGameServerEntity,
} from './common.entitty';

@Injectable()
export class CommonRepository {
  constructor(
    @InjectRepository(CodeGroupCodeEntity)
    private readonly codeGroupRepository: Repository<CodeGroupCodeEntity>,
    @InjectRepository(CompanyEntity)
    private readonly hiveCompanyRepository: Repository<CompanyEntity>,
    @InjectRepository(CompanyNameEntity)
    private readonly hiveCompanyNameRepository: Repository<CompanyNameEntity>,
    @InjectRepository(GameInfoEntity)
    private readonly hiveGameRepository: Repository<GameInfoEntity>,
    @InjectRepository(GameServerEntity)
    private readonly hiveGameServerRepository: Repository<GameServerEntity>,
    @InjectRepository(GameNameEntity)
    private readonly hiveGameNameRepository: Repository<GameNameEntity>,
    @InjectRepository(AppInfoEntity)
    private readonly appinfoRepository: Repository<AppInfoEntity>,
    @InjectRepository(BlockChainGameServerEntity)
    private readonly blockChainGameServerRepository: Repository<BlockChainGameServerEntity>,
  ) {}

  private async find(groupName: string | string[]): Promise<object> {
    return await this.codeGroupRepository
      .createQueryBuilder('CGC')
      .select([
        'CGC.cd_code AS code',
        'CD.cd_name AS name',
        'CD.cd_desc AS `desc`',
        'CGC.group_code AS groupName',
        'CGC.cgc_order AS `order`',
      ])
      .innerJoin('tb_code', 'CD', 'CGC.cd_code = CD.cd_code')
      .where('CGC.group_code IN ( :groupName )', { groupName: groupName })
      .andWhere('CGC.cgc_state = :groupState', { groupState: 1 })
      .andWhere('CD.cd_state = :codeState', { codeState: 1 })
      .orderBy('CGC.cgc_order', 'ASC')
      .getRawMany();
  }

  /**
   * Code Group을 기준으로 code와 name을 넣음
   * @param groupName
   */
  public async findCodeGroups(groupName: string | string[]): Promise<object> {
    const result = await this.find(groupName);
    const codeGroup = {};
    for (const key in result) {
      if (!Array.isArray(codeGroup[result[key].groupName]))
        codeGroup[result[key].groupName] = [];
      codeGroup[result[key].groupName].push({
        code: result[key].code,
        codeName: result[key].name,
      });
    }
    return codeGroup;
  }

  /**
   * code를 기준으로 name을 넣음
   * @param groupName
   */
  public async findCodes(groupName: string | string[]): Promise<object> {
    const result = await this.find(groupName);
    const codes = {};
    for (const key in result) {
      codes[result[key].code] = result[key].name;
    }
    return codes;
  }

  /** 하이브 게임 목록 조회 */
  private async selectHiveGames(company: number): Promise<object> {
    return await this.hiveGameRepository
      .createQueryBuilder('GI')
      .select([
        'GI.gameindex AS gameindex',
        'GI.company AS company',
        'GI.gameid AS gameid',
        'GI.icon_image AS icon_image',
        'GN.`language` AS `language`',
        'GN.`name` AS `name`',
      ])
      .innerJoin('tb_game_name', 'GN', 'GI.gameindex = GN.gameindex')
      .where('GI.company IN ( :company )', { company: company })
      .orderBy('GN.gameindex', 'DESC')
      .getRawMany();
  }

  public async selectHiveGameInfo(gameindex: number): Promise<object> {
    return await this.hiveGameRepository.findOne({
      where: { gameindex: gameindex },
    });
  }

  /**
   * Appid로 게임정보 조회
   * @param appid
   * @private
   */
  public async selectAppidHiveGame(appid: string): Promise<object> {
    return await this.appinfoRepository
      .createQueryBuilder('APP')
      .select([
        'GAME.gameindex AS gameindex',
        'GAME.company AS company',
        'GAME.gameid AS gameid',
        'GAME.icon_image AS icon_image',
        'GAME.genre AS genre',
        'GAME.hiveCertificationKey AS hiveCertificationKey',
        'APP.serviceType',
      ])
      .innerJoin('tb_game', 'GAME', 'APP.gameindex = GAME.gameindex')
      .where('APP.appid = :appid', { appid: appid })
      .getRawOne();
  }

  /**
   * 하이브 게임 서버 정보 조회
   * @param gameindex
   */
  public async selectHiveGameServer(
    gameindex: number,
  ): Promise<GameServerEntity[]> {
    return await this.hiveGameServerRepository.find({
      where: { gameindex: gameindex },
    });
  }

  public async selectHiveGameServerLists(
    gameindex: number | number[],
  ): Promise<GameServerEntity[]> {
    return await this.hiveGameServerRepository
      .createQueryBuilder()
      .select([
        'gameindex AS gameindex',
        'serverId AS serverId',
        'serverNameKO AS serverNameKO',
        'serverNameEN AS serverNameEN',
        'timezone AS timezone',
      ])
      .where('gameindex IN ( :gameindex )', { gameindex: gameindex })
      .getRawMany();
  }

  public async selectHiveBCGameServer(
    gameindex: number | number[],
  ): Promise<GameServerEntity[]> {
    return await this.hiveGameServerRepository
      .createQueryBuilder('GSI')
      .select([
        'GSI.gameindex AS gameindex',
        'GSI.serverId AS serverId',
        'GSI.serverNameKO AS serverNameKO',
        'GSI.serverNameEN AS serverNameEN',
        'GSI.timezone AS timezone',
      ])
      .innerJoin(
        'tb_blockchain_game_server',
        'BGS',
        'GSI.gameindex = BGS.gameindex AND GSI.serverId = BGS.serverId',
      )
      .where('GSI.gameindex IN ( :gameindex )', { gameindex: gameindex })
      .getRawMany();
  }

  public async selectHiveGameName(
    gameindex: number,
    language?: string,
  ): Promise<object> {
    const where: any = { gameindex: gameindex };
    if (language) {
      where.language = language;
    }
    return await this.hiveGameNameRepository.find({
      where: where,
    });
  }

  /**
   * 하이브 회사 정보 업데이트
   * @param data
   */
  public async updateHiveCompany(data: CompanyEntity): Promise<object> {
    return this.hiveCompanyRepository.save(data);
  }

  public async checkHiveCompanyInfo(company: number): Promise<boolean> {
    const count = await this.hiveCompanyRepository.count({
      where: { company: company },
    });

    return count > 0;
  }

  /**
   * 하이브 회사명 정보 조회
   * @param company
   */
  public async findHiveCompanyInfo(company: number): Promise<CompanyEntity> {
    return await this.hiveCompanyRepository.findOne({
      where: { company: company },
    });
  }

  /**
   * 하이브 회사명 언어별 업데이트
   * @param data
   */
  public async updateHiveCompanyName(data: CompanyNameEntity): Promise<object> {
    return this.hiveCompanyNameRepository.save(data);
  }

  /**
   * 하이브 회사명 언어별 업데이트
   * @param data
   */
  public async findHiveCompanyName(
    company: number,
    language?: string,
  ): Promise<object> {
    const where: any = { company: company };
    if (language) {
      where.language = language;
    }
    return await this.hiveCompanyNameRepository.find({
      where: where,
    });
  }

  /**
   * 하이브 게임 정보 업데이트
   * @param gameInfo
   */
  public async updateHiveGames(gameInfo: GameInfoEntity): Promise<object> {
    return this.hiveGameRepository.save(gameInfo);
  }

  /**
   * 하이브 게임서버 업데이트
   * @param gameServerInfo
   */
  public async updateHiveGameServer(
    gameServerInfo: GameServerEntity,
  ): Promise<object> {
    return this.hiveGameServerRepository.save(gameServerInfo);
  }

  /**
   * 하이브 게임서버 정보 삭제 (동기화 시, 특정 서버가 삭제 되었을 수 있음으로 해당 서버를 제외하기 위해 모든 서버 삭제 후 요청된 서버만 등록함)
   * @param gameindex
   */
  public async deleteHiveGameServer(gameindex: number): Promise<object> {
    return this.hiveGameServerRepository.delete({
      gameindex: gameindex,
    });
  }

  /**
   * 하이브 게임명 언어별 업데이트
   * @param gameNameInfo
   */
  public async updateHiveGameName(
    gameNameInfo: GameNameEntity,
  ): Promise<object> {
    return this.hiveGameNameRepository.save(gameNameInfo);
  }

  /**
   * 하이브 앱정보 업데이트
   * @param appInfo
   */
  public async updateHiveApps(appInfo: AppInfoEntity): Promise<object> {
    return this.appinfoRepository.save(appInfo);
  }

  /** 하이브 게임 리스트 조회 */
  public async findHiveGames(company: number): Promise<any> {
    const result = await this.selectHiveGames(company);
    const games = {};
    const lang = {};
    const hiveGames = [];
    for (const key in result) {
      if (!Object.keys(lang).includes(result[key].gameindex.toString())) {
        lang[result[key].gameindex] = {};
      }
      lang[result[key].gameindex][result[key].language] = result[key].name;
      games[result[key].gameindex] = {
        gameindex: result[key].gameindex,
        company: result[key].company,
        gameid: result[key].gameid,
        icon_image: result[key].icon_image,
      };
    }

    for (const key in games) {
      hiveGames.push({
        gameindex: games[key].gameindex,
        company: games[key].company,
        gameid: games[key].gameid,
        icon_image: games[key].icon_image,
        name: lang[games[key].gameindex],
      });
    }

    return hiveGames;
  }

  public async findAppInfo(
    gameindex: number,
    market?: string,
  ): Promise<AppInfoEntity> {
    const where: any = { gameindex: gameindex };
    if (market) {
      where.market = market;
    }
    return await this.appinfoRepository.findOne({
      where: where,
    });
  }

  public async findAppIdInfo(appid: string): Promise<AppInfoEntity> {
    return await this.appinfoRepository.findOne({
      where: { appid: appid },
    });
  }

  public async findAppLists(
    gameindex: number[],
    market: string,
  ): Promise<AppInfoEntity[]> {
    return await this.appinfoRepository
      .createQueryBuilder()
      .select(['gameindex AS gameindex', 'appid AS appid'])
      .where('gameindex IN ( :gameindex )', { gameindex: gameindex })
      .andWhere('market IN ( :market )', { market: market })
      .getRawMany();
  }

  /**
   * 블록체인게임설정에 설정한 게임서버 정보
   * @param bgiId
   */
  public async selectBlockChainGameServer(
    bgiId: number | number[],
  ): Promise<BlockChainGameServerEntity[]> {
    return await this.blockChainGameServerRepository
      .createQueryBuilder()
      .select([
        'bgi_id AS bgiId',
        'gameindex AS gameindex',
        'serverId AS serverId',
        'serverNameKO AS serverNameKO',
        'serverNameEN AS serverNameEN',
        'timezone AS timezone',
      ])
      .where('bgi_id IN ( :bgiId )', { bgiId: bgiId })
      .getRawMany();
  }
}
