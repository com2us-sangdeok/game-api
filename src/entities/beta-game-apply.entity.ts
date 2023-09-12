import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import format from 'date-fns/format';
import parseJSON from 'date-fns/parseJSON';

@Entity('tb_betagame_launcher_info')
@Index('betagame_launcher_idx_01', ['company', 'gameindex'])
@Unique('betagame_launcher_uniq_01', ['tokenName'])
export class BetaGameApplyEntity {
  @PrimaryGeneratedColumn({ name: 'bli_id', unsigned: true })
  id: number;

  @Column({
    type: 'int',
    name: 'company',
    unsigned: true,
    comment: 'tb_company 고유번호 (Hive Console 의 회사 고유 식별 번호)',
  })
  company: number;

  @Column({
    type: 'int',
    name: 'gameindex',
    unsigned: true,
    comment:
      'tb_game_info 고유번호 (Hive Console 에 등록된 게임의 고유 식별 번호)',
  })
  gameindex: number;

  @Column({
    type: 'text',
    name: 'game_intro',
    comment: '게임소개(요약)',
  })
  gameIntro: string;

  @Column({
    type: 'text',
    name: 'game_intro_detail',
    comment: '게임소개(상세)',
  })
  gameIntroDetail: string;

  @Column({
    type: 'varchar',
    length: 255,
    name: 'game_genre',
    comment: '게임 장르',
  })
  gameGenre: string;

  @Column({
    type: 'text',
    name: 'android_down_link',
    comment: 'android 다운로드 링크',
  })
  androidDownLink: string;

  @Column({
    type: 'text',
    name: 'ios_down_link',
    comment: 'ios 다운로드 링크',
  })
  iosDownLink: string;

  @Column({
    type: 'text',
    name: 'pc_down_link',
    comment: 'pc 다운로드 링크',
  })
  pcDownLink: string;

  @Column({
    type: 'char',
    length: 12,
    name: 'develop_status_cd',
    comment:
      '개발 상태 - 개발중 : 1001000201, CBT : 1001000202, 사전예약 : 1001000203, 소프트 런칭 : 1001000204, 런칭 : 1001000205, 기타 : 1001000206',
  })
  developStatusCd: string;

  @Column({
    type: 'varchar',
    length: 255,
    name: 'develop_status_additional_text',
    default: null,
    comment: '개발 상태 추가 입력 정보',
  })
  developStatusAdditionalText: string;

  @Column({
    type: 'char',
    length: 12,
    name: 'register_status_cd',
    comment: '진행상황 - 임시저장: 1001000301, 접수완료: 1001000302',
  })
  registerStatusCd?: string;

  @Column({
    type: 'datetime',
    name: 'release_datetime',
    comment: '출시 예정일',
  })
  releaseDatetime: string;

  @Column({
    type: 'char',
    length: 12,
    name: 'token_name',
    comment: '게임 재화의 토큰명',
  })
  tokenName: string;

  @Column({
    type: 'varchar',
    length: 255,
    name: 'fan_card_token_name',
    comment: '팬카드 토큰 명',
  })
  fanCardTokenName: string;

  @Column({
    type: 'text',
    name: 'fan_card_description',
    comment: '팬카드 토큰 설명',
  })
  fanCardDescription: string;

  @Column({
    type: 'text',
    name: 'game_provider_address',
    comment:
      '토큰 분배 등 프로바이더에게 지급 되는 물량에 대한 Terra/C2X의 지갑 주소 입니다.',
  })
  gameProviderAddress: string;

  @Column({
    type: 'datetime',
    name: 'fan_card_sales_start_datetime',
    comment: '팬카드 판매 시작 일',
  })
  fanCardSalesStartDatetime: string;

  @Column({
    type: 'datetime',
    name: 'fan_card_sales_end_datetime',
    comment: '팬카드 판매 종료 일',
  })
  fanCardSalesEndDatetime: string;

  @Column({
    type: 'datetime',
    name: 'beta_test_start_datetime',
    comment: '베타 테스트 시작일',
  })
  betaTestStartDatetime: string;

  @Column({
    type: 'datetime',
    name: 'beta_test_end_datetime',
    comment: '베타 테스트 종료일',
  })
  betaTestEndDatetime: string;

  @Column({
    type: 'bigint',
    name: 'fan_card_target_quantity',
    comment: '팬카드 판매 목표 수량',
  })
  fanCardTargetQuantity: number;

  @Column({
    type: 'decimal',
    name: 'fan_card_unit_price',
    default: '0.000000',
    unsigned: true,
    comment: '팬카드 개당 가격',
  })
  fanCardUnitPrice: string;

