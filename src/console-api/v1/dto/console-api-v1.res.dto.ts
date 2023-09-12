import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsDecimal,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUrl,
  Length,
  Matches,
} from 'class-validator';
import { Column } from 'typeorm';

export class BlockchainGameApiResDto {
  @ApiProperty({
    example: 1,
    description: 'BlockChainGameInfo 고유 식별 번호',
    required: true,
  })
  @IsNumber()
  bgiId: number;

  @ApiProperty({
    example: '1001000501',
    description:
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
    required: true,
  })
  @IsString()
  apiTypeCd: string;

  @ApiProperty({
    example: 'API URI',
    description: '실제 응답이 가능한 API URI',
    required: true,
  })
  @IsUrl()
  apiUrl: string;

  @ApiProperty({
    example: 'Y',
    description: 'API 검증 여부',
    required: true,
  })
  @IsString()
  verification: string;
}

export class BlockchainGameApiTestResDto {
  @ApiProperty({
    example: 1,
    description: 'BlockChainGameInfo 고유 식별 번호',
    required: true,
  })
  @IsNumber()
  bgiId: number;

  @ApiProperty({
    example: '1001000501',
    description:
      'API 타입' +
      '서버 목록 조회 : 1001000501\n' +
      '캐릭터 목록 조회 : 1001000502\n' +
      '카테고리별 민팅 가능 목록 조회 : 1001000503\n' +
      '민팅 가능 여부 확인 메타데이터 생성 : 1001000504\n' +
      'NFT 아이템 생성 : 1001000505\n' +
      '유저 게임 재화 수량 조회 : 1001000506\n' +
      '유저 게임 재화 컨버트 가능 여부 확인 : 1001000507\n' +
      '유저 게임 재화 수량 업데이트 : 1001000508\n' +
      '게임 내 사용 불가 요청 : 1001000509\n' +
      '게임 내 사용 가능 요청 : 1001000510\n' +
      '결과 알림(tx 결과 전송) : 1001000511',
    required: true,
  })
  @IsString()
  apiTypeCd: string;

  @ApiProperty({
    example: 'API URI',
    description: '실제 응답이 가능한 API URI',
    required: true,
  })
  @IsUrl()
  apiUrl: string;

  @ApiProperty({
    example: 'Y',
    description: 'API 검증 여부',
    required: true,
  })
  @IsString()
  verification: string;
}

export class MintFeeResDto {
  @ApiProperty({
    example: 0.13,
    description: '민팅에 필요한 XPLA 수수료',
    required: true,
  })
  @IsDecimal()
  xplaFee: number;

  @ApiProperty({
    example: 0.13,
    description: '민팅에 필요한 게임토큰 수수료',
    required: true,
  })
  @IsDecimal()
  gameTokenFee: number;

  @ApiProperty({
    example: 0,
    description:
      '조합민팅일 경우 조합민팅할 NFT의 카운트에 따라 ctx_fee, game_koken_fee가 달라진다.',
    required: true,
  })
  @IsNumber()
  mintCount: number;
}

export class MintCategorySettingResDto {
  @ApiProperty({
    example: 1,
    description: '고유 식별 번호',
    required: true,
  })
  @IsNumber()
  id: number;

  @ApiProperty({
    example: 1,
    description: 'BlockChainGameInfo 고유 식별 번호',
    required: true,
  })
  @IsNumber()
  bgiId: number;

  @ApiProperty({
    example: '1001000601',
    description:
      '활성화 여부 ' + '활성 : 1001000601\n' + '비활성 : 1001000602\n',
    required: true,
  })
  @Length(8, 12, {
    groups: ['1001000601', '1001000602'],
  })
  @IsString()
  activeTypeCd: string;

  @ApiProperty({
    example: '1001000601',
    description:
      '민팅 타입 ' +
      '1001000701 : 단일 Mint\n' +
      '1001000702 : 조합 Mint\n' +
      '1001000703 : 캐릭터 Mint',
    required: true,
  })
  @Length(8, 12, {
    groups: ['1001000701', '1001000702', '1001000703'],
  })
  @IsString()
  mintTypeCd: string;

  @ApiProperty({
    example: 'Inventory',
    description: '카테고리 명 (웹뷰민팅 탭명)',
    required: true,
  })
  @Matches(/^[a-zA-Z]+$/, {
    message: 'Category Name은 영문만 가능 합니다.',
  })
  @IsString()
  name: string;

