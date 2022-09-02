import { Body, Controller, Get, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { V1BroadcastService } from './v1.broadcast.service';
import {
  V1GameApiBroadcastInputDto,
  V1GameApiBroadcastOutputDto,
} from '../dto/game-api-v1-broadcast.dto';
import { GameApiHttpStatus } from '../../../exception/request.exception';
import { CommonResponseDto } from '../../../commom/dto/common-response.dto';

@ApiBearerAuth()
@ApiTags('Game API')
@Controller({
  version: '1',
})
export class V1BroadcastController {
  constructor(private readonly broadcastService: V1BroadcastService) {}

  @Post('broadcast')
  @ApiOperation({ summary: 'broadcast to xpla' })
  @ApiResponse({
    status: 200,
    description: '',
    type: V1GameApiBroadcastInputDto,
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async broadcast(
    @Body() body: V1GameApiBroadcastInputDto,
  ): Promise<V1GameApiBroadcastOutputDto> {
    const requestId = body.requestId;
    const signedTx = body.signedTx;

    const result = await this.broadcastService.broadcast(requestId, signedTx);

    return result;
    // return new CommonResponseDto(GameApiHttpStatus.OK, 'success', result);
  }

  @Post('txCheck')
  @ApiOperation({ summary: 'tx status check' })
  @ApiResponse({
    status: 200,
    description: '',
    // type: V1GameApiBroadcastInputDto,
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async txCheck(@Body() body: any): Promise<any> {
    const result = {
      a: 'a',
    };
    return new CommonResponseDto(GameApiHttpStatus.OK, 'success', result);
  }
}
