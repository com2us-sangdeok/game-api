import { DeleteResult, InsertResult, Repository, UpdateResult } from 'typeorm';
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
import { BlockChainGameServerEntity } from '../../../commom/repository/common.entitty';

@Injectable()
export class BlockchainGameRepository {
  constructor(
    @InjectRepository(BlockchainGameEntitty)
    private readonly gameRepo: Repository<BlockchainGameEntitty>,
    @InjectRepository(BlockchainGameApiInfoEntity)
    private readonly gameApiRepo: Repository<BlockchainGameApiInfoEntity>,
    @InjectRepository(BlockchainGameApiTestInfoEntity)
    private readonly gameApiTestRepo: Repository<BlockchainGameApiTestInfoEntity>,
    @InjectRepository(ConvertSettingInfoEntity)
    private readonly convertSettingRepo: Repository<ConvertSettingInfoEntity>,
    @InjectRepository(MintCategorySettingInfoEntity)
    private readonly mintCategorySettingRepo: Repository<MintCategorySettingInfoEntity>,
    @InjectRepository(MintFeeInfoEntity)
    private readonly mintFeeRepo: Repository<MintFeeInfoEntity>,
    @InjectRepository(BlockChainGameServerEntity)
    private readonly blockChainGameServerRepository: Repository<BlockChainGameServerEntity>,
  ) {}

  /**
   * 회사와 게임정보로 임시저장 또는 저장된 내역이 있는지 확인함.
   * @param compnay
   * @param gameindex
   * @return true : 중복 | false : 등록 정보 없음
   */
  public async overlap(company: number, gameindex: number): Promise<boolean> {
    const overlap = await this.gameRepo
      .createQueryBuilder()
      .andWhere('gameindex = :gameindex', { gameindex: gameindex })
      .getCount();
    return overlap > 0;
  }

  /**
   * id 를 이용하여 등록된 정보가 있는지 확인함
   * @param id
   */
  public async checkId(id: number): Promise<boolean> {
    const count = await this.gameRepo
      .createQueryBuilder()
      .where('bgi_id = :id', { id: id })
      .getCount();
    return count > 0;
  }

  /**
   * 블록체인 게임 등록 후 ID 반환
   * @param entity: BlockchainGameEntitty
   */
  public async insert(entity: BlockchainGameEntitty): Promise<number> {
    const insert = await this.gameRepo
      .createQueryBuilder()
      .insert()
      .into(BlockchainGameEntitty)
      .values(entity)
      .execute();
    return insert.raw.insertId;
  }

  /**
   * 블록체인게임 기본정보 업데이트
   * @param id
   * @param entity
   */
  public async update(
    id: number,
    entity: BlockchainGameEntitty,
  ): Promise<UpdateResult> {
    return await this.gameRepo.update({ id: id }, entity);
  }