  @Column({
    type: 'tinyint',
    name: 'distribution_type',
    comment:
      '1. Convert pool 사용 , 36개월 균등 지급, 매 달 수익 정산 진행\n' +
      '2. Convert pool 사용 , 비선형적 지급 방식 , 매 달 수익 정산 진행\n' +
      '3. Convert pool 사용 , 물량 일괄 배분(일부 Reserve로 남겨둠) , 수익 정산 진행 X\n' +
      '4. 전환비 사용 , 수익 정산 진행 X',
  })
  distributionType: number;

  @Column({
    type: 'int',
    name: 'xpla_convert_pool_initial_ratio',
    comment: 'XPLA Convert pool 초기 비율 설정 (XPLA)',
  })
  xplaConvertPoolInitialRatio: string;

  @Column({
    type: 'decimal',
    name: 'xpla_convert_pool_initial_ratio_goods',
    comment: 'XPLA Convert pool 초기 비율 설정 (게임재화)',
  })
  xplaConvertPoolInitialRatioGoods: string;

  @Column({
    type: 'int',
    name: 'game_token_convert_pool_initial_ratio',
    comment: '게임토큰 Convert pool 초기 비율 설정(게임토큰)',
  })
  gameTokenConvertPoolInitialRatio: string;

  @Column({
    type: 'decimal',
    name: 'game_token_convert_pool_initial_ratio_goods',
    comment: '게임토큰 Convert pool 초기 비율 설정(게임재화)',
  })
  gameTokenConvertPoolInitialRatioGoods: string;

  @CreateDateColumn({
    type: 'datetime',
    name: 'reg_datetime',
    comment: '최초 등록일',
  })
  createAt?: string;

  @Column({
    type: 'varchar',
    length: 45,
    name: 'reg_admin',
    comment: '최초 등록 관리자',
  })
  createAdmin: string;

  @UpdateDateColumn({
    type: 'datetime',
    name: 'mod_datetime',
    default: null,
    comment: '최근 수정일',
  })
  updateAt: string;

  @Column({
    type: 'varchar',
    length: 45,
    name: 'mod_admin',
    default: null,
    comment: '최근 수정 관리자',
  })
  updateAdmin: string;
}

/**
 * 베타게임 런처 신청 이미지 정보
 */
@Entity('tb_betagame_launcher_images')
@Unique('betagame_launcher_images_uniq_01', ['fileName'])
@Index('betagame_launcher_images_idx_01', ['bliId', 'sortOrder'])
export class BetaGameImagesEntity {
  @PrimaryGeneratedColumn({ name: 'id', unsigned: true })
  id: number;

  @PrimaryColumn({ type: 'int', name: 'bli_id', unsigned: true })
  bliId: number;

  @Column({
    type: 'tinyint',
    name: 'type',
    unsigned: true,
    comment:
      '이미지 타입 ( 1: 썸네일이미지, 2: 스크린샷, 3: 게임토큰, 4: 팬카드)',
  })
  type: number;

  @Column({
    type: 'varchar',
    length: 255,
    name: 'file_name',
    comment: '파일명',
  })
  fileName: string;

  @Column({
    type: 'tinyint',
    name: 'sort_order',
    unsigned: true,
    comment: '정렬순서',
  })
  sortOrder: number;
}

/**
 * 앱 다운로드 링크 및 각종 채널 링크 정보
 */
@Entity('tb_betagame_launcher_service_link')
@Index('betagame_launcher_service_link_idx_01', ['bliId'])
export class BetaGameLinkEntity {
  @PrimaryColumn({ type: 'int', name: 'bli_id', unsigned: true })
  bliId: number;

  @Column({
    type: 'varchar',
    length: 12,
    name: 'service_link_type_cd',
    comment:
      '게임 채널 링크 정보 - ' +
      '게임 동영상 링크 : 1001000401, ' +
      '공식 사이트 주소 : 1001000402, ' +
      'Google Play 링크 : 1001000403, ' +
      'App Store 링크 : 1001000404, ' +
      '디스코드 채널 : 1001000405, ' +
      '텔레그램 채널 : 1001000406, ' +
      '트위터 계정 : 1001000407, ' +
      '미디엄 페이지 : 1001000408, ' +
      '기타 커뮤니티 : 1001000409',
  })
  serviceLinkTypeCd: string;

  @Column({ type: 'text', name: 'service_link', comment: '링크 주소' })
  serviceLink: string;
}
