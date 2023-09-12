import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum categoryMintType {
  // 단일 민팅
  minting = 1,

  // 조합 민팅
  mixMintig = 2,

  // 케릭터 민팅
  CharacterMinting = 3,
}

export enum nftStatus {
  // 1: Non-NFT
  nonNFT = 1,

  // 2: Locked NFT
  LockedNFT = 2,

  // 3: Unlocked NFT
  unLockedNFT = 3,
}

export class response {
  @ApiProperty({ example: '200', description: '응답 코드' })
  code: number;

  @ApiProperty({ example: 'success', description: '코드 메시지' })
  message: string;

  @ApiProperty({ example: 'data', description: '응답 데이터' })
  data: object;
}

export class GameServer {
  @ApiProperty({ example: 'KR1', description: '게임 서버 명' })
  serverName: string;

  @ApiProperty({ example: '1', description: '게임 서버 고유 식별 코드' })
  serverId: string;

  @ApiProperty({
    type: () => GameServerChannel,
  })
  @ApiPropertyOptional()
  channels?: GameServerChannel[];
}

export class GameServerChannel {
  @ApiProperty({ example: 1, description: '서버 하위 채널 명' })
  channelName: string;

  @ApiProperty({ example: 1, description: '채널 고유 식별 코드' })
  channelId: string;

  @ApiProperty({
    example:
      '[{"channelName": "채널1","channelId": "1"},{"channelName": "채널2","channelId": "2"}]',
    description: '하위 채널 정보',
  })
  @ApiPropertyOptional()
  channels?: GameServerChannel[];
}

export class GameCharacter {
  @ApiProperty({ example: 'NickName', description: '캐릭터 명 (닉네임 등)' })
  characterName: string;

  @ApiProperty({ example: '1', description: '캐릭터 고유 식별 코드' })
  characterId: string;
}

export class mintingCharacter extends GameCharacter {
  @ApiProperty({
    example: 1,
    description: '1: Non-NFT, 2: Locked NFT, 3: Unlocked NFT',
  })
  nftStatus: nftStatus;

  @ApiProperty({
    example: 'NFT TokenId',
    description: 'NFT ID',
  })
  @ApiPropertyOptional()
  tokenId?: string;
}

export class GameGoods {
  @ApiProperty({ example: 'goldCode', description: '재화 고유 식별 코드' })
  goodsCode: string;

  @ApiProperty({ example: 'gold', description: '재화 명' })
  goodsName: string;

  @ApiProperty({ example: 100, description: '재화 수량' })
  quantity: number;
}

export class mintingItem {
  @ApiProperty({ example: 'sword1', description: '아이템 명' })
  itemName: string;

  @ApiProperty({
    example: 'sword1 description',
    description: '아이템 설명',
  })
  itemDescription: string;

  @ApiProperty({ example: 'itemcode1', description: '아이템 고유 식별 코드' })
  itemCode: string;

  @ApiProperty({
    example: 1,
    description: '1: Non-NFT, 2: Locked NFT, 3: Unlocked NFT',
    enum: [1, 2, 3],
  })
  nftStatus: nftStatus;

  @ApiProperty({
    example: 'NFT TokenId',
    description: 'NFT ID',
  })
  @ApiPropertyOptional()
  tokenId?: string;

  @ApiProperty({
    example: 1,
    description: '조합 민팅 아이템일 경우에만 사용 (조합 민팅에 사용된 횟수)',
  })
  @ApiPropertyOptional()
  breedCount?: number;
}

export class mintingItemInfo {
  @ApiProperty({
    type: () => mintingItem,
  })
  @ApiPropertyOptional()
  items?: mintingItem;

  @ApiProperty({
    type: () => mintingCharacter,
  })
  @ApiPropertyOptional()
  character?: mintingCharacter;
}
