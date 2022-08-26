import { Body, Controller, Get, Headers, Param, Post } from '@nestjs/common';
import { V1ConsoleService } from './v1.console.service';
import {
  GameApiV1MintDto,
  GameApiV1MintItemDto,
  GameApiV1ResponseMintDto,
  GameApiV1ResponseMintItemDto,
  GameApiV1ResponseValidItemDto,
  GameApiV1ValidItemDto,
} from '../dto/game-api-v1-mint.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CommonResponseDto } from '../../../commom/dto/common-response.dto';
import { GameApiHttpStatus } from '../../../exception/request.exception';
import {QueryRunner, Table} from "typeorm";

@ApiBearerAuth()
@ApiTags('Game API-Console')
@Controller({
  version: '1',
})
export class V1ConsoleController {
  constructor(private readonly service: V1ConsoleService) {}

  @Post('/tenant/:name')
  @ApiOperation({ summary: 'Create a new tenant' })
  @ApiResponse({
    status: 200,
    description: '',
    type: GameApiV1ResponseValidItemDto,
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async create(
    // @Body() gameApiV1ValidItemDto: GameApiV1ValidItemDto,
  ): Promise<CommonResponseDto<void>> {
    const result = await this.service.create();
    return new CommonResponseDto(GameApiHttpStatus.OK, 'success', result);
  }


}
