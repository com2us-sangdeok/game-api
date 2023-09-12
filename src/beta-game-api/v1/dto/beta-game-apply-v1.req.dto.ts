import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmpty,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  Matches,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Column, PrimaryColumn } from 'typeorm';

/**
 * 베타게임 최초 등록 요청 정보
 */
export class BetaGameV1ApplyCreateReqDto {
  @ApiProperty({
    example: 1,
    description: 'Hive Console 의 회사 고유 식별 번호',
  })
  @IsNumber()
  @IsNotEmpty()
  company: number;

  @ApiProperty({
    example: 1,
    description: 'Hive Console 에 등록된 게임의 고유 식별 번호',
  })
  @IsNumber()
  @IsNotEmpty()
  gameindex: number;

  @IsOptional()
  registerStatusCd: string;

  @ApiProperty({
    example: 'HST',
    description: '게임 재화의 토큰명',
    required: false,
  })
  @IsString()
  @Matches(/^[A-Z]+$/, {
    message: 'tokenName 영문 대문자 만 가능 합니다.',
  })
  @IsOptional()
  tokenName?: string;

  @ApiProperty({
    example: '관리자명(admin)',
    description: '최초 등록 관리자',
  })
  @Matches(/^[가-힝a-zA-Z0-9- _+()]+$/, {
    message: 'createAdmin는 한글, 영문, 숫자, 특수문자 - _+() 만 가능 합니다.',
  })
  @IsString()
  @IsNotEmpty()
  createAdmin: string;
}

/**
 * 서비스 링크 요청 정보
 */
export class LinkDto {
  @ApiProperty({
    example: '1001000401',
    description:
      '게임 채널 링크 정보 ' +
      '게임 동영상 링크 : 1001000401\n' +
      '공식 사이트 주소 : 1001000402\n' +
      'Google Play 링크 : 1001000403\n' +
      'App Store 링크 : 1001000404\n' +
      '디스코드 채널 : 1001000405\n' +
      '텔레그램 채널 : 1001000406\n' +
      '트위터 계정 : 1001000407\n' +
      '미디엄 페이지 : 1001000408\n' +
      '기타 커뮤니티 : 1001000409',
  })
  @Length(8, 12, {
    groups: [
      '1001000401',
      '1001000402',
      '1001000403',
      '1001000404',
      '1001000405',
      '1001000406',
      '1001000407',
      '1001000408',
      '1001000409',
    ],
  })
  serviceLinkTypeCd: string;

  @ApiProperty({
    example:
      'https://www.youtube.com/embed/Lofd8XepImQ?ps=play&vq=large&rel=0&autohide=1&showinfo=0&autoplay=1&authuser=0',
    description: '링크 주소',
  })
  @IsUrl()
  serviceLink: string;
}

/**
 * 서비스 링크 요청 정보
 */
export class OsDownLinkDto {
  @ApiProperty({
    example: 'https://google.com',
    description: 'Android 게임 다운로드 링크',
    required: true,
  })
  @IsUrl()
  android: string;

  @ApiProperty({
    example: 'https://apple.com',
    description: 'iOS 게임 다운로드 링크',
    required: true,
  })
  @IsUrl()
  ios: string;

  @ApiProperty({
    example: 'https://withhive.com',
    description: 'PC 게임 다운로드 링크',
    required: true,
  })
  @IsUrl()
  pc: string;
}

/**
 * 베타게임런처 정보 임시 저장
 */
export class BetaGameV1ApplyTemporaryReqDto {
  @ApiProperty({
    example: 1,
    description: 'Hive Console 의 회사 고유 식별 번호',
  })
  @IsNumber()
  @IsNotEmpty()
  company: number;

  @ApiProperty({
    example: 1,
    description: 'Hive Console 에 등록된 게임의 고유 식별 번호',
  })
  @IsNumber()
  @IsNotEmpty()
  gameindex: number;

  @ApiProperty({
    example: '게임소개(요약)',
    description: '게임소개(요약)',
    required: false,
  })
  @IsOptional()
  gameIntro: string;

