import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsArray } from 'class-validator';

class LockCommonDto {
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
//########################## INPUT 1############################
//##############################################################

export class V1LockedNftListInputDto extends LockCommonDto {
  @ApiProperty({
    example: 'xpla1nlnang3a8wwgwx0sm4zut9ygx8mrvdes5n9m3g',
    description: 'User Wallet Address',
  })
  @IsString()
  accAddress: string;
}

export class V1LockInputDto extends LockCommonDto {
  @ApiProperty({
    example: 'xpla1nlnang3a8wwgwx0sm4zut9ygx8mrvdes5n9m3g',
    description: 'User Wallet Address',
  })
  @IsString()
  accAddress: string;

  @ApiProperty({
    example: '1',
    description: 'Nft Token Id',
  })
  @IsString()
  tokenId: string;
}

export class V1UnLockInputDto extends LockCommonDto {
  @ApiProperty({
    example: 'xpla1nlnang3a8wwgwx0sm4zut9ygx8mrvdes5n9m3g',
    description: 'User Wallet Address',
  })
  @IsString()
  accAddress: string;

  @ApiProperty({
    example: '1',
    description: 'Nft Token Id',
  })
  @IsString()
  tokenId: string;
}

//##############################################################
//########################## OUTPUT ############################
//##############################################################
export class V1LockOutputDto {
  @ApiProperty({
    example: '84acbf74-cc98-4fce-963d-4402e9ded9dd',
    description: 'requestId',
  })
  @IsString()
  requestId: string;

  @ApiProperty({
    example: '1',
    description: 'Nft Token Id',
  })
  @IsString()
  tokenId: string;

  @ApiProperty({
    example: 'xpla1dvhtedfg5l3ah59g4uszzcsu7rgz4hgxgteuqmhv3c4z42dhk64s6vhum0',
    description: 'Nft Token Contract Address',
  })
  @IsString()
  nftContract: string;

  @ApiProperty({
    example:
      'CsACCr0CCiQvY29zbXdhc20ud2FzbS52MS5Nc2dFeGVjdXRlQ29udHJhY3QSlAIKK3hwbGExbmxuYW5nM2E4d3dnd3gwc200enV0OXlneDhtcnZkZXM1bjltM2cSP3hwbGExZHZodGVkZmc1bDNhaDU5ZzR1c3p6Y3N1N3JnejRoZ3hndGV1cW1odjNjNHo0MmRoazY0czZ2aHVtMBqjAXsic2VuZF9uZnQiOnsibXNnIjoiZXlKc2IyTnJJanA3SW14dlkydGZhVzVtYnlJNklqRmZkR1Z6ZEY5MWNta2lmWDA9IiwiY29udHJhY3QiOiJ4cGxhMWd2M2ZjcTRlM3oyZ210cnRubGRmOWxtcXBnMzdrMnIwdnh4M25kNnhnZHNubThjdWxnM3NrZzhwZmMiLCJ0b2tlbl9pZCI6IjEifX0SIxIhChsKBWF4cGxhEhIzNTk5MzkzMDAwMDAwMDAwMDAQouwZ',
    description: 'encoded Unsigned Tx',
  })
  @IsString()
  unSignedTx: string;
}

export class V1UnLockOutputDto {
}
