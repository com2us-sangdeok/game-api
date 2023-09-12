import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import {
  BlockchainGameEntitty,
  BlockchainGameApiInfoEntity,
  BlockchainGameApiTestInfoEntity,
  ConvertSettingInfoEntity,
  MintCategorySettingInfoEntity,
  MintFeeInfoEntity,
} from '../../../entities/blockchain-game.entitty';
import {
  FilterOperator,
  paginate,
  Paginated,
  PaginateQuery,
} from 'nestjs-paginate';
import { BetaGameEntity } from '../../../entities/beta-game.entity';

@Injectable()
export class GameCommonApiRepository {
  constructor(
    @InjectRepository(BlockchainGameEntitty)
    private readonly gameRepo: Repository<BlockchainGameEntitty>,
    @InjectRepository(BlockchainGameApiInfoEntity)
    private readonly gameApiRepo: Repository<BlockchainGameApiInfoEntity>,
    @InjectRepository(ConvertSettingInfoEntity)
    private readonly convertSettingRepo: Repository<ConvertSettingInfoEntity>,
    @InjectRepository(BlockchainGameApiTestInfoEntity)
    private readonly gameApiTestRepo: Repository<BlockchainGameApiTestInfoEntity>,
    @InjectRepository(MintCategorySettingInfoEntity)
    private readonly mintCategorySettingRepo: Repository<MintCategorySettingInfoEntity>,
    @InjectRepository(MintFeeInfoEntity)
    private readonly mintFeeRepo: Repository<MintFeeInfoEntity>,
    @InjectRepository(BetaGameEntity)
    private readonly betagameRepo: Repository<BetaGameEntity>,
  ) {}

  /**
   * 게임 설정 데이터가 있는지 확인
   * @param gameindex
   */
  async checkGameindex(gameindex: number): Promise<boolean> {
    const counrt = await this.gameRepo
      .createQueryBuilder()
      .where('gameindex = :gameindex', { gameindex: gameindex })
      .getCount();
    return counrt > 0;
  }

  async checkAppId(appid: string): Promise<boolean> {
    const counrt = await this.gameRepo
      .createQueryBuilder()
      .where('appid = :appid', { appid: appid })
      .getCount();
    return counrt > 0;
  }

  /**
   * 목록 조회 (페이징)
   * @param query
   */
  public async selectLists(
    query: PaginateQuery,
  ): Promise<Paginated<BlockchainGameEntitty>> {
    return paginate(query, this.gameRepo, {
      sortableColumns: [
        'betagameLauncherId',
        'gameindex',
        'appid',
        'gameTokenName',
        'gameTokenImage',
        'settingCompleteTypeCd',
        'apiSettingCompleteTypeCd',
        'activeTypeCd',
        'mintActiveTypeCd',
        'unionMintActiveTypeCd',
        'charMintActiveTypeCd',
        'characterSelect',
        'channelSelect',
      ],
      defaultSortBy: [['id', 'DESC']],
      filterableColumns: {
        /*
        EQ   = $eq   // 값 일치
        GT   = $gt   // 초과
        GTE  = $gte  // 이상
        IN   = $in   // key 동일
        NULL = $null // 널인것만
        LT   = $lt   // 미만
        LTE  = $lte  // 이하
        BTW  = $btw  // $btw
        NOT  = $not  // 조건이 아닌것
         */
        gameindex: [FilterOperator.EQ],
        activeTypeCd: [FilterOperator.EQ],
        // 검색조건 제외로 일단 주석
        // fanCardSalesStartDatetime: [FilterOperator.GTE],
        // fanCardSalesEndDatetime: [FilterOperator.LTE],
      },
    });
  }

  /**
   * 게임 설정 상세 정보 조회
   * @param gameindex: number
   */
  public async selectBlockChainGame(
    gameindex: number,
  ): Promise<BlockchainGameEntitty> {
    return await this.gameRepo.findOne({ where: { gameindex: gameindex } });
  }

  /**
   * 게임 설정 상세 정보 조회 (appid)
   * @param appid: string
   */
  public async selectBlockChainGameAppid(
    appid: string,
  ): Promise<BlockchainGameEntitty> {
    return await this.gameRepo.findOne({ where: { appid: appid } });
  }

