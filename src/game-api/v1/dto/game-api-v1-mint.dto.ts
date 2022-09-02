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
import { MintType } from '../../../enum';

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

  @ApiProperty({ example: 0, description: 'Minting fee code' })
  @IsString()
  mintingFeeCode: number;
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

export class GameApiV1defaultDto {
  @ApiProperty({ example: 1234, description: 'Game index' })
  @IsNumber()
  gameIndex: number;

  @ApiProperty({
    example: 'com.com2us.c2xwallet.global.normal',
    description: 'App ID',
  })
  @IsString()
  appId: string;

  @ApiProperty({ example: ['1', '1'], description: 'Server/channel ID' })
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
}

export class GameApiV1ValidItemDto extends GameApiV1defaultDto {
  @ApiProperty({
    example: 'xpla16v6y48xllwy7amcmvhkv0a3zp7jepl44yvhvxt',
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

export class GameApiV1MintDto extends GameApiV1defaultDto {
  @ApiProperty({
    example: 'xpla1my0sjrk4aysgqd42gre4m7ktmf20law6462h45',
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
    example: 'GAME-API-9fb4b2f7-850b-449d-bda1-fa4c2b81af79',
    description: 'request id for mint',
  })
  @IsString()
  requestId: string;

  @ApiProperty({
    example: 'MintuniqCode1',
    description: 'valid item/character id for minting',
  })
  @IsString()
  id: string;

  @ApiProperty({ example: '0.130000000000000000', description: 'xpla fee' })
  @IsString()
  serviceFee: string;

  @ApiProperty({ example: '0.130000000000000000', description: 'game token fee' })
  @IsString()
  gameFee: string;

  @ApiProperty({
    type: ExtensionDto,
    description: 'metadata-api for minting',
  })
  metadata?: ExtensionDto;
}

export class GameApiV1CalculateMintingFeeDto {
  serviceFee: string;
  gameFee: string;
}

export class GameApiV1ResponseValidItemDto extends GameApiV1CalculateMintingFeeDto {
  @ApiProperty({
    type: ExtensionDto,
    description: 'metadata information',
  })
  metadata: ExtensionDto;

  @ApiProperty({
    example: 'GAME-API-7de23754-4b99-4337-90f6-df8871ce4fae',
    description: 'request ID',
  })
  requestId: string;

  @ApiProperty({
    example: 'unique',
    description: 'unique ID for the character or item',
  })
  id: string;
}

export class GameApiV1ResponseMintDto {
  @ApiProperty({
    example: '1-1',
    description: 'nft token ID',
  })
  tokenId: string;

  @ApiProperty({
    example: '31CF564675A78B54C4F054B6F98F5DF2ABD54C088A88E42...',
    description: 'unsigned transaction',
  })
  unsignedTx: string;

  @ApiProperty({
    example: 'https://www.com2us.com/nft/metadata.json',
    description: 'metadata url of nft',
  })
  tokenUri: string;

  @ApiProperty({
    example: 'xpla1my0sjrk4aysgqd42gre4m7ktmf20law6462h45',
    description: 'granter address',
  })
  payerAddress?: string;

  @ApiProperty({
    example: 'GAME-API-9fb4b2f7-850b-449d-bda1-fa4c2b81af79',
    description: 'request id',
  })
  requestId: string;
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
    example: ['1', '1'],
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
  categoryType: number;
}

export class GameApiV1ResponseMintItemDto {
  itemId: string;
  itemUrl: string;
  feeCount: number;
}

export class GameApiV1ResMintItemDto {
  @ApiProperty({
    example: [{
      name: 'sword2',
      description: 'sword1 description',
      uniqueId: 'itemUniqCode2',
      nftStatus: 3,
      tokenId: 'tokenId',
    }],
    description: 'game item list',
  })
  items: [];

  @ApiProperty({
    example: [
      {
        characterName: '캐릭터명(닉네임)1',
        characterId: '1',
      },
      {
        characterName: '캐릭터명(닉네임)2',
        characterId: '2',
      },
    ],
    description: 'game character list',
  })
  characters: [];
}

export class GameApiV1BurnItemDto extends GameApiV1defaultDto {
  @ApiProperty({
    example: 'MintuniqCode1',
    description: 'nft id',
  })
  @IsString()
  tokenId: string;

  @ApiProperty({
    example: 'xpla1h086yrxdzhgqzftk2hzcgst9gywttqd2d32g6q',
    description: 'xpla user address',
  })
  @IsString()
  accAddress: string;
}

export class GameApiV1BurnItemResDto {
  @ApiProperty({
    example: '31CF564675A78B54C4F054B6F98F5DF2ABD54C088A88E42...',
    description: 'unsigned transaction',
  })
  unsignedTx: string;

  @ApiProperty({
    example: 'GAME-API-9fb4b2f7-850b-449d-bda1-fa4c2b81af79',
    description: 'request id',
  })
  requestId: string;
}


export class TestDto {
  @ApiProperty({
    example: '31CF564675A78B54C4F054B6F98F5DF2ABD54C088A88E42...',
    description: 'unsigned transaction',
  })
  @IsString()
  unsignedTx: string;

  @ApiProperty({
    example: 'xpla16v6y48xllwy7amcmvhkv0a3zp7jepl44yvhvxt',
    description: 'user address',
  })
  @IsString()
  address: string

  @ApiProperty({
    example: 'elite leaf army replace floor coral same elegant river gather water basic fun sing odor flight roof umbrella truck claw priority guide february conduct',
    description: 'user mnemonic',
  })
  @IsString()
  mnemonic: string;
}