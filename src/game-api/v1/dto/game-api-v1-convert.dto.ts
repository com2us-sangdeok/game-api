import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsArray } from 'class-validator';

class ConvertCommonDto {
  // @ApiProperty({ example: 1, description: 'Game index' })
  // @IsNumber()
  // gameIndex: number;

  @ApiProperty({
    example: 'com.com2us.c2xwallet.global.normal',
    description: 'App ID',
  })
  @IsString()
  appId: string;

  @ApiProperty({
    example: ['1', '1'],
    description:
      'Server ID && Channel Id && sub Channel ID ... channel is infinite',
    required: false,
  })
  @IsArray()
  serverId?: string[];

  @ApiProperty({
    example: 'character Id',
    description: 'Is not only one character in server & channel',
    required: false,
  })
  @IsString()
  characterId?: string;

  @ApiProperty({ example: '13453245', description: 'Player ID' })
  @IsString()
  playerId: string;
}

//##############################################################
//########################## INPUT ############################
//##############################################################

export class V1ConvertCurrencyInfoInputDto extends ConvertCommonDto {
  @ApiProperty({
    example: 'xpla1nlnang3a8wwgwx0sm4zut9ygx8mrvdes5n9m3g',
    description: 'User Wallet Address',
  })
  @IsString()
  accAddress: string;
}

export class V1ConvertToCurrencyInputDto extends ConvertCommonDto {
  @ApiProperty({
    example: 'xpla1nlnang3a8wwgwx0sm4zut9ygx8mrvdes5n9m3g',
    description: 'User Wallet Address',
  })
  @IsString()
  accAddress: string;

  @ApiProperty({
    example: '1001000801',
    description: '1001000801 -> XPLA , 1001000802 -> GAME TOKEN',
  })
  @IsString()
  convertTypeCd: string;

  @ApiProperty({
    example: '15.5',
    description: 'exchange amount',
  })
  @IsString()
  amount: string;
}

export class V1ConvertToTokenInputDto extends ConvertCommonDto {
  @ApiProperty({
    example: 'xpla1nlnang3a8wwgwx0sm4zut9ygx8mrvdes5n9m3g',
    description: 'User Wallet Address',
  })
  @IsString()
  accAddress: string;

  @ApiProperty({
    example: '1001000801',
    description: '1001000801 -> XPLA , 1001000802 -> GAME TOKEN',
  })
  @IsString()
  convertTypeCd: string;

  @ApiProperty({
    example: '15000',
    description: 'exchange amount',
  })
  @IsString()
  amount: string;
}

export class V1ConvertBroadcast {
  @ApiProperty({
    example: '1ebc36e5-a460-4eba-bc86-53b2a69ff33c',
    description: 'requestId',
  })
  @IsString()
  requestId: string;

  @ApiProperty({
    example:
      'Co0BCooBChwvY29zbW9zLmJhbmsudjFiZXRhMS5Nc2dTZW5kEmoKLHRlcnJhMXg0NnJxYXk0ZDNjc3NxOGd4eHZxejh4dDZud2x6NHRkMjBrMzh2Eix0ZXJyYTFkcGF1OGFmOHF1M2NwdHVyYWNxdTI2dXdubjJ3YWdmcWd1M2M0cBoMCgR1dXNkEgQxMDAwEhUSEwoNCgR1dXNkEgUxMzcxOBC5ygU=',
    description: 'encoded signed tx ',
  })
  @IsString()
  signedTx: string;
}

//##############################################################
//########################## OUTPUT ############################
//##############################################################

class V1ConvertCurrencyInfo {
  @ApiProperty({
    example: '1001000801',
    description: '1001000801 -> XPLA , 1001000802 -> GAME TOKEN',
  })
  @IsString()
  convertTypeCd: string;

  @ApiProperty({
    example: 'gold',
    description: 'Game Currency Name',
  })
  @IsString()
  goodsName: string;

  @ApiProperty({
    example: 'goldCode',
    description: 'Game Currency Code',
  })
  @IsString()
  goodsCode: string;

  @ApiProperty({
    example: 'gold.png',
    description: 'Game Currency Image',
  })
  @IsString()
  goodsImage: string;

  @ApiProperty({
    example: 1000,
    description: 'Minumum Exchange Amount for one time',
  })
  @IsNumber()
  minConvertQuantityOneTime: number;

  @ApiProperty({
    example: 100000,
    description: 'Maximum Exchange Amount for a day',
  })
  @IsNumber()
  maxConvertQuantityDays: number;

  @ApiProperty({
    example: 'xpla',
    description: 'Game Token Name',
  })
  @IsString()
  tokenName: string;

  @ApiProperty({
    example: 'gametoken.png',
    description: 'Game Token Image',
  })
  @IsString()
  tokenImage: string;

  @ApiProperty({
    example: {},
    description: 'Game Token Amount Info',
  })
  tokenAmount: any;

  @ApiProperty({
    example: '60000',
    description: 'Game Currency Amount',
  })
  @IsString()
  currencyAmount: string;

  @ApiProperty({
    example: 60000,
    description: 'Currently Avalible Exchange Amount',
  })
  @IsString()
  avalibleAmount: string;

  @ApiProperty({
    example: 100,
    description: 'Exchange Rate => 1 (xpla | gameToken) = ?',
  })
  @IsNumber()
  exchangeRate: number;
}

export class V1ConvertCurrencyInfoOutputDto extends ConvertCommonDto {
  @ApiProperty({
    example: 'xpla1nlnang3a8wwgwx0sm4zut9ygx8mrvdes5n9m3g',
    description: 'game provider address',
  })
  @IsString()
  providerAddress: string;

  @ApiProperty({
    example: 'xpla1pg4dxed60q3w5a6dy8ca84q7wa7d9qm0amxw5j7zmwcpvgefg6xshvdmh6',
    description: 'Game Token Contract Address',
  })
  @IsString()
  tokenContract: string;

  apiList?: { apiTypeCd: string; apiUrl: string }[];

  @ApiProperty({ description: 'currency info', type: [V1ConvertCurrencyInfo] })
  currency: V1ConvertCurrencyInfo[];
}

export class V1ConvertToCurrencyOutputDto extends ConvertCommonDto {
  @ApiProperty({
    example: '0bcb3d46-e8b3-45cd-8c4b-e791244a3590',
    description: 'broadcast시 필수값',
  })
  @IsString()
  txUuid: string;

  @ApiProperty({
    example:
      'Co0BCooBChwvY29zbW9zLmJhbmsudjFiZXRhMS5Nc2dTZW5kEmoKLHRlcnJhMXg0NnJxYXk0ZDNjc3NxOGd4eHZxejh4dDZud2x6NHRkMjBrMzh2Eix0ZXJyYTE3NTd0a3gwOG4wY3FydzdwODZueTlsbnhzcWV0aDB3Z3AwZW05NRoMCgR1dXNkEgQxMDAwEhUSEwoNCgR1dXNkEgUxMzg5MBC30wU=',
    description: 'base64 encoded string',
  })
  @IsString()
  unSignedTx: string;
}
