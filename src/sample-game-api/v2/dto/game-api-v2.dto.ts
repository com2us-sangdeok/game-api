import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ConvertType {
  // 게임재화 -> C2X
  GoodsToC2x = 1,

  // C2X -> 게임재화
  C2xToGoods = 2,

  // 게임재화 -> 게임토큰
  GoodsToToken = 3,

  // 게임토큰 -> 게임재화
  TokenToGoods = 4,
}

/**
 * 게임에서 제공하고 있는 서버 및 하위 채널 정보를 알기 위해 필요한 데이터
 */
export class ServerDto {
  @ApiProperty({
    example: '1',
    description: 'Hive Player ID',
  })
  pid: number;

  @ApiProperty({
    example: '["1","1"]',
    description: 'server-1, channel-1',
  })
  @ApiPropertyOptional()
  server: string[];
}

/**
 * 보유 중인 재화량을 확인하기 위해 필요한 데이터
 */
export class CharacterDto extends ServerDto {
  @ApiProperty({
    example: 'characterId',
    description:
      '서버선택 후, 캐릭터 선택을 한 경우 캐릭터 정보 조회에서 전달 받은 캐릭터 고유 번호를 전달함.',
  })
  @ApiPropertyOptional()
  selectedCid?: string;
}

/**
 * HIVE 콘솔에 설정한 카테고리의 아이템 목록을 조회하기 위해 필요한 데이터
 */
export class CategoryDto extends CharacterDto {
  @ApiProperty({
    example: '1',
    description: '콘솔에 설정한 카테고리의 고유 식별 코드',
  })
  categoryId: number;

  @ApiProperty({
    example: 1,
    description:
      '콘솔에 설정한 카테고리의 타입 ( 1: 단일민팅, 2: 조합민팅, 3: 캐릭터민팅 )',
  })
  categoryType: number;

  @ApiProperty({
    example: 'Inventory',
    description: '콘솔에 설정한 카테고리의 이름',
  })
  categoryName: string;
}

/**
 * Convert 가능 여부 확인에 필요한 데이터
 */
export class ConvertConfirmDto extends CharacterDto {
  @ApiProperty({
    example: 'goodsUniqId',
    description: 'Hive 콘솔에 등록한 재화 구분 코드',
  })
  goodsCode: string;

  @ApiProperty({
    example: 100,
    description: 'Convert 에 사용될 재화 수량',
  })
  goodsQuantity: number;

  @ApiProperty({
    example: 100,
    description: 'Convert 에 사용될 토큰 수량',
  })
  tokenQuantity: number;

  @ApiProperty({
    example: 1,
    description:
      '1 = 게임재화 -> C2X, 2 = C2X -> 게임재화, 3 = 게임재화 -> 게임토큰, 4 = 게임토큰 -> 게임재화',
  })
  convertType: ConvertType;

  @ApiProperty({
    example: 100,
    description: '1회 최소 교환 가능 수량',
  })
  minConvertQuantity: number;

  @ApiProperty({
    example: 1000,
    description: '1일 최대 교환 가능 수량량',
  })
  maxConvertQuantity: number;
}
/**
 * Minting 가능 여부 확인에 필요한 데이터
 */
export class MintingConfirmDto extends CharacterDto {
  @ApiProperty({
    example: 'itemUniqCode1',
    description: '아이템 고유 식별 코드',
  })
  itemCode: string;

  @ApiProperty({
    example: 'NFT TokenId',
    description: 'NFT ID',
  })
  @ApiPropertyOptional()
  tokenId?: string;
}

/**
 * 캐릭터 Minting 가능 여부 확인에 필요한 데이터
 */
export class CharacterMintingConfirmDto extends CharacterDto {
  @ApiProperty({
    example: 'NFT TokenId',
    description: 'NFT ID',
  })
  @ApiPropertyOptional()
  tokenId?: string;
}

/**
 * 재화량 변경에 필요한 데이터
 */
export class GoodsUpdateDto extends ConvertConfirmDto {}

/**
 * NFT 아이템 Lock, Unlock 에 필요한 데이터
 */
export class NftItemStatusUpdateDto extends MintingConfirmDto {}

/**
 * NFT 캐릭터 Lock, Unlock 에 필요한 데이터
 */
export class NftCharacterStatusUpdateDto extends CharacterMintingConfirmDto {}
