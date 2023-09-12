import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ExtensionDto } from '../../../commom/dto/metadata-v1.dto';
import { nftStatus } from '../../../enum/common.enum';

export class GameServerChannelResDto {
  @ApiProperty({ example: 1, description: '서버 하위 채널 명' })
  channelName: string;

  @ApiProperty({ example: 1, description: '채널 고유 식별 코드' })
  channelId: string;

  @ApiProperty({
    type: [GameServerChannelResDto],
    description: '하위 채널 정보',
  })
  @ApiPropertyOptional()
  channels?: GameServerChannelResDto[];
}

export class GameServerResDto {
  @ApiProperty({ example: 'KR1', description: '게임 서버 명' })
  serverName: string;

  @ApiProperty({ example: '1', description: '게임 서버 고유 식별 코드' })
  serverId: string;

  @ApiProperty({
    type: [GameServerChannelResDto],
    description: '서버 하위 채널 정보',
  })
  @ApiPropertyOptional()
  channels?: GameServerChannelResDto[];
}

export class GameCharacterResDto {
  @ApiProperty({ example: 'NickName', description: '캐릭터 명 (닉네임 등)' })
  characterName: string;

  @ApiProperty({ example: '1', description: '캐릭터 고유 식별 코드' })
  characterId: string;
}

export class GameGoodsResDto {
  @ApiProperty({ example: 'goldCode', description: '재화 고유 식별 코드' })
  goodsCode: string;

  @ApiProperty({ example: 'gold', description: '재화 명' })
  goodsName: string;

  @ApiProperty({ example: 100, description: '재화 수량' })
  amount: number;
}

export class MintResDto {
  @ApiProperty({ example: 'sword1', description: '이름' })
  name: string;

  @ApiProperty({
    example: 'sword1 description',
    description: '설명',
  })
  @ApiPropertyOptional()
  description?: string;

  @ApiProperty({
    example: 'uniqCode1',
    description: '고유 식별 코드',
  })
  uniqueId: string;

  @ApiProperty({
    example: 'https://image01.c2x.world/equip_92053030.gif',
    description: '이미지 정보',
  })
  image: string;

  @ApiProperty({
    example: nftStatus.nonNFT,
    description: '1: Non-NFT, 2: Locked NFT, 3: Unlocked NFT',
    enum: [nftStatus.unLockedNFT, nftStatus.LockedNFT, nftStatus.nonNFT],
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
    description: '조합 민팅일 경우에만 사용 (조합 민팅에 사용된 횟수)',
  })
  @ApiPropertyOptional()
  mintingFeeCode?: number;
}

export class MintDataResDto {
  @ApiProperty({
    example: 'uniqCode1',
    description: '고유 식별 코드',
  })
  uniqueId: string;

  @ApiProperty({
    description: '민팅에 필요한 metadata',
    type: [ExtensionDto],
  })
  extension: ExtensionDto;
}
