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
import { ApiProperty } from '@nestjs/swagger';
import { ApiVerifyType } from '../enum/common.enum';

/**
 * 블록체인 게임 설정 정보
 */
@Entity('tb_blockchain_game_info')
@Index('blockchain_game_info_indx_01', ['id'])
@Index('blockchain_game_info_indx_02', ['company', 'gameindex'])
@Index('blockchain_game_info_indx_03', ['appid'])
export class BlockchainGameEntitty {
  @PrimaryGeneratedColumn({
    name: 'bgi_id',
    type: 'int',
    unsigned: true,
    comment: '고유번호',
  })
  id: number;

  @Column({
    name: 'blci_id',
    type: 'int',
    unsigned: true,
    comment: '베타게임 런처 고유 식별 코드',
  })
  betagameLauncherId: number;

  @Column({ name: 'company', type: 'int', comment: '회사 고유 식별 코드' })
  company: number;

  @Column({ name: 'gameindex', type: 'int', comment: '게임 고유 식별 코드' })
  gameindex: number;

  @Column({
    name: 'appid',
    type: 'varchar',
    length: 255,
    comment: '앱 고유 식별 코드',
  })
  appid: string;

  @Column({
    name: 'game_token_name',
    type: 'char',
    length: 10,
    comment: '게임 토큰 명',
  })
  gameTokenName: string;

  @Column({
    name: 'game_token_image',
    type: 'char',
    length: 5,
    comment: '게임 토큰 아이콘 이미지',
  })
  gameTokenImage: string;

  @Column({
    name: 'setting_complete_type_cd',
    type: 'char',
    length: 12,
    comment: '기능설정 완료 여부',
  })
  settingCompleteTypeCd: string;

  @Column({
    name: 'api_setting_complete_type_cd',
    type: 'char',
    length: 12,
    comment: 'API 세팅 완료 여부',
  })
  apiSettingCompleteTypeCd: string;

  @Column({
    name: 'active_type_cd',
    type: 'char',
    length: 12,
    comment: '활성화 여부',
  })
  activeTypeCd: string;

  @Column({
    name: 'mint_active_type_cd',
    type: 'char',
    length: 12,
    comment: '단일 민팅 사용 여부',
  })
  mintActiveTypeCd: string;

  @Column({
    name: 'union_mint_active_type_cd',
    type: 'char',
    length: 12,
    comment: '조합 민팅 사용 여부',
  })
  unionMintActiveTypeCd: string;

  @Column({
    name: 'char_mint_active_type_cd',
    type: 'char',
    length: 12,
    comment: '캐릭터 민팅 사용 여부',
  })
  charMintActiveTypeCd: string;

  @Column({
    name: 'governance_token_convert_type_cd',
    type: 'char',
    length: 12,
    comment:
      '거버넌스(CTXT) 토큰 컨버트 사용 여부 ( 사용: 1001000601, 미사용: 1001000602 )',
  })
  governanceTokenConvertTypeCd: string;

  @Column({
    name: 'game_token_convert_type_cd',
    type: 'char',
    length: 12,
    comment:
      '게임 토큰 컨버트 사용 여부 ( 사용: 1001000601, 미사용: 1001000602 )',
  })
  gameTokenConvertTypeCd: string;

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

  @Column({
    name: 'reg_admin',
    type: 'varchar',
    length: 45,
    comment: '최초 등록자',
  })
  createAdmin: string;

  @CreateDateColumn({
    name: 'reg_datetime',
    type: 'datetime',
    comment: '최초 등록일',
  })
  createAt: string;

  @Column({
    name: 'mod_admin',
    type: 'varchar',
    length: 45,
    default: null,
    comment: '마지막 수정자',
  })
  updateAdmin: string;

  @UpdateDateColumn({
    name: 'mod_datetime',
    type: 'datetime',
    default: null,
    comment: '최근 수정일',
  })
  updateAt: string;

  @Column({
    type: 'char',
    length: 12,
    name: 'character_select',
    comment: '캐릭터 선택 유부',
  })
  characterSelect: string;

  @Column({
    type: 'char',
    length: 12,
    name: 'channel_select',
    comment: '채널 선택 유부',
  })
  channelSelect: string;
}

/**
 * 블록체인 게임 API 정보
 */
@Entity('tb_blockchain_game_api_info')
@Index('blockchain_game_api_info_idx_01', ['bgiId', 'apiTypeCd'])
export class BlockchainGameApiInfoEntity {
  @PrimaryColumn({
    name: 'bgi_id',
    type: 'int',
    unsigned: true,
    comment: 'Blockchain game info 고유 식별 코드',
  })
  bgiId: number;