  @ApiProperty({
    example: '게임소개(상세)',
    description: '게임소개(상세)',
    required: false,
  })
  @IsOptional()
  gameIntroDetail: string;

  @ApiProperty({
    example: 'RPG',
    description: '게임 장르',
    required: false,
  })
  @IsString()
  @IsOptional()
  gameGenre?: string;

  @ApiProperty({
    type: [OsDownLinkDto],
    description: '운영 체제 다운로드 링크',
    required: false,
  })
  @IsOptional()
  osDownLink?: OsDownLinkDto;

  @IsOptional()
  developStatusCd?: string;

  @ApiProperty({
    example: 'QA 버전 준비중',
    description: '개발 상태 추가 입력 정보',
    required: false,
  })
  @IsOptional()
  developStatusAdditionalText?: string;

  @Length(8, 12, {
    groups: ['1001000301', '1001000302'],
  })
  @IsOptional()
  registerStatusCd?: string;

  @ApiProperty({
    example: '2022-07-06T19:04:04.739Z',
    description: '출시 예정일',
    required: false,
  })
  @IsOptional()
  releaseDatetime?: string;

  @ApiProperty({
    example: 'HST',
    description: '게임 재화의 토큰명',
    required: false,
  })
  @IsString()
  @Matches(/^[A-Z]+$/, {
    message: 'tokenName 영문 대문자 만 가능 합니다.',
  })
  @IsOptional()
  tokenName?: string;

  @ApiProperty({
    example: 'LCTfancard',
    description: '팬카드 토큰 명',
    required: false,
  })
  @IsString()
  @Matches(/^[a-zA-Z]+$/, {
    message: 'fanCardTokenName 영문만 가능 합니다.',
  })
  @IsOptional()
  fanCardTokenName?: string;

  @ApiProperty({
    example: 'LCTfancard',
    description: '팬카드 토큰 설명',
    required: false,
  })
  @IsString()
  // @Matches(/^[가-힝a-zA-Z0-9- _+()]+$/, {
  //   message:
  //     'fanCardDescription 는 한글, 영문, 숫자, 특수문자 - _+() 만 가능 합니다.',
  // })
  @IsOptional()
  fanCardDescription: string;

  @ApiProperty({
    example: 'AAAAAAAAAAAAAAAAAA',
    description:
      '토큰 분배 등 프로바이더에게 지급 되는 물량에 대한 Terra/C2X의 지갑 주소 입니다.',
    required: false,
  })
  @IsString()
  @IsOptional()
  gameProviderAddress?: string;

