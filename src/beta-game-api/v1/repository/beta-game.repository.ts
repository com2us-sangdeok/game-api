import { Repository, UpdateResult } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { BetaGameEntity } from '../../../entities/beta-game.entity';
import {
  FilterOperator,
  paginate,
  Paginated,
  PaginateQuery,
} from 'nestjs-paginate';

@Injectable()
export class BetagameRepository {
  constructor(
    @InjectRepository(BetaGameEntity)
    private readonly infoRepo: Repository<BetaGameEntity>,
  ) {}

  /**
   * id 를 이용하여 등록된 정보가 있는지 확인함
   * @param id
   */
  public async checkId(id: number): Promise<boolean> {
    const count = await this.infoRepo
      .createQueryBuilder()
      .where('bli_id = :id', { id: id })
      .getCount();
    return count > 0;
  }

  /**
   * 특정 회사 게임 목록 중, 등록된 게임의 gameindex만 조회함
   * @param company
   * @param gameindex
   */
  public async regBetaGame(
    company: number,
    gameindex: number[],
  ): Promise<number[]> {
    return await this.infoRepo
      .createQueryBuilder()
      .select(['gameindex AS gameindex'])
      .where('company IN ( :company )', { company: company })
      .andWhere('gameindex IN ( :gameindex )', { gameindex: gameindex })
      .getRawMany();
  }

  /**
   * 고유 식별 코드로 상세 정보 조회
   * @param id : number
   */
  public async selectId(id: number): Promise<BetaGameEntity> {
    return await this.infoRepo.findOne({ where: { id: id } });
  }

  /**
   * 베타게임런처 상세 정보 조회
   * @param entity
   */
  public async select(entity: BetaGameEntity): Promise<BetaGameEntity> {
    return await this.infoRepo.findOne({ where: { bliId: entity.bliId } });
  }

  /**
   * 베타게임 런처 정보 신규 등록 후, id 값 리턴
   * @param betagameLauncherInfoEntity
   */
  public async insert(entity: BetaGameEntity): Promise<number> {
    const insert = await this.infoRepo
      .createQueryBuilder()
      .insert()
      .into(BetaGameEntity)
      .values(entity)
      .execute();
    return insert.raw.insertId;
  }

  /**
   * 진행현황 목록 조회 (페이징)
   * @param query
   */
  public async selectLists(
    query: PaginateQuery,
  ): Promise<Paginated<BetaGameEntity>> {
    const queryBuilder = this.infoRepo
      .createQueryBuilder('cats')
      .where('progress_status_cd IN ( :progressStatusCd )', {
        progressStatusCd: query.filter.progressStatusCd,
      });

    return paginate(query, queryBuilder, {
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
   * 베타게임런처 현황 정보 업데이트
   * @param id
   * @param entity
   */
  public async update(
    id: number,
    entity: BetaGameEntity,
  ): Promise<UpdateResult> {
    return await this.infoRepo.update({ bliId: id }, entity);
  }

  /**
   * 베타게임런처 임시저장 또는 신청 완료에 따른 변경 사항 업데이트
   * @param id
   * @param entity
   */
  public async applyUpdate(
    id: number,
    entity: BetaGameEntity,
  ): Promise<UpdateResult> {
    return await this.infoRepo.update({ bliId: id }, entity);
  }
}
