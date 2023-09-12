import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  nftStatus,
  ConvertType,
  categoryMintType,
} from '../../../enum/common.enum';
import {IsArray} from "class-validator";

export class SearchReqDto {
  @ApiProperty({
    example: '1',
    description: 'Hive Player ID',
  })
  playerId: number;

  @ApiProperty({
    example: '["1","1"]',
    description: 'server-1, channel-1',
  })
  @ApiPropertyOptional()
  server: string[];
}

export class SearchAllReqDto extends SearchReqDto {
  @ApiProperty({
    example: 'characterId',
    description:
      '캐릭터 정보 조회를 통해 전달 받은 캐릭터 고유 식별 코드 (캐릭터 선택이 있는 경우 사용)',
  })
  @ApiPropertyOptional()
  characterId?: string;
}

export class CategoryReqDto extends SearchAllReqDto {
  @ApiProperty({
    example: '1',
    description: '카테고리의 고유 식별 코드',
  })
  categoryId: number;

  @ApiProperty({
    example: 'Inventory',
    description: '카테고리의 이름',
  })
  categoryName: string;

  @ApiProperty({
    example: 1,
    description: '카테고리 타입 ( 1: 단일민팅, 2: 조합민팅, 3: 캐릭터민팅 )',
    enum: [1, 2, 3],
  })
  categoryType: number;
}

export class ConvertConfirmReqDto extends SearchAllReqDto {
  @ApiProperty({
    example: 'goodsUniqId',
    description: '재화 구분 코드',
  })
  goodsCode: string;

  @ApiProperty({
    example: 100,
    description: '재화 수량',
  })
  goods: number;

  @ApiProperty({
    example: 100,
    description: 'XPLA 또는 게임토큰 수량',
  })
  token: number;

  @ApiProperty({
    example: 1,
    description:
      '1 = 게임재화 -> C2X, 2 = C2X -> 게임재화, 3 = 게임재화 -> 게임토큰, 4 = 게임토큰 -> 게임재화',
    enum: [1, 2, 3, 4],
  })
  type: ConvertType;

  @ApiProperty({
    example: 100,
    description: '1회 최소 교환 가능 수량',
  })
  min: number;

  @ApiProperty({
    example: 1000,
    description: '1일 최대 교환 가능 수량량',
  })
  max: number;
}

export class MintDataDto {
  // @ApiProperty({ example: 'sword1', description: '이름' })
  // name: string;
  //
  // @ApiProperty({
  //   example: 'sword1 description',
  //   description: '설명',
  // })
  // @ApiPropertyOptional()
  // description?: string;
  //
  // @ApiProperty({
  //   example: 'uniqCode1',
  //   description: '고유 식별 코드',
  // })
  // uniqueId: string;

  @ApiProperty({
    example: 'NFT TokenId',
    description: 'NFT ID',
  })
  @ApiPropertyOptional()
  tokenId?: string;
}


export class MintConfirmReqDto {
  @ApiProperty({
    example: '1,1,1',
    description: '게임 서버 정보',
  })
  @ApiPropertyOptional()
  server: string;

  @ApiProperty({
    example: 'categoryId',
    description:
      '베타게임 설정에서 등록된 category id 정보',
  })
  @ApiPropertyOptional()
  categoryId: string;

  @ApiProperty({
    example: ['uniqueId'],
    description: 'Items for minting',
  })
  @IsArray()
  items: string[];

  @ApiProperty({
    example: ['token id'],
    description: 'Tokens for minting',
  })
  @IsArray()
  tokens: string[];
}


export class MintReqDto /*extends SearchAllReqDto*/ {
  @ApiProperty({
    example: 'requestid',
    description:
        '캐릭터 정보 조회를 통해 전달 받은 캐릭터 고유 식별 코드 (캐릭터 선택이 있는 경우 사용)',
  })
  @ApiPropertyOptional()
  requestId: string;

  @ApiProperty({
    example: '1,1,1',
    description: '게임 서버 정보',
  })
  @ApiPropertyOptional()
  server: string;

  @ApiProperty({
    example: 'characterId',
    description:
        '캐릭터 정보 조회를 통해 전달 받은 캐릭터 고유 식별 코드 (캐릭터 선택이 있는 경우 사용)',
  })
  @ApiPropertyOptional()
  characterId?: string;

  // @ApiProperty({
  //   description:
  //     '민팅 정보 (항상 배열로 전달되며, 조합민팅의 경우 2개 이상이 전달됨)',
  //   type: MintDataDto,
  // })
  // items: MintDataDto;
  @ApiProperty({
    example: 'NFT TokenId',
    description: 'NFT ID',
  })
  @ApiPropertyOptional()
  tokenId: string;
}

export class MintFinishedReqDto /*extends SearchAllReqDto*/ {
  @ApiProperty({
    example: 'success',
    description: 'tx result {success, failure}',
  })
  result: string;

  @ApiProperty({
    example: '84504454-ab09-4483-966f-fff92fa411a0',
    description: 'Request ID',
  })
  requestId: string;

  @ApiProperty({
    example: 'asdfadsfa...=',
    description: 'TX hash',
  })
  txHash: string;

  @ApiProperty({
    example: 'mint',
    description: 'event type {mint, burn, convert, lock, unlock}',
  })
  eventType: string;

  @ApiProperty({
    example: '1,1,1',
    description: '게임 서버 정보',
  })
  @ApiPropertyOptional()
  server: string;

  @ApiProperty({
    example: 'characterId',
    description:
        '캐릭터 정보 조회를 통해 전달 받은 캐릭터 고유 식별 코드 (캐릭터 선택이 있는 경우 사용)',
  })
  @ApiPropertyOptional()
  characterId?: string;

  @ApiProperty({
    description:
      '민팅 정보 (항상 배열로 전달되며, 조합민팅의 경우 2개 이상이 전달됨)',
    type: Object,
  })
  data: any;
}

export class GameGoodsReqDto /*extends SearchAllReqDto*/ {
  @ApiProperty({ example: 'asdf-asdfad-asdfadsf-sdfadsf', description: 'Request ID' })
  requestId: string;

  @ApiProperty({ example: '1,1,1', description: '게임서버 정보' })
  server: string;

  @ApiProperty({ example: 'com', description: '캐릭터 ID' })
  characterId: string;

  @ApiProperty({ example: 'goldCode', description: '재화 고유 식별 코드' })
  goodsCode: string;

  // todo: 재화명 필요? -> 필수는 아닐것 같습니다. 다만 로그를 남기거나 했을때 코드만으로는 추가적으로 조회가 필요한데 반해 재화명이 함께 있으면 확인이 용이 할것같네요
  // @ApiProperty({ example: 'gold', description: '재화 명' })
  // goodsName: string;

  @ApiProperty({ example: 100, description: '재화 수량' })
  amount: number;

  @ApiProperty({
    example: 1,
    description: '1 = 증가, 2 = 차감',
    enum: [1, 2],
  })
  type: number;
}
