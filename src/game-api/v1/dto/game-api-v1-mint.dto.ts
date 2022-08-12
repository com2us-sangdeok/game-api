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
import { ExtensionDto } from '../../../metadata-api/v1/dto/metadata-v1.dto';

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
  // @ApiProperty({
  //   example: 'https://image01.c2x.world/equip_96022030.gif',
  //   description: 'Image URL',
  // })
  // @IsString()
  // imageUrl: string;

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

export class GameApiV1ValidItemDto {
  @ApiProperty({ example: 1234, description: 'Game index' })
  @IsNumber()
  gameIndex: number;

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
  @IsNumber()
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
}

export class GameApiV1MintDto extends GameApiV1ValidItemDto {
  @ApiProperty({
    example: 'GAME-API-9fb4b2f7-850b-449d-bda1-fa4c2b81af79',
    description: 'request id for mint',
  })
  @IsString()
  requestId: string;

  @ApiProperty({
    example: 'test01',
    description: 'valid item/character id for minting',
  })
  @IsString()
  goodsId: string;

  @ApiProperty({ example: 10, description: 'c2x fee' })
  @IsNumber()
  ctxFee: number;

  @ApiProperty({ example: 5, description: 'game token fee' })
  @IsNumber()
  tokenFee: number;

  @ApiProperty({ type: ExtensionDto, description: 'metadata-api for minting' })
  metadata?: ExtensionDto;
}

export class GameApiV1CalculateMintingFeeDto {
  c2xFee: number;
  tokenFee: number;
}

export class GameApiV1ResponseValidItemDto extends GameApiV1CalculateMintingFeeDto {
  metadata: ExtensionDto;
  requestId: string;
  goodsId: string;
}

export class GameApiV1ResponseMintDto {
  tokenId: string;
  unsignedTx: string;
  payerAddress: string;
  tokenUri: string;
}

export class GameApiV1MintItemDto {
  gameIndex: number;
  appId: string;
  playerId: string;
  categoryCode: string;
}

export class GameApiV1ResponseMintItemDto {
  itemId: string;
  itemUrl: string;
  feeCount: number;
}