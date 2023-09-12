import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  Matches,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { BetaGameApplyResDto } from './beta-game-apply-v1.res.dto';
import { Column, UpdateDateColumn } from 'typeorm';

export class BetaGameResDto {
  @ApiProperty({
    example: 1,
    description: '베타게임 런처 진행 현황 고유 식별 코드',
    required: true,
  })
  id: number;

  @ApiProperty({
    example: 1,
    description: '베타게임 런처 신청 접수 고유 식별 코드',
    required: true,
  })
  bliId: number;

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
    example: 'Hive SDK',
    description: '프로젝트명(게임명)',
    required: true,
  })
  projectTitle: string;

  @ApiProperty({
    example: '1001000101',
    description:
      '진행 현황 - 대기중: 1001000101, 진행중: 1001000102, 완료: 1001000103',
    required: true,
  })
  progressStatusCd: string;

  @ApiProperty({
    example: '1001000301',
    description: '진행 현황 - 임시저장: 1001000301, 접수완료: 1001000302',
    required: true,
  })
  registerStatusCd: string;

  @ApiProperty({
    example: '2022-07-06T19:04:04.739Z',
    description: '팬카드 판매 기간(시작)',
    required: true,
  })
  fanCardSalesStartDatetime: string;

  @ApiProperty({
    example: '2022-07-06T19:04:04.739Z',
    description: '팬카드 판매 기간(종료)',
    required: true,
  })
  fanCardSalesEndDatetime: string;

  @ApiProperty({
    example: '2022-07-06T19:04:04.739Z',
    description: '베타게임 테스트 기간(시작)',
    required: true,
  })
  betaTestStartDatetime: string;

  @ApiProperty({
    example: '2022-07-06T19:04:04.739Z',
    description: '베타게임 테스트 기간(종료)',
    required: true,
  })
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
    example: 1000,
    description: '팬카드 판매 수량',
    required: true,
  })
  fanCardSalesQuantity: number;

  @ApiProperty({
    example: 1000,
    description: '팬카드 판매 단가',
    required: true,
  })
  fanCardUnitPrice: string;

  @ApiProperty({
    example: 'lock_contract',
    description: 'Lock Contract Address',
    required: true,
  })
  lockContract: string;

  @ApiProperty({
    example: 'xpla_contract',
    description: 'XPLA Contract Address',
    required: true,
  })
  xplaContract: string;

  @ApiProperty({
    example: 'game_provider_address',
    description: 'Game Provider Address',
    required: true,
  })
  gameProviderAddress: string;

  @ApiProperty({
    example: 'treasury_address',
    description: 'Treasury Address',
    required: true,
  })
  treasuryAddress: string;

  @ApiProperty({
    example: 'server_address',
    description: 'Server Address',
    required: true,
  })
  serverAddress: string;

  @ApiProperty({
    example: 'xpla_holder_address',
    description: 'XPLA Holder Address',
    required: true,
  })
  xplaHolderAddress: string;

  @ApiProperty({
    example: 'game_token_contract',
    description: 'Game Token Contract',
    required: true,
  })
  gameTokenContract: string;

  @ApiProperty({
    example: 'fan_holder_address',
    description: 'Fan Holder Address',
    required: true,
  })
  fanHolderAddress: string;

  @ApiProperty({
    example: 'nft_contract',
    description: 'NFT Contract',
    required: true,
  })
  nftContract: string;

  @ApiProperty({
    example: 'game_contract',
    description: 'Game Contract',
    required: true,
  })
  gameContract: string;

  @ApiProperty({
    type: [BetaGameApplyResDto],
    description: 'BetaGame Apply Info',
    required: true,
  })
  applyInfo: BetaGameApplyResDto;

  @ApiProperty({
    example: '2022-07-06T19:04:04.739Z',
    description: 'BetaGame Confirm UpdateAt',
    required: true,
  })
  updateAt: string;
}

export class tokenDistributionsOthers {
  @ApiProperty({
    example: 'xpla1..',
  })
  address: string;

  @ApiProperty({
    example: '0.17',
  })
  rate: string;
}

export class tokenDistributions {
  @ApiProperty({
    example: '0.03',
    description: 'fan-card 구매한 유저들에게 갈 게임토큰 비율',
  })
  invitation_buyer_rate: string;

  @ApiProperty({
    example: '0.6',
    description: 'swap-pool에 갈 비율',
  })
  swap_pool_rate: string;

  @ApiProperty({
    type: tokenDistributionsOthers,
    description: 'swap-pool에 갈 비율',
  })
  others: tokenDistributionsOthers;
}

/**
 * 참고: https://c2xstation.notion.site/Beta-Game-Contract-Fan-card-nft-11e52d6ae8cb4f9a90cdf1210c5acd78
 * */
