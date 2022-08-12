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

export class GameApiV1BroadcastDto {
  @ApiProperty({
    example: 'GAME-API-9fb4b2f7-850b-449d-bda1-fa4c2b81af79',
    description: 'request id for broadcast',
  })
  @IsString()
  requestId: string;

  @ApiProperty({ example: 'asdfasdfasd', description: 'signed tx' })
  signedTx: string;

  @ApiProperty({
    example: 'terra1x46rqay4d3cssq8gxxvqz8xt6nwlz4td20k38v',
    description: 'fee payer address',
  })
  feePayerAddress: string;
}
