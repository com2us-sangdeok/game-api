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

/**
 * 베타게임 런처 승인 정보
 */
@Entity('tb_betagame_launcher_confirm_info')
@Unique('betagame_launcher_uniq_01', ['bliId'])
@Index('betagame_launcher_idx_01', [
  'company',
  'gameindex',
  'progressStatusCd',
  'fanCardSalesStartDatetime',
  'fanCardSalesEndDatetime',
])
export class BetaGameEntity {
  @PrimaryGeneratedColumn({ name: 'blci_id' })
  id: number;

  @PrimaryColumn({ type: 'int', name: 'bli_id', unsigned: true })
  bliId: number;

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
    type: 'char',
    length: 12,
    name: 'progress_status_cd',
    comment:
      '진행 현황 - 대기중: 1001000101, 진행중: 1001000102, 완료: 1001000103',
  })
  progressStatusCd: string;

  @Column({
    type: 'char',
    length: 12,
    name: 'register_status_cd',
    comment: '진행 현황 - 임시저장: 1001000301, 접수완료: 1001000302',
  })
  registerStatusCd: string;

  @Column({
    type: 'datetime',
    name: 'fan_card_sales_start_datetime',
    comment: '팬카드 판매 기간',
  })
  fanCardSalesStartDatetime: string;

  @Column({
    type: 'datetime',
    name: 'fan_card_sales_end_datetime',
    comment: '팬카드 판매 기간',
  })
  fanCardSalesEndDatetime: string;

  @Column({
    type: 'datetime',
    name: 'beta_test_start_datetime',
    comment: '베타게임 테스트 기간',
  })
  betaTestStartDatetime: string;

  @Column({
    type: 'datetime',
    name: 'beta_test_end_datetime',
    comment: '베타게임 테스트 기간',
  })
  betaTestEndDatetime: string;

  @Column({
    type: 'bigint',
    name: 'fan_card_target_quantity',
    comment: '팬카드 판매 목표 수량',
  })
  fanCardTargetQuantity: number;

  @Column({
    type: 'bigint',
    name: 'fan_card_sales_quantity',
    comment: '팬카드 판매 수량',
  })
  fanCardSalesQuantity: number;

  @Column({
    type: 'decimal',
    name: 'fan_card_unit_price',
    comment: '팬카드 판매 수량',
  })
  fanCardUnitPrice: string;

  @Column({
    type: 'text',
    name: 'lock_contract',
    comment: 'Lock Contract Address',
  })
  lockContract: string;

  @Column({
    type: 'text',
    name: 'xpla_contract',
    comment: 'XPLA Contract Address',
  })
  xplaContract: string;

  @Column({
    type: 'text',
    name: 'game_provider_address',
    comment: 'Game Provider Address',
  })
  gameProviderAddress: string;

  @Column({
    type: 'text',
    name: 'treasury_address',
    comment: 'Treasury Address',
  })
  treasuryAddress: string;

  @Column({ type: 'text', name: 'server_address', comment: 'Server Address' })
  serverAddress: string;

  @Column({
    type: 'text',
    name: 'xpla_holder_address',
    comment: 'XPLA Holder Address',
  })
  xplaHolderAddress: string;

  @Column({
    type: 'text',
    name: 'game_token_contract',
    comment: 'Game Token Contract',
  })
  gameTokenContract: string;

  @Column({
    type: 'text',
    name: 'fan_holder_address',
    comment: 'Fan Holder Address',
  })
  fanHolderAddress: string;

  @Column({ type: 'text', name: 'nft_contract', comment: 'NFT Contract' })
  nftContract: string;

  @Column({ type: 'text', name: 'game_contract', comment: 'Game Contract' })
  gameContract: string;

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

  @CreateDateColumn({ type: 'datetime', name: 'reg_datetime' })
  createAt: string;

  @UpdateDateColumn({ type: 'datetime', name: 'mod_datetime', default: null })
  updateAt: string;
}