export class betaGameContractResDto {
  @ApiProperty({
    example: '31CF564675A78B54C4F054B6F98F5DF2ABD54C088A88E42...',
    description: 'game token address',
  })
  game_token_address: string;

  @ApiProperty({
    example: '31CF564675A78B54C4F054B6F98F5DF2ABD54C088A88E42...',
    description: 'fan token address',
  })
  fan_nft_address: string;

  @ApiProperty({
    example: 50000,
    description: '베타 등록된 게임의 런칭을 위한 최소 fan card 판매량',
  })
  soft_cap: number;

  @ApiProperty({
    example: null,
    description:
      '베타 등록된 게임의 fan card 최대 판매량. 입력하지 않으면 무제한',
  })
  hard_cap: number;

  @ApiProperty({
    example: 100000,
    description: '베타 참여한 유저별(주소별) fan card 최대 구매 제한량',
  })
  user_cap: number;

  @ApiProperty({
    example: 10,
    description: '팬카드 판매 수량',
  })
  sold_amount: number;

  @ApiProperty({
    example: 1673245828,
    description: '베타게임런처 시작',
  })
  start_time: number;

  @ApiProperty({
    example: 1676419200,
    description: '베타게임런처 종료',
  })
  end_time: number;

  @ApiProperty({
    example: '1.0',
    description: '팬 카드 총 판매 대비 토큰 발행 배율',
  })
  token_issuance_unit: number;

  @ApiProperty({
    example: '1.0',
    description:
      'fan card 한장 당 구매 가격 단위 (ex 1.0 = fan card 한장당 1 xpla)',
  })
  invitation_price_unit: string;

  @ApiProperty({
    example: '1000000000000000000',
    description: 'xpla로 환산 된 구매 금액',
  })
  invitation_price: string;

  @ApiProperty({
    type: tokenDistributions,
    description: '발행된 게임토큰의 분배 정보',
  })
  game_token_distributions: tokenDistributions;

  @ApiProperty({
    example: false,
    description: '분배 진행 상태',
  })
  main_token_distributed: boolean;

  @ApiProperty({
    example: 'xpla1...',
    description:
      'claim msg sender (백엔드에서 claim(minting) 시 대납해주는 address)',
  })
  claim_owner: string;
}

export class BetaGameLauncherResDto {
  @ApiProperty({
    description: '게임을 구분하기 위한 값',
  })
  gameId: number;

  @ApiProperty({
    description: '게임 타이틀',
  })
  title: string;

  @ApiProperty({
    description: '서브 타이틀',
  })
  subTitle: string;

  @ApiProperty({
    description: '시작일',
  })
  startDate: string;

  @ApiProperty({
    description: '종료일',
  })
  endDate: string;

  @ApiProperty({
    description: '목표량 최대',
  })
  hardCap: number;

  @ApiProperty({
    description: '목표량 최소',
  })
  softCap: number;

  @ApiProperty({
    description: '유저량 최대',
  })
  userCap: number;

  @ApiProperty({
    description: '가격',
  })
  invitationPrice: number;

  @ApiProperty({
    description: '구매 페이지 프로젝트 정보 : 개발사',
  })
  infoDeveloper: string;

  @ApiProperty({
    description: '플랫폼',
  })
  infoPlatform: string;

  @ApiProperty({
    description: '장르',
  })
  infoGenre: string;

  @ApiProperty({
    description: '상태',
  })
  infoState: string;

  @ApiProperty({
    description: '출시',
  })
  infoReleaseDate: string;

  @ApiProperty({
    description: '게임소개',
  })
  infoGameIntroduction: string;

  @ApiProperty({
    description: '진행상태 (comming soon=0, 진행중=1, 종료=2)',
  })
  status: number;

  @ApiProperty({
    description: '진행상태에 따른 잔여시간',
  })
  leftTime: number;

  @ApiProperty({
    description: '팬nft 토큰id 접두어',
  })
  nftName: string;

  @ApiProperty({
    description: '팬카드 판매 시작일',
  })
  fanStartDate: string;

  @ApiProperty({
    description: '팬카드 판매 종료일',
  })
  fanEndTime: string;

  @ApiProperty({
    description: '게임 리스트 이미지 url',
  })
  imageUrl: string;

  @ApiProperty({
    description: '공식 사이트 url',
  })
  webSiteUrl: string;

  @ApiProperty({
    description: 'discode url',
  })
  discodeUrl: string;

  @ApiProperty({
    description: 'android url',
  })
  betaTestUrlAnd: string;

  @ApiProperty({
    description: 'ios url',
  })
  betaTestUrlIos: string;

  @ApiProperty({
    description: 'pc url',
  })
  betaTestUrlPc: string;