  @ApiProperty({
    type: [MintFeeResDto],
    description: '민트 유형 및 민트 count별 수수료 정보',
  })
  @IsNotEmpty()
  feeInfo: MintFeeResDto[];
}

export class ConvertSettingResDto {
  @ApiProperty({
    example: 1,
    description: '블록체인게임 고유 식별 코드',
    required: true,
  })
  @IsNumber()
  bgiId: number;

  @ApiProperty({
    example: '1001000601',
    description:
      '컨버트 타입 ' +
      'CTX (CTX <-> 게임재화) : 1001000801\n' +
      'Game Token (Game Token <-> 게임재화) : 1001000802\n',
    required: true,
  })
  @Length(8, 12, {
    groups: ['1001000801', '1001000802'],
  })
  @IsString()
  convertTypeCd: string;

  @ApiProperty({
    example: 'soulstone',
    description: '게임 재화명',
    required: true,
  })
  @Matches(/^[a-z]+$/, {
    message: '게임 재화명은 영소문자만 가능 합니다.',
  })
  @IsString()
  goodsName: string;

  @ApiProperty({
    example: 'SOULSTONE',
    description: '게임 재화 코드',
    required: true,
  })
  @Matches(/^[a-zA-Z0-9]+$/, {
    message: '게임 재화 코드는 영문, 숫자만 가능합니다.',
  })
  @IsString()
  goodsCode: string;

  @ApiProperty({
    example:
      'https://c2xnft.qpyou.cn/blockchain-sdk/blockchain/48479951-8fc3-7aa5-b2a8-433c312a30d2.png',
    description: '게임재화 아이콘 이미지',
    required: false,
  })
  @IsString()
  goodsImage: string;

  @ApiProperty({
    example: 1000,
    description: '1회 최소 교환 가능 수량',
    required: true,
  })
  @IsNumber()
  minConvertQuantityOneTime: number;

  @ApiProperty({
    example: 100000,
    description: '1일 최대 교환 가능 수량',
    required: true,
  })
  @IsNumber()
  maxConvertQuantityDays: number;
}

export class GameServerDto {
  @ApiProperty({
    example: 'KR',
    description: '서버 고유 ID',
    required: true,
  })
  serverId: string;

  @ApiProperty({
    example: '한국서버',
    description: '서버명 (한국어)',
    required: true,
  })
  serverNameKO: string;

  @ApiProperty({
    example: 'Korea',
    description: '서버명 (영어)',
    required: true,
  })
  serverNameEN: string;

  @ApiProperty({
    example: 'Asia/Seoul',
    description: '서버 타임존',
    required: true,
  })
  timezone: string;
}

export class GameName {
  @ApiProperty({
    example: 'ko',
    description: '게임명 언어',
    required: true,
  })
  language: string;

  @ApiProperty({
    example: '게임명',
    description: '게임명',
    required: true,
  })
  name: string;
}

export class SelectBlockChainGameResDto {
  @ApiProperty({
    example: 1,
    description: '회사 식별 고유 코드',
    required: true,
  })
  @IsNumber()
  company: number;

  @ApiProperty({
    example: 1,
    description: '게임 식별 고유 코드',
    required: true,
  })
  @IsNumber()
  gameindex: number;

  @ApiProperty({
    example: 'com.com2us.c2xwallet.global.normal',
    description: 'APP 식별 ID (앱센터 등록)',
    required: true,
  })
  @Matches(/^[a-zA-Z0-9.]+$/, {
    message: 'appid 영문, 숫자, 특수문자 - _+() 만 가능 합니다.',
  })
  @IsString()
  appid: string;

  @ApiProperty({
    example: '통합모듈 샘플앱',
    description: '게임명(한국어)',
    required: true,
  })
  ko: string;

  @ApiProperty({
    example: '통합모듈 샘플앱',
    description: '게임명(영어)',
    required: true,
  })
  en: string;
}

export class BlockChainGameResDto {
  @ApiProperty({
    example: 1,
    description: '고유 식별 코드',
    required: true,
  })
  @IsNumber()
  id: number;

  @ApiProperty({
    example: 1,
    description: '베타게임런처 고유 식별 코드',
    required: true,
  })
  @IsNumber()
  betagameLauncherId: number;

  @ApiProperty({
    example: 1,
    description: '회사 식별 고유 코드',
    required: true,
  })
  @IsNumber()
  company: number;

  @ApiProperty({
    example: 1,
    description: '게임 식별 고유 코드',
    required: true,
  })
  @IsNumber()
  gameindex: number;

