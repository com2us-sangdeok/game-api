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
import {MintType} from "../../../enum";

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
    example: 'sword',
    description: `name of item`,
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'equip_96022030',
    description: `description of item`,
  })
  @IsString()
  description: string;

  @ApiProperty({
    example: 'assa123',
    description: 'item ID',
  })
  @IsString()
  uniqueId: string;

  // @ApiProperty({
  //   example: 'equip_96022030',
  //   description: 'Item ID for minting',
  // })
  // @IsString()
  // tokenId: string;
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

  @ApiProperty({ example: 'com.com2us.c2xwallet.global.normal', description: 'App ID' })
  @IsString()
  appId: string;

  @ApiProperty({ example: ['1','1'], description: 'Server/channel ID' })
  @IsArray()
  server: string[];

  @ApiProperty({
    example: 'com2us',
    description: 'selected character ID',
  })
  @IsString()
  selectedCid: string;

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
    example: MintType.ITEM,
    description: 'minting type {item, items, character}',
  })
  @IsString()
  mintType: MintType;

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
  id: string;

  @ApiProperty({ example: 10, description: 'c2x fee' })
  @IsNumber()
  ctxFee: number;

  @ApiProperty({ example: 5, description: 'game token fee' })
  @IsNumber()
  tokenFee: number;

  @ApiProperty({
    type: [ExtensionDto],
    description: 'metadata-api for minting',
  })
  metadata?: ExtensionDto;
}

export class GameApiV1CalculateMintingFeeDto {
  serviceFee: number;
  gameFee: number;
}

export class GameApiV1ResponseValidItemDto extends GameApiV1CalculateMintingFeeDto {
  metadata: ExtensionDto;
  requestId: string;
  id: string;
}

export class GameApiV1ResponseMintDto {
  tokenId: string;
  unsignedTx: string;
  payerAddress: string;
  tokenUri: string;
}

export class GameApiV1MintItemDto {
  @ApiProperty({
    example: MintType.ITEM,
    description: 'minting type {item, items, character}',
  })
  @IsString()
  mintType: MintType;

  @ApiProperty({
    example: 'com.com2us.c2xwallet.global.normal',
    description: 'app ID',
  })
  @IsString()
  appId: string;

  @ApiProperty({ example: 1, description: 'player id' })
  @IsNumber()
  playerId: number;

  @ApiProperty({
    example: ['1','1'],
    description: 'server id',
  })
  @IsArray()
  server: string[];

  @ApiProperty({
    example: 'characterId',
    description: 'selected character ID',
  })
  @IsString()
  selectedCid: string;

  @ApiProperty({ example: 1, description: 'category id' })
  @IsNumber()
  categoryId: number;

  @ApiProperty({
    example: 'Inventory',
    description: 'category name',
  })
  @IsString()
  categoryName: string;

  @ApiProperty({ example: 1, description: 'category type' })
  @IsNumber()
  categoryType: number
}

export class GameApiV1ResponseMintItemDto {
  itemId: string;
  itemUrl: string;
  feeCount: number;
}

export class GameApiV1ResMintItemDto {
  items: [];
  characters: [];
}