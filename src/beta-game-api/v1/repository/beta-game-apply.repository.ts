import { DeleteResult, InsertResult, Repository, UpdateResult } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import {
  BetaGameApplyEntity,
  BetaGameLinkEntity,
  BetaGameImagesEntity,
} from '../../../entities/beta-game-apply.entity';

@Injectable()
export class BetagameApplyRepository {
  constructor(
    @InjectRepository(BetaGameApplyEntity)
    private readonly infoRepo: Repository<BetaGameApplyEntity>,
    @InjectRepository(BetaGameLinkEntity)
    private readonly linkRepo: Repository<BetaGameLinkEntity>,
    @InjectRepository(BetaGameImagesEntity)
    private readonly imageRepo: Repository<BetaGameImagesEntity>,
  ) {}

  /**
   * 회사와 게임정보로 임시저장 또는 신청한 내역이 있는지 확인함.
   * @param compnay
   * @param gameindex
   * @return true : 중복 | false : 등록 정보 없음
   */
  public async overlap(compnay: number, gameindex: number): Promise<boolean> {
    const overlap = await this.infoRepo
      .createQueryBuilder()
      .where('company = :company', { company: compnay })
      .andWhere('gameindex = :gameindex', { gameindex: gameindex })
      .getCount();
    return overlap > 0;
  }

  /**
   * 게임 토큰명이 존재 하는지 확인
   * @param company
   * @param gameindex
   * @param tokenName
   */
  public async gameTokenOverlap(
    gameindex: number,
    tokenName: string,
  ): Promise<boolean> {
    const overlap = await this.infoRepo
      .createQueryBuilder()
      .andWhere('gameindex != :gameindex', { gameindex: gameindex })
      .andWhere('token_name = :TokenName', { TokenName: tokenName })
      .getCount();
    return overlap > 0;
  }

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
   * 베타게임 런처 정보 신규 등록 후, id 값 리턴
   * @param BetaGameApplyEntity
   */
  public async insert(entity: BetaGameApplyEntity): Promise<number> {
    const insert = await this.infoRepo
      .createQueryBuilder()
      .insert()
      .into(BetaGameApplyEntity)
      .values(entity)
      .execute();
    return insert.raw.insertId;
  }

  /**
   * 베타게임 런처의 언어별 게임 설명 정보 등록
   * @param entity BetaGameLinkEntity | BetaGameLinkEntity[]
   */
  public async insertServiceLink(
    entity: BetaGameLinkEntity | BetaGameLinkEntity[],
  ): Promise<InsertResult> {
    return await this.linkRepo
      .createQueryBuilder()
      .insert()
      .into(BetaGameLinkEntity)
      .values(entity)
      .execute();
  }

  /**
   * 베타게임 런처 이미지 등록 (S3에 등록 후, 링크를 저장함)
   * @param entity
   */
  public async insertImages(
    entity: BetaGameImagesEntity | BetaGameImagesEntity[],
  ): Promise<InsertResult> {
    return await this.imageRepo
      .createQueryBuilder()
      .insert()
      .into(BetaGameImagesEntity)
      .values(entity)
      .execute();
  }

  /**
   * 베타게임 런처 기본정보 업데이트
   * @param id
   * @param BetaGameApplyEntity
   */
  public async update(
    id: number,
    entity: BetaGameApplyEntity,
  ): Promise<UpdateResult> {
    return await this.infoRepo.update({ id: id }, entity);
  }

  /**
   * 게임 관련 링크 정보 삭제
   * @param id
   */
  public async deleteLink(id: number): Promise<DeleteResult> {
    return await this.linkRepo.delete({ bliId: id });
  }

  /**
   * 고유 식별 코드로 상세 정보 조회
   * @param id : number
   */
  public async selectId(id: number): Promise<BetaGameApplyEntity> {
    return await this.infoRepo.findOne({ where: { id: id } });
  }

  /**
   * 회사와 게임 고유 식별 코드로 상세 정보 조회
   * @param id
   */
  public async selectCompanyGame(
    company: number,
    gameindex: number,
  ): Promise<BetaGameApplyEntity> {
    return await this.infoRepo.findOne({
      where: { company: company, gameindex: gameindex },
    });
  }

  /**
   * 게임 링크 정보 조회
   * @param id
   */
  public async selectLink(
    id: number | number[],
  ): Promise<BetaGameLinkEntity[]> {
    let ids = [];
    let select = [];
    if (!Array.isArray(id)) {
      ids.push(id);
      select = [
        'service_link_type_cd AS serviceLinkTypeCd',
        'service_link AS serviceLink',
      ];
    } else {
      ids = id;
      select = [
        'bli_id AS bliId',
        'service_link_type_cd AS serviceLinkTypeCd',
        'service_link AS serviceLink',
      ];
    }
    return await this.linkRepo
      .createQueryBuilder()
      .select(select)
      .where('bli_id IN (:id)', { id: ids })
      .getRawMany();
  }

  /**
   * 베타게임런처 접수 고유 번호를 이용한 이미지 정보 조회
   * @param id : number 배타게임런처 고유 번호
   */
  public async selectImages(id: number): Promise<BetaGameImagesEntity[]> {
    return await this.imageRepo
      .createQueryBuilder()
      .select([
        'id AS id',
        'bli_id AS bliId',
        'type AS type',
        'file_name AS fileName',
        'sort_order AS sortOrder',
      ])
      .where('bli_id IN (:id)', { id: id })
      .getRawMany();
  }

  /**
   * 이미지 고유 식별 코드로 삭제
   * @param id
   */
  public async deleteImage(id: number): Promise<DeleteResult> {
    return await this.imageRepo.delete({ id: id });
  }
}
