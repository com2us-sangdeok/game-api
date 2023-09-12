import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsNumber,
  IsNumberString,
  IsOptional,
  Length,
} from 'class-validator';

export class BetaGameListReqDto {
  @ApiProperty({
    example: 1,
    description: '회사 식별 고유 코드',
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

  @ApiProperty({
    example: '1001000101',
    description:
      '진행 현황 - 대기중: 1001000101, 진행중: 1001000102, 완료: 1001000103',
    required: false,
  })
  @IsOptional()
  progressStatusCd?: string;
}

export class UpdateReqDto {
  @Length(8, 12, {
    groups: ['1001000301', '1001000302'],
  })
  @IsOptional()
  registerStatusCd?: string;

  @ApiProperty({
    example: 1,
    description: '팬카드 판매 단가 (XPLA)',
    required: true,
  })
  fanCardUnitPrice: string;

  // @ApiProperty({
  //   example: 100000,
  //   description: '팬카드 판매 수량',
  //   required: true,
  // })
  // @IsNumber()
  // @IsOptional()
  // fanCardSalesQuantity: number;

  @ApiProperty({
    example: 100000,
    description: '팬카드 판매 목표 수량',
    required: true,
  })
  @IsNumber()
  @IsOptional()
  fanCardTargetQuantity: number;

  @ApiProperty({
    example: '2022-08-04 00:00:00',
    description: '팬카드 판매 시작일',
    required: true,
  })
  @IsDateString()
  fanCardSalesStartDatetime: string;

  @ApiProperty({
    example: '2022-08-04 23:59:59',
    description: '팬카드 팬매 종료일',
    required: true,
  })
  @IsDateString()
  fanCardSalesEndDatetime: string;

  @ApiProperty({
    example: '2022-08-04 00:00:00',
    description: '베타게임 테스트 시작일',
    required: true,
  })
  @IsDateString()
  betaTestStartDatetime: string;

  @ApiProperty({
    example: '2022-08-04 23:59:59',
    description: '베타게임 테스트 종료일',
    required: true,
  })
  @IsDateString()
  betaTestEndDatetime: string;

  @ApiProperty({
    example: 'lockCa',
    description: 'Lock Contract Address',
    required: true,
  })
  lockCa: string;

  @ApiProperty({
    example: 'xplaCa',
    description: 'XPLA Contract Address',
    required: true,
  })
  xplaCa: string;

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
    example: 'XplaHolderAddress',
    description: 'XPLA Holder Address',
    required: true,
  })
  XplaHolderAddress: string;

  @ApiProperty({
    example: 'gameTokenCa',
    description: 'Game Token Contract',
    required: true,
  })
  gameTokenCa: string;

  @ApiProperty({
    example: 'fanHolderAddress',
    description: 'Fan Holder Address',
    required: true,
  })
  fanHolderAddress: string;

  @ApiProperty({
    example: 'nftCa',
    description: 'NFT Contract',
    required: true,
  })
  nftCa: string;

  @ApiProperty({
    example: 'gameCa',
    description: 'Game Contract',
    required: true,
  })
  gameCa: string;

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
}

export class SalesSyncReqDto {
  @ApiProperty({
    example: 100,
    description: '팬카드 판매 수량 (실시간 업데이트)',
    required: true,
  })
  @IsNumber()
  fanCardSalesQuantity: number;
}
