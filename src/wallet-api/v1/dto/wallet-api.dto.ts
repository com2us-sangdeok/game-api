import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsNumber, IsString } from 'class-validator';
import { WalletTypeEnum } from '../../../enum/wallet-type.enum';

// ######################## Input Dto ########################
export class WalletCreateInputDto {
  @ApiProperty({
    example: '3',
    description: 'Company Id',
  })
  @IsNumber()
  company: number;

  @ApiProperty({
    example: 'xpla1dtc79w9599470xxr6jnz9w0zdvdjfpfuv9vkjx',
    description: 'Provider Address',
  })
  @IsString()
  address: string;

  @ApiProperty({
    example: '',
    description: '',
  })
  @IsString()
  publicKey: string;

  @ApiProperty({
    example: 'SINGLE / MULTI',
    description: '지갑 타입',
  })
  @IsString()
  walletType: WalletTypeEnum;

  @ApiProperty({
    example: 'xpla1dtc79w9599470xxr6jnz9w0zdvdjfpfuv9vkjx',
    description: 'Provider Address',
  })
  @IsString()
  providerAddress: string;
}

export class WalletDeleteInputDto {
  @ApiProperty({
    example: '3',
    description: 'Company Id',
  })
  @IsNumber()
  company: number;

  @ApiProperty({
    example: 'xpla1dtc79w9599470xxr6jnz9w0zdvdjfpfuv9vkjx',
    description: 'Provider Address',
  })
  @IsString()
  address: string;
}

// ######################## Output Dto ########################
export class WalletListOutPutDto {
  @IsArray()
  walletList: Wallet[];
}

export class WalletCreateOutPutDto {
  @IsBoolean()
  error: boolean;

  @IsArray()
  walletList: Wallet[];
}

export class WalletDeleteOutPutDto {
  @IsBoolean()
  error: boolean;

  @IsArray()
  walletList: Wallet[];
}

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

// ####################### DB ###################################

export class GameNameDBDto {
  address: string;

  gameIndex: number;

  gameName: string;

  appId: string;
}