  /**
   * 목록 조회 (페이징)
   * @param query
   */
  public async selectLists(
    query: PaginateQuery,
  ): Promise<Paginated<BlockchainGameEntitty>> {
    return paginate(query, this.gameRepo, {
      sortableColumns: ['id', 'createAt', 'updateAt'],
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
        company: [FilterOperator.EQ],
        gameindex: [FilterOperator.EQ],
        // 검색조건 제외로 일단 주석
        // fanCardSalesStartDatetime: [FilterOperator.GTE],
        // fanCardSalesEndDatetime: [FilterOperator.LTE],
      },
    });
  }

  /**
   * 게임 설정 상세 정보 조회
   * @param id: number
   */
  public async selectBlockChainGame(
    id: number,
  ): Promise<BlockchainGameEntitty> {
    return await this.gameRepo.findOne({ where: { id: id } });
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
        'verification AS verification',
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
        'verification AS verification',
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
   * 민트 카테고리 세팅 정보 조회
   * @param ids
   */
  public async selectMintFee(
    ids: number | number[],
  ): Promise<MintFeeInfoEntity[]> {
    return await this.mintFeeRepo
      .createQueryBuilder()
      .select([
        'bgi_id AS bgiId',
        'mcsi_id AS mcsiId',
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
        'goods_image AS goodsImage',
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

  /**
   * 민팅 카테고리 정보 등록
   * @param id
   * @param entity
   */
  public async insertCategory(
    entity: MintCategorySettingInfoEntity | MintCategorySettingInfoEntity[],
  ): Promise<number> {
    const insert = await this.mintCategorySettingRepo
      .createQueryBuilder()
      .insert()
      .into(MintCategorySettingInfoEntity)
      .values(entity)
      .execute();
    return insert.raw.insertId;
  }

  /**
   * 민팅 카테고리 정보 삭제
   * @param id
   */
  public async deleteCategory(id: number): Promise<DeleteResult> {
    return await this.mintCategorySettingRepo.delete({ bgiId: id });
  }

  /**
   * 컨버트 정보 등록
   * @param id
   * @param entity
   */
  public async insertConvert(
    entity: ConvertSettingInfoEntity | ConvertSettingInfoEntity[],
  ): Promise<DeleteResult> {
    return await this.convertSettingRepo
      .createQueryBuilder()
      .insert()
      .into(ConvertSettingInfoEntity)
      .values(entity)
      .execute();
  }

  /**
   * 컨버트 정보 삭제
   * @param id
   */
  public async deleteConvert(id: number): Promise<DeleteResult> {
    return await this.convertSettingRepo.delete({ bgiId: id });
  }

  /**
   * 컨버트 정보 등록
   * @param id
   * @param entity
   */
  public async insertFee(
    entity: MintFeeInfoEntity | MintFeeInfoEntity[],
  ): Promise<DeleteResult> {
    return await this.mintFeeRepo
      .createQueryBuilder()
      .insert()
      .into(MintFeeInfoEntity)
      .values(entity)
      .execute();
  }

  /**
   * 컨버트 정보 삭제
   * @param id : number (tb_blockchain_game_info 의 고유번호)
   */
  public async deleteFee(id: number): Promise<DeleteResult> {
    return await this.mintFeeRepo.delete({ bgiId: id });
  }

  /**
   * API 정보 등록
   * @param id
   * @param entity
   */
  public async insertApi(
    entity: BlockchainGameApiInfoEntity | BlockchainGameApiInfoEntity[],
  ): Promise<DeleteResult> {
    return await this.gameApiRepo
      .createQueryBuilder()
      .insert()
      .into(BlockchainGameApiInfoEntity)
      .values(entity)
      .execute();
  }

  /**
   * API 정보 삭제
   * @param id
   */
  public async deleteApi(id: number): Promise<DeleteResult> {
    return await this.gameApiRepo.delete({ bgiId: id });
  }

  /**
   * API 정보 등록
   * @param id
   * @param entity
   */
  public async insertApiTest(
    entity: BlockchainGameApiTestInfoEntity | BlockchainGameApiTestInfoEntity[],
  ): Promise<DeleteResult> {
    return await this.gameApiTestRepo
      .createQueryBuilder()
      .insert()
      .into(BlockchainGameApiTestInfoEntity)
      .values(entity)
      .execute();
  }

  /**
   * API 정보 삭제
   * @param id
   */
  public async deleteApiTest(id: number): Promise<DeleteResult> {
    return await this.gameApiTestRepo.delete({ bgiId: id });
  }

  /**
   * 민트카테고리 활성 여부 확인
   * @param id
   */
  public async checkMintActive(id: number): Promise<boolean> {
    // 활성: 1001000601
    return (
      (await this.mintCategorySettingRepo
        .createQueryBuilder()
        .where('bgi_id IN (:id)', { id: id })
        .andWhere('active_type_cd = :typeCd', { typeCd: '1001000601' })
        .getCount()) > 0
    );
  }

  /**
   * 컨버트 활성 여부 확인
   * @param id
   */
  public async checkConvertActive(id: number): Promise<boolean> {
    // 활성: 1001000601
    return (
      (await this.convertSettingRepo
        .createQueryBuilder()
        .where('bgi_id IN (:id)', { id: id })
        .andWhere('active_type_cd = :typeCd', { typeCd: '1001000601' })
        .getCount()) > 0
    );
  }

  /**
   * 운영설정 ON / OFF
   * @param id
   * @param typeCd
   */
  public async gameActive(id: number, typeCd: string): Promise<UpdateResult> {
    // 활성: 1001000601, 비활성: 1001000602
    return await this.gameRepo.update({ id: id }, { activeTypeCd: typeCd });
  }

  public async blockchainGameLists(company: number): Promise<any> {
    return await this.gameRepo
      .createQueryBuilder('BGI')
      .select([
        'BGI.company AS company',
        'BGI.gameindex AS gameindex',
        'BGI.appid AS appid',
        "( SELECT `name` FROM tb_game_name WHERE BGI.gameindex = gameindex AND `language` IN ('ko') order by language DESC ) AS ko",
        "( SELECT `name` FROM tb_game_name WHERE BGI.gameindex = gameindex AND `language` IN ('en') order by language DESC ) AS en",
      ])
      .where('BGI.company = :company', { company: company })
      .orderBy('BGI.gameindex', 'ASC')
      .getRawMany();
  }

  public async saveBlockChainGameServer(
    blockChainGameServer: BlockChainGameServerEntity,
  ): Promise<BlockChainGameServerEntity> {
    return this.blockChainGameServerRepository.save(blockChainGameServer);
  }

  public async deleteBlockChainGameServer(
    bgiId: number,
  ): Promise<DeleteResult> {
    return await this.blockChainGameServerRepository.delete({ bgiId: bgiId });
  }
}
