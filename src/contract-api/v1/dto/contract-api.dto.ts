import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

// ######################## Input Dto ########################

export class ContractCreateInputDto {
  @ApiProperty({
    example: '3',
    description: 'Company Id',
  })
  @IsNumber()
  company: number;

  @ApiProperty({
    example: '2',
    description: 'gameIndex',
  })
  @IsNumber()
  gameIndex: number;

  @ApiProperty({
    example: 'xpla1dtc79w9599470xxr6jnz9w0zdvdjfpfuv9vkjx',
    description: 'Multi Sig Address',
  })
  @IsString()
  multiAddress: string;

  @ApiProperty({
    example: 'ABC',
    description: 'contract symbol',
  })
  @IsOptional()
  @IsString()
  contractSymbol?: string;

  @ApiProperty({
    example: '0 | 1',
    description: '0:nft, 1:lock',
  })
  @IsNumber()
  contractType: number;
}

export class ContractDeployInputDto {
  @ApiProperty({
    example: '3',
    description: 'Company Id',
  })
  @IsNumber()
  company: number;

  @ApiProperty({
    example: '2',
    description: 'gameIndex',
  })
  @IsNumber()
  gameIndex: number;

  @ApiProperty({
    example: '',
    description: 'requestId',
  })
  @IsString()
  requestId: string;

  @ApiProperty({
    example: 'xpla1dtc79w9599470xxr6jnz9w0zdvdjfpfuv9vkjx',
    description: 'Multi Sig Address',
  })
  @IsString()
  multiAddress: string;

  @ApiProperty({
    example: 'xpla1dtc79w9599470xxr6jnz9w0zdvdjfpfuv9vkjx',
    description: 'provider Address',
  })
  @IsString()
  providerAddress: string;

  @ApiProperty({
    example: '',
    description: 'signedTx',
  })
  @IsString()
  signedTx: string;
}

// ######################## Output Dto ########################
export class WalletListOutPutDto {
  @IsArray()
  walletList: Wallet[];
}

export class ContractWalletListOutputDto extends WalletListOutPutDto {
  @IsNumber()
  contractCount: number;

  @IsArray()
  contractList: any;
}

export class GameListOutPutDto {
  @IsArray()
  walletList: Wallet[];

  @IsArray()
  gameList: Game[];
}

export class ContractCreateOutputDto {
  @IsBoolean()
  error: boolean;

  @IsObject()
  txInfo: any;
}

export class ContractDeployOutputDto {
  @IsBoolean()
  error: boolean;

  @IsObject()
  txInfo: any;
}

// ######################## Common ########################
export class Wallet {
  @ApiProperty({
    example: '1',
    description: '',
  })
  @IsNumber()
  id: number;

  @ApiProperty({
    example: '1',
    description: 'Company Id',
  })
  @IsNumber()
  company: number;

  @ApiProperty({
    example: 'com.com2us.c2xwallet.global.normal',
    description: 'single Address',
  })
  @IsString()
  singleAddress: string;

  @ApiProperty({
    example: 'xpla1dtc79w9599470xxr6jnz9w0zdvdjfpfuv9vkjx',
    description: 'multi Address',
  })
  @IsString()
  multiAddress: string;

  @ApiProperty({
    example: '[game1, game2]',
    description: 'game name',
  })
  @IsString()
  gameList?: string[];
}

export class Game {
  @ApiProperty({
    example: '1',
    description: 'Company Id',
  })
  @IsNumber()
  company: number;

  @ApiProperty({
    example: '1',
    description: 'game Index',
  })
  @IsNumber()
  gameIndex: number;

  @ApiProperty({
    example: 'nftContract',
    description: 'nftContract',
  })
  @IsOptional()
  @IsString()
  nftContract?: string;

  @ApiProperty({
    example: 'lockContract',
    description: 'lockContract',
  })
  @IsOptional()
  @IsString()
  lockContract?: string;

  @ApiProperty({
    example: 'com.com2us.c2xwallet.global.normal',
    description: 'single Address',
  })
  @IsString()
  singleAddress: string;

  @ApiProperty({
    example: 'xpla1dtc79w9599470xxr6jnz9w0zdvdjfpfuv9vkjx',
    description: 'multi Address',
  })
  @IsString()
  multiAddress: string;
}