  @ApiProperty({
    example: 'com.com2us.c2xwallet.global.normal',
    description: 'APP 식별 ID (앱센터 등록)',
    required: true,
  })
  @Matches(/^[a-zA-Z0-9.]+$/, {
    message: 'appid 영문, 숫자, 특수문자 - _+() 만 가능 합니다.',
  })
  @IsString()
  appid: string;

  @ApiProperty({
    type: [GameName],
    description: '하이브에 등록된 언어별 게임명',
  })
  title: GameName[];

  @ApiProperty({
    example:
      'https://hive-fn.qpyou.cn/hubweb/gmnotice/appcenter/test/1651485241439.png',
    description: '아이콘 이미지 주소',
    required: true,
  })
  iconImage: string;

  @ApiProperty({
    example: '게임 장르',
    description: '게임 장르',
    required: true,
  })
  genre: string;

  @ApiProperty({
    example: 'HST',
    description: '게임 토큰 명',
    required: true,
  })
  @Matches(/^[A-Z]+$/, {
    message: 'gameTokenName 영문 대문자만 가능 합니다.',
  })
  @IsString()
  gameTokenName: string;

  @ApiProperty({
    example: 'icon.png',
    description: '게임 토큰 명',
    required: false,
  })
  @IsString()
  gameTokenImage: string;

  @ApiProperty({
    example: '1001000601',
    description:
      '채널 선택 사용 유무\n' + '활성 : 1001000601\n' + '비활성 : 1001000602\n',
    required: true,
  })
  @Length(8, 12, {
    groups: ['1001000601', '1001000602'],
  })
  @IsString()
  channelSelect: string;

  @ApiProperty({
    example: '1001000601',
    description:
      '캐릭터 선택 사용 유무\n' +
      '활성 : 1001000601\n' +
      '비활성 : 1001000602\n',
    required: true,
  })
  @Length(8, 12, {
    groups: ['1001000601', '1001000602'],
  })
  @IsString()
  characterSelect: string;

  @ApiProperty({
    example: '1001000901',
    description:
      '설정 완료 여부 ' + '완료 : 1001000901\n' + '설정중 : 1001000902\n',
    required: true,
  })
  @Length(8, 12, {
    groups: ['1001000901', '1001000902'],
  })
  settingCompleteTypeCd: string;

  @ApiProperty({
    example: '1001000901',
    description:
      '설정 완료 여부 ' + '완료 : 1001000901\n' + '설정중 : 1001000902\n',
    required: true,
  })
  @Length(8, 12, {
    groups: ['1001000901', '1001000902'],
  })
  apiSettingCompleteTypeCd: string;

  @ApiProperty({
    example: '1001000601',
    description:
      '활성화 여부 ' + '활성 : 1001000601\n' + '비활성 : 1001000602\n',
    required: true,
  })
  @Length(8, 12, {
    groups: ['1001000601', '1001000602'],
  })
  @IsString()
  activeTypeCd: string;

  @ApiProperty({
    example: '1001000601',
    description:
      '단일 민팅 사용 여부\n' + '활성 : 1001000601\n' + '비활성 : 1001000602\n',
    required: true,
  })
  @Length(8, 12, {
    groups: ['1001000601', '1001000602'],
  })
  @IsString()
  mintActiveTypeCd: string;

  @ApiProperty({
    example: '1001000601',
    description:
      '조합 민팅 사용 여부\n' + '활성 : 1001000601\n' + '비활성 : 1001000602\n',
    required: true,
  })
  @Length(8, 12, {
    groups: ['1001000601', '1001000602'],
  })
  @IsString()
  unionMintActiveTypeCd: string;

  @ApiProperty({
    example: '1001000601',
    description:
      '캐릭터 민팅 사용 여부\n' +
      '활성 : 1001000601\n' +
      '비활성 : 1001000602\n',
    required: true,
  })
  @Length(8, 12, {
    groups: ['1001000601', '1001000602'],
  })
  @IsString()
  charMintActiveTypeCd: string;

  @ApiProperty({
    example: '1001000601',
    description:
      '거버넌스토큰 컨버트 사용 여부\n' +
      '활성 : 1001000601\n' +
      '비활성 : 1001000602\n',
    required: true,
  })
  @Length(8, 12, {
    groups: ['1001000601', '1001000602'],
  })
  @IsString()
  governanceTokenConvertTypeCd: string;

