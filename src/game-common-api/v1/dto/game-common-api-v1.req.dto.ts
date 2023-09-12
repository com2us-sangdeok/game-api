import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsDecimal,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  Matches,
} from 'class-validator';

export class SearchAppidReqDto {
  @ApiProperty({
    example: 'com.com2us.hivesdk.c2xwallet.hivepc.kr.test',
    description: 'APP 식별 ID (앱센터 등록)',
    required: true,
  })
  @Matches(/^[a-zA-Z0-9.]+$/, {
    message: 'appid 영문, 숫자, 특수문자 - _+() 만 가능 합니다.',
  })
  @IsString()
  appid: string;
}

export class BlockChainGameReqDto {
  @ApiProperty({
    example: 1,
    description: '페이지',
    required: true,
  })
  @IsNumberString()
  page: number;
}

export class MaintenanceReqDto {
  @ApiProperty({
    example: 'com.com2us.hivesdk.c2xwallet.hivepc.kr.test',
    description: '앱센터에 등록한 앱아이디',
    required: true,
  })
  @IsString()
  appid: string;

  @ApiProperty({
    example: 'KR',
    description: '서버 ID',
    required: true,
  })
  @IsString()
  serverId: string;
}