  @ApiProperty({
    example: '2022-07-06T19:04:04.739Z',
    description: '팬카드 판매 시작 일',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  fanCardSalesStartDatetime?: string;

  @ApiProperty({
    example: '2022-07-06T19:04:04.739Z',
    description: '팬카드 판매 종료 일',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  fanCardSalesEndDatetime?: string;

  @ApiProperty({
    example: '2022-07-06T19:04:04.739Z',
    description: '베타 테스트 시작일',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  betaTestStartDatetime?: string;

  @ApiProperty({
    example: '2022-07-06T19:04:04.739Z',
    description: '베타 테스트 종료일',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  betaTestEndDatetime?: string;

  @ApiProperty({
    example: 100000,
    description: '팬카드 판매 목표 수량',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  fanCardTargetQuantity: number;

  @ApiProperty({
    example: 10,
    description: '팬카드 개당 가격',
    required: false,
  })
  @IsOptional()
  fanCardUnitPrice?: string;

  @ApiProperty({
    example: 1,
    description:
      '1. Convert pool 사용 , 36개월 균등 지급, 매 달 수익 정산 진행\n' +
      '2. Convert pool 사용 , 비선형적 지급 방식 , 매 달 수익 정산 진행\n' +
      '3. Convert pool 사용 , 물량 일괄 배분(일부 Reserve로 남겨둠) , 수익 정산 진행 X\n' +
      '4. 전환비 사용 , 수익 정산 진행 X',
    required: false,
  })
  distributionType: number;

  // @ApiProperty({
  //   example: 1,
  //   description: 'XPLA Convert pool 초기 비율 설정 (XPLA)',
  //   required: false,
  // })
  // xplaConvertPoolInitialRatio: number;

  @ApiProperty({
    example: 3,
    description: 'XPLA Convert pool 초기 비율 설정 (게임재화)',
    required: false,
  })
  xplaConvertPoolInitialRatioGoods: string;

  // @ApiProperty({
  //   example: 1,
  //   description: '게임토큰 Convert pool 초기 비율 설정(게임토큰)',
  //   required: false,
  // })
  // gameTokenConvertPoolInitialRatio: number;

  @ApiProperty({
    example: 3,
    description: '게임토큰 Convert pool 초기 비율 설정(게임재화)',
    required: false,
  })
  gameTokenConvertPoolInitialRatioGoods: string;

  @ApiProperty({
    example: '관리자명(admin)',
    description: '최초 등록 관리자',
  })
  @Matches(/^[가-힝a-zA-Z0-9- _+()]+$/, {
    message: 'createAdmin는 한글, 영문, 숫자, 특수문자 - _+() 만 가능 합니다.',
  })
  @IsString()
  @IsNotEmpty()
  createAdmin: string;

  @ApiProperty({
    example: '관리자명(admin)',
    description: '최종 수정자',
  })
  @IsString()
  @Matches(/^[가-힝a-zA-Z0-9- _+()]+$/, {
    message: 'updateAdmin 한글, 영문, 숫자, 특수문자 - _+() 만 가능 합니다.',
  })
  updateAdmin: string;

  @ApiProperty({
    type: [LinkDto],
    description: '게임 서비스 링크',
    required: false,
  })
  @IsOptional()
  serviceLink!: LinkDto[];
}

/**
 * 베타게임런처 신청 최종 접수 요청 정보
 */
export class BetaGameV1ApplyCompleteReqDto {
  @ApiProperty({
    example: 1,
    description: 'Hive Console 의 회사 고유 식별 번호',
  })
  @IsNumber()
  @IsNotEmpty()
  company: number;

  @ApiProperty({
    example: 1,
    description: 'Hive Console 에 등록된 게임의 고유 식별 번호',
  })
  @IsNumber()
  @IsNotEmpty()
  gameindex: number;

  @ApiProperty({
    example: '게임소개(요약)',
    description: '게임소개(요약)',
    required: true,
  })
  gameIntro: string;

  @ApiProperty({
    example: '게임소개(상세)',
    description: '게임소개(상세)',
    required: true,
  })
  gameIntroDetail: string;

  @ApiProperty({
    example: 'RPG',
    description: '게임 장르',
    required: true,
  })
  @IsString()
  gameGenre: string;

  @ApiProperty({
    type: [OsDownLinkDto],
    description: '운영 체제 다운로드 링크',
    required: false,
  })
  @IsOptional()
  osDownLink?: OsDownLinkDto;

  @ApiProperty({
    example: '1001000201',
    description:
      '개발 상태' +
      '개발중 : 1001000201\n' +
      'CBT : 1001000202\n' +
      '사전예약 : 1001000203\n' +
      '소프트 런칭 : 1001000204\n' +
      '런칭 : 1001000205\n' +
      '기타 : 1001000206',
  })
  @Length(8, 12, {
    groups: [
      '1001000201',
      '1001000202',
      '1001000203',
      '1001000204',
      '1001000205',
      '1001000206',
    ],
  })
  developStatusCd: string;

  @ApiProperty({
    example: 'QA 버전 준비중',
    description: '개발 상태 추가 입력 정보',
    required: false,
  })
  // @Matches(/^[가-힝a-zA-Z0-9- _+()]+$/, {
  //   message:
  //     'developStatusAdditionalText는 한글, 영문, 숫자, 특수문자 - _+() 만 가능 합니다.',
  // })
  developStatusAdditionalText: string;

  @Length(8, 12, {
    groups: ['1001000301', '1001000302'],
  })
  @IsOptional()
  registerStatusCd?: string;

  @ApiProperty({
    example: '2022-07-06T19:04:04.739Z',
    description: '출시 예정일',
  })
  @IsDateString()
  releaseDatetime: string;

  @ApiProperty({
    example: 'HST',
    description: '게임 재화의 토큰명',
  })
  @IsString()
  @Matches(/^([A-Z])+$/, {
    message: 'tokenName 영문 대문자 만 가능 합니다.',
  })
  tokenName: string;

  @ApiProperty({
    example: 'LCTfancard',
    description: '팬카드 토큰 명',
  })
  @IsString()
  @Matches(/^([a-zA-Z])+$/, {
    message: 'fanCardTokenName 영문만 가능 합니다.',
  })
  fanCardTokenName: string;

  @ApiProperty({
    example: 'LCTfancard',
    description: '팬카드 토큰 설명',
    required: false,
  })
  @IsOptional()
  // @Matches(/^[가-힝a-zA-Z0-9- _+()]+$/, {
  //   message:
  //     'fanCardDescription 는 한글, 영문, 숫자, 특수문자 - _+() 만 가능 합니다.',
  // })
  fanCardDescription: string;

  @ApiProperty({
    example: 'AAAAAAAAAAAAAAAAAA',
    description:
      '토큰 분배 등 프로바이더에게 지급 되는 물량에 대한 Terra/C2X의 지갑 주소 입니다.',
  })
  @IsString()
  gameProviderAddress: string;

  @ApiProperty({
    example: '2022-07-06T19:04:04.739Z',
    description: '팬카드 판매 시작 일',
  })
  @IsDateString()
  fanCardSalesStartDatetime: string;

  @ApiProperty({
    example: '2022-07-06T19:04:04.739Z',
    description: '팬카드 판매 종료 일',
  })
  @IsDateString()
  fanCardSalesEndDatetime: string;

  @ApiProperty({
    example: '2022-07-06T19:04:04.739Z',
    description: '베타 테스트 시작일',
  })
  @IsDateString()
  betaTestStartDatetime: string;

  @ApiProperty({
    example: '2022-07-06T19:04:04.739Z',
    description: '베타 테스트 종료일',
  })
  @IsDateString()
  betaTestEndDatetime: string;

  @ApiProperty({
    example: 100000,
    description: '팬카드 판매 목표 수량',
    required: true,
  })
  @IsNumber()
  @IsOptional()
  fanCardTargetQuantity: number;

  @ApiProperty({
    example: '0.0000001',
    description: '팬카드 개당 가격',
  })
  fanCardUnitPrice: string;

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

  // @ApiProperty({
  //   example: 1,
  //   description: 'XPLA Convert pool 초기 비율 설정 (XPLA)',
  //   required: true,
  // })
  // xplaConvertPoolInitialRatio: number;

  @ApiProperty({
    example: 3,
    description: 'XPLA Convert pool 초기 비율 설정 (게임재화)',
    required: true,
  })
  xplaConvertPoolInitialRatioGoods: string;

  // @ApiProperty({
  //   example: 1,
  //   description: '게임토큰 Convert pool 초기 비율 설정(게임토큰)',
  //   required: true,
  // })
  // gameTokenConvertPoolInitialRatio: number;

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
  @IsString()
  @Matches(/^[가-힝a-zA-Z0-9- _+()]+$/, {
    message: 'createAdmin는 한글, 영문, 숫자, 특수문자 - _+() 만 가능 합니다.',
  })
  createAdmin: string;

  @ApiProperty({
    example: '관리자명(admin)',
    description: '최종 수정자',
  })
  @IsString()
  @Matches(/^[가-힝a-zA-Z0-9- _+()]+$/, {
    message: 'updateAdmin 한글, 영문, 숫자, 특수문자 - _+() 만 가능 합니다.',
  })
  updateAdmin: string;

  @ApiProperty({
    type: [LinkDto],
    description: '게임 서비스 링크',
    required: false,
  })
  @IsOptional()
  serviceLink?: LinkDto[];
}

export class BetaGameImagesReqDto {
  bliId: number;
  /** 이미지 타입 ( 1: 썸네일이미지, 2: 스크린샷, 3: 게임토큰, 4: 팬카드) */
  type: number;
  fileName: string;
  sortOrder: number;
}
