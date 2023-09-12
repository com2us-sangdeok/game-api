import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  Matches,
  ValidateNested,
} from 'class-validator';
import {
  Column,
  CreateDateColumn,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Type } from 'class-transformer';
import { BetaGameResDto } from './beta-game-v1.res.dto';
import { OsDownLinkDto } from './beta-game-apply-v1.req.dto';

/**
 * 베타게임 최초 등록 요청 정보
 */
export class BetaGameV1ApplyCreateResDto {
  @ApiProperty({
    example: 1,
    description: '베타게임런처 고유 식별 코드',
  })
  @IsNumber()
  id: number;
}

/**
 * 서비스 링크 요청 정보
 */
export class LinkResDto {
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
export class OsDownLinkResDto {
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

export class BetaGameImagesDto {
  @ApiProperty({
    example: 1,
    description: '고유 식별 코드',
    required: true,
  })
  id: number;

  @ApiProperty({
    example: 1,
    description: '베타게임 런처 진행 현황 고유 식별 코드',
    required: true,
  })
  bliId: number;

  @ApiProperty({
    example: 1,
    description: '1: 썸네일 이미지, 2: 스크린샷, 3: 게임토큰, 4: 팬카드',
    required: true,
    enum: [1, 2, 3, 4],
  })
  type: number;

  @ApiProperty({
    example: '03f7a0b8-754e-4640-8d92-1ab8c07d0fcd.jpg',
    description: '파일 명',
    required: true,
  })
  fileName: string;

  @ApiProperty({
    example: 1,
    description: '정렬순서',
    required: false,
  })
  sortOrder: number;
}

export class BetaGameApplyResDto {
  @ApiProperty({
    example: 1,
    description: '베타게임 런처 진행 현황 고유 식별 코드',
    required: true,
  })
  id: number;

  @ApiProperty({
    example: 1,
    description: '회사 식별 코드',
    required: true,
  })
  company: number;

  @ApiProperty({
    example: 1,
    description: '게임 식별 코드',
    required: true,
  })
  gameindex: number;

  @ApiProperty({
    example: 1,
    description: 'AppID',
  })
  appid?: string | null;

  @ApiProperty({
    example: '하이브 SDK',
    description: '프로젝트 명 (게임명)',
  })
  @IsString()
  @Matches(/^[가-힝a-zA-Z0-9- _+()]+$/, {
    message: 'projectTitle 한글, 영문, 숫자, 특수문자 - _+() 만 가능 합니다.',
  })
  projectTitle: string;

  @ApiProperty({
    example: '게임소개(요약)',
    description: '게임소개(요약)',
    required: true,
  })
  @Matches(/^[가-힝a-zA-Z0-9- _!@#&()~]+$/, {
    message: 'createAdmin는 한글, 영문, 숫자, 특수문자 - _+() 만 가능 합니다.',
  })
  gameIntro: string;

  @ApiProperty({
    example: '게임소개(상세)',
    description: '게임소개(상세)',
    required: true,
  })
  @Matches(/^[가-힝a-zA-Z0-9- _!@#&()~]+$/, {
    message: 'createAdmin는 한글, 영문, 숫자, 특수문자 - _+() 만 가능 합니다.',
  })
  gameIntroDetail: string;

  @ApiProperty({
    example: '블록체인 서비스',
    description: '프로젝트 서브 타이틀',
  })
  @Matches(/^[가-힝a-zA-Z0-9- _+()]+$/, {
    message:
      'projectSubTitle 한글, 영문, 숫자, 특수문자 - _+() 만 가능 합니다.',
  })
  @IsString()
  projectSubTitle: string;

  @ApiProperty({
    example: 'RPG',
    description: '게임 장르',
  })
  @IsString()
  gameGenre: string;

  @ApiProperty({
    type: [OsDownLinkResDto],
    description: '운영 체제 다운로드 링크',
    required: false,
  })
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
  })
  @Matches(/^[가-힝a-zA-Z0-9- _+()]+$/, {
    message:
      'developStatusAdditionalText는 한글, 영문, 숫자, 특수문자 - _+() 만 가능 합니다.',
  })
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
  @IsString()
  @Matches(/^[가-힝a-zA-Z0-9- _+()]+$/, {
    message:
      'fanCardDescription 는 한글, 영문, 숫자, 특수문자 - _+() 만 가능 합니다.',
  })
  fanCardDescription: string;

  @ApiProperty({
    example: 'AAAAAAAAAAAAAAAAAA',
    description:
      '토큰 분배 등 프로바이더에게 지급 되는 물량에 대한 Terra/C2X의 지갑 주소 입니다.',
  })
  @IsString()
  gameProviderAddress: string;

  @ApiProperty({
    example: '2022-07-06',
    description: '팬카드 판매 시작 일',
  })
  fanCardSalesStartDatetime: string;

  @ApiProperty({
    example: '2022-07-06',
    description: '팬카드 판매 종료 일',
  })
  fanCardSalesEndDatetime: string;

  @ApiProperty({
    example: '2022-07-06',
    description: '베타 테스트 시작일',
  })
  betaTestStartDatetime: string;

  @ApiProperty({
    example: '2022-07-06',
    description: '베타 테스트 종료일',
  })
  betaTestEndDatetime: string;

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
  })
  @IsString()
  @Matches(/^[가-힝a-zA-Z0-9- _+()]+$/, {
    message: 'createAdmin는 한글, 영문, 숫자, 특수문자 - _+() 만 가능 합니다.',
  })
  createAdmin: string;

  @ApiProperty({
    example: '2022-07-06T19:04:04.739Z',
    description: '베타게임런처 신청 최초 등록일자',
  })
  @IsDateString()
  createAt: string;

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
    example: '2022-07-06T19:04:04.739Z',
    description: '베타게임런처 신청 최종 수정일자',
  })
  @IsDateString()
  updateAt: string;

  @ApiProperty({
    type: [LinkResDto],
    description: '게임 서비스 링크',
    required: false,
  })
  @IsOptional()
  serviceLink?: LinkResDto[];

  @ApiProperty({
    type: [BetaGameImagesDto],
    description: '이미지 리스트',
    required: false,
  })
  @IsOptional()
  images?: BetaGameImagesDto[];

  betaGameConfirmInfo: BetaGameResDto;
}