  @ApiProperty({
    example: '1001000601',
    description:
      '게임토큰 컨버트 사용 여부\n' +
      '활성 : 1001000601\n' +
      '비활성 : 1001000602\n',
    required: true,
  })
  @Length(8, 12, {
    groups: ['1001000601', '1001000602'],
  })
  @IsString()
  gameTokenConvertTypeCd: string;

  @ApiProperty({
    example: 'lockContract',
    description: 'Lock Contract Address',
    required: true,
  })
  lockContract: string;

  @ApiProperty({
    example: 'xplaContract',
    description: 'XPLA Contract Address',
    required: true,
  })
  xplaContract: string;

  @ApiProperty({
    example: 'gameProviderAddress',
    description: 'Game Provider Address',
    required: true,
  })
  gameProviderAddress: string;

  @ApiProperty({
    example: 'treasuryAddress',
    description: 'Treasury Address',
    required: true,
  })
  treasuryAddress: string;

  @ApiProperty({
    example: 'serverAddress',
    description: 'Server Address',
    required: true,
  })
  serverAddress: string;

  @ApiProperty({
    example: 'xplaHolderAddress',
    description: 'XPLA Holder Address',
    required: true,
  })
  xplaHolderAddress: string;

  @ApiProperty({
    example: 'gameTokenContract',
    description: 'Game Token Contract',
    required: true,
  })
  gameTokenContract: string;

  @ApiProperty({
    example: 'fanHolderAddress',
    description: 'Fan Holder Address',
    required: true,
  })
  fanHolderAddress: string;

  @ApiProperty({
    example: 'nftContract',
    description: 'NFT Contract',
    required: true,
  })
  nftContract: string;

  @ApiProperty({
    example: 'gameContract',
    description: 'Game Contract',
    required: true,
  })
  gameContract: string;

  @ApiProperty({
    example: 1,
    description:
      '1. Convert pool 사용 , 36개월 균등 지급, 매 달 수익 정산 진행\n' +
      '2. Convert pool 사용 , 비선형적 지급 방식 , 매 달 수익 정산 진행\n' +
      '3. Convert pool 사용 , 물량 일괄 배분(일부 Reserve로 남겨둠) , 수익 정산 진행 X\n' +
      '4. 전환비 사용 , 수익 정산 진행 X',
    required: true,
  })
  distributionType: number;

  @ApiProperty({
    example: 3,
    description: 'XPLA Convert pool 초기 비율 설정 (게임재화)',
    required: true,
  })
  xplaConvertPoolInitialRatioGoods: string;

  @ApiProperty({
    example: 3,
    description: '게임토큰 Convert pool 초기 비율 설정(게임재화)',
    required: true,
  })
  gameTokenConvertPoolInitialRatioGoods: string;

  @ApiProperty({
    example: '관리자명(admin)',
    description: '최초 등록 관리자',
    required: true,
  })
  @Matches(/^[가-힝a-zA-Z0-9- _+()]+$/, {
    message: 'createAdmin는 한글, 영문, 숫자, 특수문자 - _+() 만 가능 합니다.',
  })
  @IsString()
  @IsNotEmpty()
  createAdmin: string;

  @ApiProperty({
    example: '2022-08-04 23:59:59',
    description: '최초 등록 일자',
    required: false,
  })
  @IsDateString()
  createAt: string;

  @ApiProperty({
    example: '관리자명(admin)',
    description: '최종 수정자',
    required: true,
  })
  @Matches(/^[가-힝a-zA-Z0-9- _+()]+$/, {
    message: 'updateAdmin는 한글, 영문, 숫자, 특수문자 - _+() 만 가능 합니다.',
  })
  @IsString()
  @IsNotEmpty()
  updateAdmin: string;

  @ApiProperty({
    example: '2022-08-04 23:59:59',
    description: '최종 수정 일자',
    required: false,
  })
  @IsDateString()
  updateAt: string;

  @ApiProperty({
    type: [BlockchainGameApiResDto],
    description: '게임서버 API 리스트',
  })
  apiLists: BlockchainGameApiResDto[];

  @ApiProperty({
    type: [BlockchainGameApiTestResDto],
    description: '게임 테스트서버 API 리스트',
  })
  apiTestLists: BlockchainGameApiTestResDto[];

  @ApiProperty({
    type: [MintCategorySettingResDto],
    description: '게임 테스트서버 API 리스트',
  })
  categoryLists: MintCategorySettingResDto[];

