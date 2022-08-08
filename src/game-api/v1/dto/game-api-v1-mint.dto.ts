import {
  ApiProperty,
  IntersectionType,
  PartialType,
  PickType,
} from '@nestjs/swagger';
import {
  IsArray,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';
import { ExtensionDto } from '../../../metadata/v1/dto/metadata-v1.dto';

export class GameApiV1ConvertPoolDto {
  @ApiProperty({ example: 'afkraid', description: 'game app name' })
  @IsString()
  appName: string;

  @ApiProperty({ example: 100, description: 'lower game currency' })
  lowerGameCurrency: number;

  @ApiProperty({ example: 0, description: 'game token' })
  gameToken: number;

  @ApiProperty({ example: 100, description: 'upper game currency' })
  upperGameCurrency: number;

  @ApiProperty({ example: 0, description: 'c2x' })
  ctx: number;
}

export class GameApiV1ImageUrlAndMintingFeeCodeDto {
  @ApiProperty({
    example: 'https://image01.c2x.world/equip_96022030.gif',
    description: 'Image URL',
  })
  @IsString()
  imageUrl: string;

  @ApiProperty({ example: '1', description: 'Minting fee code' })
  @IsString()
  mintingFeeCode: string;
}

export class GameApiV1MintingItemDto extends GameApiV1ImageUrlAndMintingFeeCodeDto {
  @ApiProperty({
    example: 'equip_96022030',
    description: 'Item ID for minting',
  })
  @IsString()
  itemId: string;
}

export class GameApiV1MintingTokenDto extends GameApiV1ImageUrlAndMintingFeeCodeDto {
  @ApiProperty({ example: '84039', description: 'NFT ID for minting' })
  @IsString()
  tokenId: string;
}

export class GameApiV1MintDto {
  @ApiProperty({ example: 'asia_app', description: 'App ID' })
  @IsString()
  appId: string;

  @ApiProperty({ example: 'asia_server', description: 'Server ID' })
  @IsString()
  serverId: string;

  @ApiProperty({ example: 'asia_channel', description: 'Channel ID' })
  @IsString()
  @IsOptional()
  channelId: string;

  @ApiProperty({ example: 13453245, description: 'Player ID' })
  @IsString()
  playerId: number;

  @ApiProperty({
    example: 'terra1x46rqay4d3cssq8gxxvqz8xt6nwlz4td20k38v',
    description: 'User Address',
  })
  @IsString()
  accAddress: string;

  @ApiProperty({
    example: 'item',
    description: 'minting type {item, items, character}',
  })
  @IsString()
  mintType: string;

  @ApiProperty({
    type: [GameApiV1MintingItemDto],
    description: 'Items for minting',
  })
  @IsOptional()
  @IsArray()
  items: GameApiV1MintingItemDto[];

  @ApiProperty({
    type: [GameApiV1MintingTokenDto],
    description: 'tokens for minting',
  })
  @IsOptional()
  @IsArray()
  tokens: GameApiV1MintingTokenDto[];

  @ApiProperty({ type: [ExtensionDto], description: 'metadata for minting' })
  metadata: ExtensionDto;
}


export class GameApiV1ResponseMintItemDto extends ExtensionDto {
  feeCount: number
}