  @ApiProperty({
    description: '구매 팝업 url 1',
  })
  screenShotUrl1: string;

  @ApiProperty({
    description: '구매 팝업 url 2',
  })
  screenShotUrl2: string;

  @ApiProperty({
    description: '구매 팝업 url 3',
  })
  screenShotUrl3: string;

  @ApiProperty({
    description: '구매 팝업창 이미지 url',
  })
  betaPopupUrl: string;

  @ApiProperty({
    description: '게임 토큰 콘트렉트',
  })
  gameContract: string;

  @ApiProperty({
    description: '소수점',
  })
  decimals: number;

  @ApiProperty({
    description: '펜 토큰 콘트렉트',
  })
  fanContract: string;

  @ApiProperty({
    description: '심볼',
  })
  symbol: string;

  @ApiProperty({
    description: '클레임 서버주소',
  })
  claimServerAddr: string;

  @ApiProperty({
    description: '베타게임 컨트랙트 주소',
  })
  betaContract: string;

  @ApiProperty({
    description: '앱아이디',
  })
  appid: string;

  @ApiProperty({
    type: betaGameContractResDto,
    description: '게임을 구분하기 위한 값',
  })
  contractData: betaGameContractResDto;
}

export class BetaGameListsDto {
  @ApiProperty({
    example: 1,
    description: '베타게임 런처 진행 현황 고유 식별 코드',
    required: true,
  })
  id: number;

  @ApiProperty({
    example: 1,
    description: '베타게임 런처 신청 접수 고유 식별 코드',
    required: true,
  })
  bliId: number;

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
    example: '1001000101',
    description:
      '진행 현황 - 대기중: 1001000101, 진행중: 1001000102, 완료: 1001000103',
    required: true,
  })
  progressStatusCd: string;

  @ApiProperty({
    example: '1001000301',
    description: '진행 현황 - 임시저장: 1001000301, 접수완료: 1001000302',
    required: true,
  })
  registerStatusCd: string;

  @ApiProperty({
    example: '2022-07-06T19:04:04.739Z',
    description: '팬카드 판매 기간(시작)',
    required: true,
  })
  fanCardSalesStartDatetime: string;

  @ApiProperty({
    example: '2022-07-06T19:04:04.739Z',
    description: '팬카드 판매 기간(종료)',
    required: true,
  })
  fanCardSalesEndDatetime: string;

  @ApiProperty({
    example: '2022-07-06T19:04:04.739Z',
    description: '베타게임 테스트 기간(시작)',
    required: true,
  })
  betaTestStartDatetime: string;

  @ApiProperty({
    example: '2022-07-06T19:04:04.739Z',
    description: '베타게임 테스트 기간(종료)',
    required: true,
  })
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
    example: 1000,
    description: '팬카드 판매 수량',
    required: true,
  })
  fanCardSalesQuantity: number;

  @ApiProperty({
    example: 'lock_contract',
    description: 'Lock Contract Address',
    required: true,
  })
  lockContract: string;

  @ApiProperty({
    example: 'xpla_contract',
    description: 'XPLA Contract Address',
    required: true,
  })
  xplaContract: string;

  @ApiProperty({
    example: 'game_provider_address',
    description: 'Game Provider Address',
    required: true,
  })
  gameProviderAddress: string;

  @ApiProperty({
    example: 'treasury_address',
    description: 'Treasury Address',
    required: true,
  })
  treasuryAddress: string;

  @ApiProperty({
    example: 'server_address',
    description: 'Server Address',
    required: true,
  })
  serverAddress: string;

  @ApiProperty({
    example: 'xpla_holder_address',
    description: 'XPLA Holder Address',
    required: true,
  })
  xplaHolderAddress: string;

  @ApiProperty({
    example: 'game_token_contract',
    description: 'Game Token Contract',
    required: true,
  })
  gameTokenContract: string;

  @ApiProperty({
    example: 'fan_holder_address',
    description: 'Fan Holder Address',
    required: true,
  })
  fanHolderAddress: string;

  @ApiProperty({
    example: 'nft_contract',
    description: 'NFT Contract',
    required: true,
  })
  nftContract: string;

  @ApiProperty({
    example: 'game_contract',
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
    example: 'com.com2us.hivesdk.c2xwallet.hivepc.kr.test',
    description: '앱센터에 등록한 앱아이디',
    required: true,
  })
  @IsString()
  appid: string;

  @ApiProperty({
    type: BetaGameLauncherResDto,
    description: '베타게임런처 팬카드 등록 정보',
  })
  betaGameLauncherData: BetaGameLauncherResDto;
}

export class BetaGameListsResDto {
  @ApiProperty({
    type: [BetaGameListsDto],
    description: 'BetaGame Lists',
    required: true,
  })
  data: BetaGameListsDto[];
}