  @ApiProperty({
    type: [ConvertSettingResDto],
    description: '컨버팅 재화 정보',
  })
  convertLists: ConvertSettingResDto[];

  @ApiProperty({
    example: true,
    description: '민트 카테고리 사용 설정이 1개라도 되어 있으면 TRUE',
  })
  @IsString()
  mintActiveType: boolean;

  @ApiProperty({
    example: true,
    description: '컨버트 카테고리 사용 설정이 1개라도 되어 있으면 TRUE',
  })
  @IsString()
  convertActiveType: boolean;

  @ApiProperty({
    type: [GameServerDto],
    description: '게임 서버 정보',
  })
  gameServerLists: GameServerDto[];
}

export class BlockChainGameListResDto {
  @ApiProperty({
    example: 1,
    description: '게임 식별 고유 코드',
    required: true,
  })
  @IsNumber()
  gameindex: number;

  @ApiProperty({
    example: 'com.com2us.c2xwallet.global.normal',
    description: 'APP 식별 ID (앱센터 등록)',
    required: true,
  })
  @Matches(/^[a-zA-Z0-9.]+$/, {
    message: 'appid 영문, 숫자, 특수문자 - _+() 만 가능 합니다.',
  })
  @IsString()
  appid: string;

  @ApiProperty({
    type: [GameName],
    description: '하이브에 등록된 언어별 게임명',
  })
  title: GameName[];

  @ApiProperty({
    example: 'RPG',
    description: '게임 아이콘 이미지 URI',
  })
  @IsString()
  iconImage: string;

  @ApiProperty({
    example: 'RPG',
    description: '게임 장르',
  })
  @IsString()
  genre: string;

  @ApiProperty({
    example: 'TEST',
    description: 'Hive Web 로그인용 파라미터',
  })
  @IsString()
  serviceType: string;

  @ApiProperty({
    example: '1001000601',
    description:
      '캐릭터 선택 사용 유무\n' +
      '활성 : 1001000601\n' +
      '비활성 : 1001000602\n',
    required: true,
  })
  @Length(8, 12, {
    groups: ['1001000601', '1001000602'],
  })
  @IsString()
  characterSelect: number;

  @ApiProperty({
    example: '1001000601',
    description:
      '채널 선택 사용 유무\n' + '활성 : 1001000601\n' + '비활성 : 1001000602\n',
    required: true,
  })
  @Length(8, 12, {
    groups: ['1001000601', '1001000602'],
  })
  @IsString()
  channelSelect: number;

  @ApiProperty({
    example: '',
    description: 'Android 다운로드 링크',
  })
  @IsString()
  androidDownLink: string;

  @ApiProperty({
    example: '',
    description: 'iOS 다운로드 링크',
  })
  @IsString()
  iosDownLink: string;

  @ApiProperty({
    example: '',
    description: 'PC 다운로드 링크',
  })
  @IsString()
  pcDownLink: string;

  @ApiProperty({
    example: 'HST',
    description: '게임 토큰 명',
    required: true,
  })
  @Matches(/^[A-Z]+$/, {
    message: 'gameTokenName 영문 대문자만 가능 합니다.',
  })
  @IsString()
  gameTokenName: string;

  @ApiProperty({
    example: 'icon.png',
    description: '게임 토큰 명',
    required: false,
  })
  @IsString()
  gameTokenImage: string;

  @ApiProperty({
    example: '1001000901',
    description:
      '설정 완료 여부 ' + '완료 : 1001000901\n' + '설정중 : 1001000902\n',
    required: true,
  })
  @Length(8, 12, {
    groups: ['1001000901', '1001000902'],
  })
  settingCompleteTypeCd: string;

  @ApiProperty({
    example: '1001000901',
    description:
      '설정 완료 여부 ' + '완료 : 1001000901\n' + '설정중 : 1001000902\n',
    required: true,
  })
  @Length(8, 12, {
    groups: ['1001000901', '1001000902'],
  })
  apiSettingCompleteTypeCd: string;

  @ApiProperty({
    example: '1001000601',
    description:
      '활성화 여부 ' + '활성 : 1001000601\n' + '비활성 : 1001000602\n',
    required: true,
  })
  @Length(8, 12, {
    groups: ['1001000601', '1001000602'],
  })
  @IsString()
  activeTypeCd: string;

  @ApiProperty({
    example: '1001000601',
    description:
      '단일 민팅 사용 여부\n' + '활성 : 1001000601\n' + '비활성 : 1001000602\n',
    required: true,
  })
  @Length(8, 12, {
    groups: ['1001000601', '1001000602'],
  })
  @IsString()
  mintActiveTypeCd: string;