  /**
   * 게임 API 조회
   * @param ids
   */
  public async selectGameApi(
    ids: number | number[],
  ): Promise<BlockchainGameApiInfoEntity[]> {
    return await this.gameApiRepo
      .createQueryBuilder()
      .select([
        'bgi_id AS bgiID',
        'api_type_cd AS apiTypeCd',
        'api_url AS apiUrl',
      ])
      .where('bgi_id IN (:id)', { id: ids })
      .getRawMany();
  }

  /**
   * 게임 TEST API 조회
   * @param ids
   */
  public async selectGameTestApi(
    ids: number | number[],
  ): Promise<BlockchainGameApiTestInfoEntity[]> {
    return await this.gameApiTestRepo
      .createQueryBuilder()
      .select([
        'bgi_id AS bgiID',
        'api_type_cd AS apiTypeCd',
        'api_url AS apiUrl',
      ])
      .where('bgi_id IN (:id)', { id: ids })
      .getRawMany();
  }

  /**
   * 민트 카테고리 세팅 정보 조회
   * @param ids
   */
  public async selectMintCategory(
    ids: number | number[],
  ): Promise<MintCategorySettingInfoEntity[]> {
    return await this.mintCategorySettingRepo
      .createQueryBuilder()
      .select([
        'mcsi_id AS id',
        'bgi_id AS bgiId',
        'active_type_cd AS activeTypeCd',
        'mint_type_cd AS mintTypeCd',
        'name',
      ])
      .where('bgi_id IN (:id)', { id: ids })
      .getRawMany();
  }

  /**
   * 카테고리 고유 번호로 카테고리 정보 조회
   * @param ids
   */
  public async selectMintCategoryId(
    id: number,
  ): Promise<MintCategorySettingInfoEntity> {
    // return await this.mintCategorySettingRepo
    //   .createQueryBuilder()
    //   .select([
    //     'mcsi_id AS id',
    //     'bgi_id AS bgiId',
    //     'active_type_cd AS activeTypeCd',
    //     'mint_type_cd AS mintTypeCd',
    //     'name',
    //   ])
    //   .where('mcsi_id IN (:id)', { id: ids })
    //   .getRawMany();

    return await this.mintCategorySettingRepo.findOne({ where: { id: id } });
  }

  /**
   * 민트 카테고리 세팅 정보 조회
   * @param ids
   */
  public async selectMintFee(
    ids: number | number[],
  ): Promise<MintFeeInfoEntity[]> {
    return await this.mintFeeRepo
      .createQueryBuilder()
      .select([
        'bgi AS id',
        'mint_type_cd AS mintTypeCd',
        'xpla_fee AS xplaFee',
        'game_token_fee AS gameTokenFee',
        'mint_count AS mintCount',
      ])
      .where('bgi_id IN (:id)', { id: ids })
      .getRawMany();
  }

  /**
   * 컨버트 세팅 정보 조회
   * @param ids
   */
  public async selectConvert(
    ids: number | number[],
  ): Promise<ConvertSettingInfoEntity[]> {
    return await this.convertSettingRepo
      .createQueryBuilder()
      .select([
        'bgi_id AS bgiId',
        'convert_type_cd AS convertTypeCd',
        'goods_name AS goodsName',
        'goods_code AS goodsCode',
        'goods_image as goodsImage',
        'min_convert_quantity_one_time AS minConvertQuantityOneTime',
        'max_convert_quantity_days AS maxConvertQuantityDays',
      ])
      .where('bgi_id IN (:id)', { id: ids })
      .getRawMany();
  }

  /**
   * 컨트렉트 및 지갑등 주소 정보
   * @param ids
   */
  public async selectFeeInfo(
    ids: number | number[],
  ): Promise<MintFeeInfoEntity[]> {
    return await this.mintFeeRepo
      .createQueryBuilder()
      .select([
        'mcsi_id AS mcsiId',
        'bgi_id AS bgiId',
        'xpla_fee AS xplaFee',
        'game_token_fee AS gameTokenFee',
        'mint_count AS mintCount',
      ])
      .where('mcsi_id IN (:id)', { id: ids })
      .getRawMany();
  }

  public async selectBetaGameInfo(id: number): Promise<BetaGameEntity> {
    return await this.betagameRepo.findOne({
      where: {
        id: id,
      },
    });
  }
}
