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
  V1GameApiTxCheckInputDto,
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
    type: V1GameApiTxCheckInputDto,
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async txCheck(@Body() body: V1GameApiTxCheckInputDto): Promise<any> {
    console.log('^^^^^^^^');

    const tt = await this.broadcastService.broadcast(
      '10e771b2-71b1-4ef8-b5ff-1955cd647e1a',
      '7E48EE001092EC0F8631B6AFBDAF7F8AE18BD1BBC23DC3C67B60DFC88B660571',
    );

    console.log('%%%%%%%%%%%%%%%% tt %%%%%%%%%%%%%%%%%%%%%%');
    console.log(tt);
    console.log('%%%%%%%%%%%%%%%% tt %%%%%%%%%%%%%%%%%%%%%%');
    const result = await this.broadcastService.txCheck(body.txHash);

    console.log('$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$');
    console.log(result);
    console.log('$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$');
    return new CommonResponseDto(GameApiHttpStatus.OK, 'success', result);
  }
}