  @ApiProperty({
    example: '1001000601',
    description:
      '조합 민팅 사용 여부\n' + '활성 : 1001000601\n' + '비활성 : 1001000602\n',
    required: true,
  })
  @Length(8, 12, {
    groups: ['1001000601', '1001000602'],
  })
  @IsString()
  unionMintActiveTypeCd: string;

  @ApiProperty({
    example: '1001000601',
    description:
      '캐릭터 민팅 사용 여부\n' +
      '활성 : 1001000601\n' +
      '비활성 : 1001000602\n',
    required: true,
  })
  @Length(8, 12, {
    groups: ['1001000601', '1001000602'],
  })
  @IsString()
  charMintActiveTypeCd: string;

  @ApiProperty({
    example: '1001000601',
    description:
      '거버넌스토큰 컨버트 사용 여부\n' +
      '활성 : 1001000601\n' +
      '비활성 : 1001000602\n',
    required: true,
  })
  @Length(8, 12, {
    groups: ['1001000601', '1001000602'],
  })
  @IsString()
  governanceTokenConvertTypeCd: string;

  @ApiProperty({
    example: '1001000601',
    description:
      '게임토큰 컨버트 사용 여부\n' +
      '활성 : 1001000601\n' +
      '비활성 : 1001000602\n',
    required: true,
  })
  @Length(8, 12, {
    groups: ['1001000601', '1001000602'],
  })
  @IsString()
  gameTokenConvertTypeCd: string;

  @ApiProperty({
    example: '1001000601',
    description:
      '캐릭터 민팅 사용 여부\n' +
      '활성 : 1001000601\n' +
      '비활성 : 1001000602\n',
    required: true,
  })
  gameServerLists: GameServerDto[];
}

export class MaintenanceButtonLists {
  @ApiProperty({
    example: '1',
    description:
      '버튼에 대한 액션, buttonlist있을 경우에만 값이 존재 (1: URL, 2: 강제종료, 3: 창닫힘)',
    required: false,
  })
  @IsString()
  action?: string;

  @ApiProperty({
    example: '1',
    description:
      'URL, buttonlist있을 경우에만 값이 존재 (액션에 대한 target URL, action이 1이 아닐 경우 "")',
    required: false,
  })
  @IsString()
  url?: string;

  @ApiProperty({
    example: '확인',
    description: '버튼 Text',
    required: true,
  })
  @IsString()
  button: string;
}

export class MaintenanceResDto {
  @ApiProperty({
    example: '1',
    description: '노티스 종류 (1: 서버점검, 2: 강제업데이트, 3: 일반공지)',
    required: true,
  })
  @IsString()
  type: string;

  @ApiProperty({
    example: '1',
    description:
      '버튼에 대한 액션, buttonlist있을 경우에만 값이 존재 (1: URL, 2: 강제종료, 3: 창닫힘)',
    required: false,
  })
  @IsString()
  action?: string;

  @ApiProperty({
    example: '1',
    description:
      'URL, buttonlist있을 경우에만 값이 존재 (액션에 대한 target URL, action이 1이 아닐 경우 "")',
    required: false,
  })
  @IsString()
  url?: string;

  @ApiProperty({
    example: '2016-05-24 10:32',
    description: '점검 시작일 (YYYY-mm-dd HH:ii)',
    required: true,
  })
  @IsDateString()
  startDate: string;

  @ApiProperty({
    example: '2016-05-24 10:32',
    description: '점검 종료일 (YYYY-mm-dd HH:ii)',
    required: true,
  })
  @IsDateString()
  endDate: string;

  @ApiProperty({
    example: '2016-05-24 10:32',
    description: '점검 남은시간',
    required: true,
  })
  @IsDateString()
  remainingTime: string;

  @ApiProperty({
    example: '서버 점검 알림',
    description: '제목',
    required: true,
  })
  @IsString()
  title: string;

  @ApiProperty({
    example: '금일 정기 점검이 있을 예정 입니다.',
    description: '내용',
    required: true,
  })
  @IsString()
  message: string;

  @ApiProperty({
    example: '확인',
    description: '버튼 Text',
    required: true,
  })
  @IsString()
  button: string;

  @ApiProperty({
    type: [MaintenanceButtonLists],
    description: '컨버팅 재화 정보',
  })
  @IsString()
  buttonLists: MaintenanceButtonLists[];
}
