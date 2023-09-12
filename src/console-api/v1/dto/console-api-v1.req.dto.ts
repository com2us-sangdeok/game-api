import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsDecimal,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  Matches,
} from 'class-validator';
import { GameServerDto } from './console-api-v1.res.dto';

export class HiveAppSyncReqDto {
  dataType: string;
  changeType: string;
  data: object;
}

export class BlockChainGameCreateReqDto {
  @ApiProperty({
    example: 1,
    description: 'tb_betagame_launcher_confirm_info 테이블 고유번호',
    required: true,
  })
  @IsNumber()
  blci_id: number;

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
    example: 1,
    description: '게임 토큰명',
    required: true,
  })
  @IsString()
  gameTokenName: string;

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
    example: 'AAAAAAAAAAAAAAAAAA',
    description: '지갑주소',
    required: true,
  })
  gameProviderAddress: string;

  @ApiProperty({
    example: '관리자명(admin)',
    description: '최초 등록 관리자',
  })
  @Matches(/^[가-힝a-zA-Z0-9- _+()]+$/, {
    message: 'createAdmin는 한글, 영문, 숫자, 특수문자 - _+() 만 가능 합니다.',
  })
  @IsString()
  createAdmin: string;
}

export class BlockChainGameListsReqDto {
  @ApiProperty({
    example: 1,
    description: '회사 식별 고유 코드',
    required: true,
  })
  @IsNumberString()
  company: number;

  @ApiProperty({
    example: 1,
    description: '게임 식별 고유 코드',
    required: false,
  })
  @IsNumberString()
  @IsOptional()
  gameindex: number;
}

export class BlockchainGameApiReqDto {
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
    enum: [
      '1001000501',
      '1001000502',
      '1001000503',
      '1001000504',
      '1001000505',
      '1001000506',
      '1001000507',
      '1001000508',
      '1001000509',
      '1001000510',
      '1001000511',
      '1001000512',
      '1001000513',
    ],
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

export class BlockchainGameApiTestReqDto {
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
    enum: [
      '1001000501',
      '1001000502',
      '1001000503',
      '1001000504',
      '1001000505',
      '1001000506',
      '1001000507',
      '1001000508',
      '1001000509',
      '1001000510',
      '1001000511',
      '1001000512',
      '1001000513',
    ],
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

export class MintFeeReqDto {
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

export class MintCategorySettingReqDto {
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
    type: [MintFeeReqDto],
    description: '민트 유형 및 민트 count별 수수료 정보',
  })
  @IsNotEmpty()
  feeInfo: MintFeeReqDto[];
}

export class ConvertSettingReqDto {
  @ApiProperty({
    example: '1001000801',
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
    example: 'icon.png',
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

export class BlockChainGameTemporaryUpdateReqDto {
  @ApiProperty({
    example: 'icon.png',
    description: '게임 토큰 명',
    required: false,
  })
  @IsString()
  @IsOptional()
  gameTokenImage: string;

  //설정 완료 여부 (완료 : 1001000901, 설정중 : 1001000902)
  settingCompleteTypeCd: string;

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
    example: '관리자명(admin)',
    description: '최종 수정자',
    required: false,
  })
  @Matches(/^[가-힝a-zA-Z0-9- _+()]+$/, {
    message: 'updateAdmin는 한글, 영문, 숫자, 특수문자 - _+() 만 가능 합니다.',
  })
  @IsString()
  @IsOptional()
  updateAdmin: string;

  @ApiProperty({
    type: [MintCategorySettingReqDto],
    description: '게임 테스트서버 API 리스트',
    required: false,
  })
  @IsOptional()
  category: MintCategorySettingReqDto[];

  @ApiProperty({
    type: [ConvertSettingReqDto],
    description: '컨버팅 재화 정보',
    required: false,
  })
  @IsOptional()
  convert: ConvertSettingReqDto[];

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
  channelSelectActiveTypeCd: string;

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
  characterSelectActiveTypeCd: string;
}

export class BlockChainGameUpdateReqDto {
  @ApiProperty({
    example: 'icon.png',
    description: '게임 토큰 명',
    required: true,
  })
  @IsString()
  gameTokenImage: string;

  //설정 완료 여부 (완료 : 1001000901, 설정중 : 1001000902)
  settingCompleteTypeCd: string;

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
    example: '관리자명(admin)',
    description: '최종 수정자',
    required: true,
  })
  @Matches(/^[가-힝a-zA-Z0-9- _+()]+$/, {
    message: 'updateAdmin는 한글, 영문, 숫자, 특수문자 - _+() 만 가능 합니다.',
  })
  @IsString()
  updateAdmin: string;

  @ApiProperty({
    type: [MintCategorySettingReqDto],
    description: '게임 테스트서버 API 리스트',
    required: true,
  })
  @IsNotEmpty()
  category: MintCategorySettingReqDto[];

  @ApiProperty({
    type: [ConvertSettingReqDto],
    description: '컨버팅 재화 정보',
    required: true,
  })
  @IsNotEmpty()
  convert: ConvertSettingReqDto[];

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
  channelSelectActiveTypeCd: string;

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
  characterSelectActiveTypeCd: string;
}

export class BlockChainGameApiUpdateReqDto {
  saveType: number;

  // 완료 : 1001000901. 설정중 : 1001000902
  @Length(8, 12, {
    groups: ['1001000901', '1001000902'],
  })
  @IsOptional()
  apiSettingCompleteTypeCd: string;

  @ApiProperty({
    type: [BlockchainGameApiReqDto],
    description: '게임서버 API 리스트',
    required: false,
  })
  @IsNotEmpty()
  apiLists: BlockchainGameApiReqDto[];

  @ApiProperty({
    type: [BlockchainGameApiTestReqDto],
    description: '게임 테스트서버 API 리스트',
    required: false,
  })
  @IsNotEmpty()
  apiTestLists: BlockchainGameApiTestReqDto[];
}

export class BlockChainGameActiveUpdateReqDto {
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
}

export class BlockChainGameServerUpdateReqDto {
  @ApiProperty({
    example: '["GLOBAL","ASIA"]',
    required: true,
  })
  serverIds: string[];
}
