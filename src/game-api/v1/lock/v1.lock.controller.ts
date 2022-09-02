import { Body, Controller, Get, Headers, Param, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CommonResponseDto } from '../../../commom/dto/common-response.dto';
import { GameApiHttpStatus } from '../../../exception/request.exception';
import { V1LockService } from './v1.lock.service';
import {
  V1LockedNftListInputDto,
  V1LockInputDto,
  V1UnLockInputDto,
  V1LockOutputDto,
} from '../dto/game-api-v1-lock.dto';

@ApiBearerAuth()
@ApiTags('Game API')
@Controller({
  version: '1',
})
export class V1LockController {
  constructor(private readonly v1LockService: V1LockService) {}

  @Post('/lock/nftList')
  @ApiOperation({ summary: 'nft lock' })
  @ApiResponse({
    status: 200,
    description: '',
    type: V1LockedNftListInputDto,
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async lockedNftList(
    @Body() body: V1LockedNftListInputDto,
  ): Promise<CommonResponseDto<V1LockOutputDto>> {
    const result = await this.v1LockService.lockedNftList(body);
    return new CommonResponseDto(GameApiHttpStatus.OK, 'success', result);
  }

  @Post('/lock/executeLock')
  @ApiOperation({ summary: 'nft lock' })
  @ApiResponse({
    status: 200,
    description: '',
    type: V1LockInputDto,
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async lock(
    @Body() body: V1LockInputDto,
  ): Promise<CommonResponseDto<V1LockOutputDto>> {
    const result = await this.v1LockService.lock(body);
    return new CommonResponseDto(GameApiHttpStatus.OK, 'success', result);
  }

  @Post('/lock/executeUnLock')
  @ApiOperation({ summary: 'nft unlock' })
  @ApiResponse({
    status: 200,
    description: '',
    type: V1UnLockInputDto,
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async unLock(
    @Body() body: V1UnLockInputDto,
  ): Promise<CommonResponseDto<any>> {
    const result = await this.v1LockService.unLock(body);

    return new CommonResponseDto(GameApiHttpStatus.OK, 'success', result);
  }
}
