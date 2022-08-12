import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNumberString,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

export class AttributeDto {
  @ApiProperty({ example: 'Category', description: 'category name' })
  @IsString()
  trait_type?: string;

  @ApiProperty({ example: '', description: 'optional value' })
  @IsNumberString()
  max_value?: string | number;

  @ApiProperty({ example: 'Game', description: 'value' })
  @IsNumberString()
  value: string | number;

  @ApiProperty({ example: '', description: 'display type' })
  @IsObject()
  display_type?: any;
}

export class ExtensionDto {
  @ApiProperty({ example: "Arbiter's Robe", description: 'name' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'desc', description: 'desc', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: 'https://image01.c2x.world/equip_92053030.gif',
    description: 'image url',
  })
  @IsUrl()
  image: string;

  @ApiProperty({
    example: 'https://image01.c2x.world/equip_92053030.gif',
    description: 'animation url',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  animation_url?: string;

  @ApiProperty({ example: '', description: 'youtube url', required: false })
  @IsOptional()
  @IsUrl()
  youtube_url?: string;

  @ApiProperty({ example: '', description: 'market url', required: false })
  @IsOptional()
  @IsString()
  image_data?: string;

  @ApiProperty({
    example: 'https://dex.c2xnft.com/market?key=4423',
    description: 'market url',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  external_url?: string;

  @ApiProperty({
    example: '',
    description: 'background color',
    required: false,
  })
  @IsOptional()
  @IsString()
  background_color?: string;

  @ApiProperty({ type: [AttributeDto], description: 'attribute' })
  @IsArray()
  attributes: AttributeDto[];
}
