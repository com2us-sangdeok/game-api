import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString, IsUrl } from 'class-validator';

export class AssetDto {
  @ApiProperty({
    example: 'https://image01.c2x.world/equip_92053030.gif',
    description: 'image url',
  })
  @IsUrl()
  url: string;
}

export class ImageDto {
  buffer: Buffer;

  @IsString()
  path?: string;

  @IsString()
  filename: string;

  @IsBoolean()
  isOriginal: boolean;
}