  @Column({
    name: 'api_type_cd',
    type: 'char',
    length: 12,
    comment:
      'API 타입' +
      '서버 목록 조회 : 1001000501\n' +
      '캐릭터 목록 조회 : 1001000502\n' +
      '보유 재화 정보 조회 : 1001000503\n' +
      '카테고리 아이템 정보 조회 : 1001000504\n' +
      'Convert 가능 여부 조회 : 1001000505\n' +
      '아이템 Minting 가능 여부 조회 : 1001000506\n' +
      '캐릭터 Minting 가능 여부 조회 : 1001000507\n' +
      '보유 재화 업데이트 : 1001000508\n' +
      '보유 아이템 Lock (아이템->NFT) : 1001000509\n' +
      '보유 아이템 Unlock (NFT->아이템) : 1001000510\n' +
      '보유 케릭터 Lock (캐릭터->NFT) : 1001000511\n' +
      '보유 케릭터 unLock (NFT->캐릭터) : 1001000512\n' +
      '결과 알림 : 1001000513',
  })
  apiTypeCd: string;

  @Column({
    name: 'api_url',
    type: 'text',
    comment:
      '서버 목록 조회 : 1001000501\n' +
      '캐릭터 목록 조회 : 1001000502\n' +
      '보유 재화 정보 조회 : 1001000503\n' +
      '카테고리 아이템 정보 조회 : 1001000504\n' +
      'Convert 가능 여부 조회 : 1001000505\n' +
      '아이템 Minting 가능 여부 조회 : 1001000506\n' +
      '캐릭터 Minting 가능 여부 조회 : 1001000507\n' +
      '보유 재화 업데이트 : 1001000508\n' +
      '보유 아이템 Lock (아이템->NFT) : 1001000509\n' +
      '보유 아이템 Unlock (NFT->아이템) : 1001000510\n' +
      '보유 케릭터 Lock (캐릭터->NFT) : 1001000511\n' +
      '보유 케릭터 unLock (NFT->캐릭터) : 1001000512\n' +
      '결과 알림 : 1001000513',
  })
  apiUrl: string;

  @Column({
    name: 'verification',
    type: 'enum',
    comment: 'API 검증 여부',
    enum: ApiVerifyType,
  })
  verification: ApiVerifyType;
}

/**
 * 블록체인 게임 API 정보
 */
@Entity('tb_blockchain_game_api_test_info')
@Index('blockchain_game_api_test_info_idx_01', ['bgiId', 'apiTypeCd'])
export class BlockchainGameApiTestInfoEntity {
  @PrimaryColumn({
    name: 'bgi_id',
    type: 'int',
    unsigned: true,
    comment: 'Blockchain game info 고유 식별 코드',
  })
  bgiId: number;

  @Column({
    name: 'api_type_cd',
    type: 'char',
    length: 12,
    comment:
      'API 타입' +
      '서버 목록 조회 : 1001000501\n' +
      '캐릭터 목록 조회 : 1001000502\n' +
      '보유 재화 정보 조회 : 1001000503\n' +
      '카테고리 아이템 정보 조회 : 1001000504\n' +
      'Convert 가능 여부 조회 : 1001000505\n' +
      '아이템 Minting 가능 여부 조회 : 1001000506\n' +
      '캐릭터 Minting 가능 여부 조회 : 1001000507\n' +
      '보유 재화 업데이트 : 1001000508\n' +
      '보유 아이템 Lock (아이템->NFT) : 1001000509\n' +
      '보유 아이템 Unlock (NFT->아이템) : 1001000510\n' +
      '보유 케릭터 Lock (캐릭터->NFT) : 1001000511\n' +
      '보유 케릭터 unLock (NFT->캐릭터) : 1001000512\n' +
      '결과 알림 : 1001000513',
  })
  apiTypeCd: string;

  @Column({
    name: 'api_url',
    type: 'text',
    comment:
      '서버 목록 조회 : 1001000501\n' +
      '캐릭터 목록 조회 : 1001000502\n' +
      '보유 재화 정보 조회 : 1001000503\n' +
      '카테고리 아이템 정보 조회 : 1001000504\n' +
      'Convert 가능 여부 조회 : 1001000505\n' +
      '아이템 Minting 가능 여부 조회 : 1001000506\n' +
      '캐릭터 Minting 가능 여부 조회 : 1001000507\n' +
      '보유 재화 업데이트 : 1001000508\n' +
      '보유 아이템 Lock (아이템->NFT) : 1001000509\n' +
      '보유 아이템 Unlock (NFT->아이템) : 1001000510\n' +
      '보유 케릭터 Lock (캐릭터->NFT) : 1001000511\n' +
      '보유 케릭터 unLock (NFT->캐릭터) : 1001000512\n' +
      '결과 알림 : 1001000513',
  })
  apiUrl: string;

  @Column({
    name: 'verification',
    type: 'enum',
    comment: 'API 검증 여부',
    enum: ApiVerifyType,
  })
  verification: ApiVerifyType;
}

/**
 * 블록체인 게임 카테고리 설정 정보
 */
@Entity('tb_mint_category_setting_info')
@Index('mint_category_setting_info_idx_01', ['bgiId', 'activeTypeCd'])
export class MintCategorySettingInfoEntity {
  @PrimaryGeneratedColumn({
    name: 'mcsi_id',
    type: 'int',
    unsigned: true,
    comment: '고유번호',
  })
  id: number;

  @PrimaryColumn({
    name: 'bgi_id',
    type: 'int',
    unsigned: true,
    comment: 'BlockchainGame 고유번호',
  })
  bgiId: number;

  @Column({
    name: 'active_type_cd',
    type: 'char',
    length: 12,
    comment: '활성화여부 활성 : 1001000601, 비활성 : 1001000602',
  })
  activeTypeCd: string;

  @Column({
    name: 'mint_type_cd',
    type: 'char',
    length: 12,
    comment:
      '민팅 타입 ' +
      '단일 Mint : 1001000701\n' +
      '조합 Mint : 1001000702\n' +
      '캐릭터 Mint : 1001000703',
  })
  mintTypeCd: string;

  @Column({
    name: 'name',
    type: 'varchar',
    length: 255,
    comment: '카테고리 명',
  })
  name: string;
}

/**
 * 블록체인 게임 민팅 fee 정보
 */
@Entity('tb_mint_fee_info')
@Unique('mint_free_info_uniq_01', ['mcsiId', 'bgiId'])
export class MintFeeInfoEntity {
  @PrimaryColumn({
    name: 'bgi_id',
    type: 'int',
    unsigned: true,
  })
  bgiId: number;

  @PrimaryColumn({
    name: 'mcsi_id',
    type: 'int',
    unsigned: true,
  })
  mcsiId: number;

  @Column({
    name: 'xpla_fee',
    type: 'decimal',
    unsigned: true,
    default: 0,
    comment: '민팅에 필요한 XPLA 수수료',
  })
  xplaFee: number;

  @Column({
    name: 'game_token_fee',
    type: 'decimal',
    unsigned: true,
    default: 0,
    comment: '민팅에 필요한 게임토큰 수수료',
  })
  gameTokenFee: number;

  @Column({
    name: 'mint_count',
    type: 'decimal',
    unsigned: true,
    default: null,
    comment:
      '조합민팅일 경우 조합민팅할 NFT의 카운트에 따라 xplaFee 와 gameTokenFee 달라진다.',
  })
  mintCount: number;
}

/**
 * 블록체인 게임 컨버트 설정 정보
 */
@Entity('tb_convert_setting_info')
@Index('convert_setting_info_idx_01', ['bgiId', 'convertTypeCd'])
export class ConvertSettingInfoEntity {
  @PrimaryColumn({
    name: 'bgi_id',
    type: 'int',
    unsigned: true,
    comment: 'BlockchainGame 고유번호',
  })
  bgiId: number;

  @Column({
    name: 'convert_type_cd',
    type: 'char',
    length: 12,
    comment:
      'Convet 타입 C2X : 1001000801 (C2X <-> 게임재화), Game Token : 1001000802 (Game Token <-> 게임재화)',
  })
  convertTypeCd: string;

  @Column({
    name: 'goods_name',
    type: 'varchar',
    length: 255,
    comment: '게임 재화 명',
  })
  goodsName: string;

  @Column({
    name: 'goods_code',
    type: 'varchar',
    length: 255,
    comment: '게임 재화 고유 식별 코드',
  })
  goodsCode: string;

  @Column({
    name: 'goods_image',
    type: 'varchar',
    length: 255,
    comment: '게임 재화 아이콘 이미지',
  })
  goodsImage: string;

  @Column({
    name: 'min_convert_quantity_one_time',
    type: 'int',
    comment: '1회 최소 교환 가능 수량',
  })
  minConvertQuantityOneTime: number;

  @Column({
    name: 'max_convert_quantity_days',
    type: 'int',
    comment: '1일 최대 교환 가능 수량',
  })
  maxConvertQuantityDays: number;
}
