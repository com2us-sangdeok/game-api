import { Body, Controller, Post, Request } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  V1ConvertCurrencyInfoInputDto,
  V1ConvertCurrencyInfoOutputDto,
  V1ConvertToCurrencyInputDto,
  V1ConvertToCurrencyOutputDto,
  V1ConvertBroadcast,
  V1ConvertToTokenInputDto,
} from '../dto/game-api-v1-convert.dto';
import { CommonResponseDto } from '../../../commom/dto/common-response.dto';
import { GameApiHttpStatus } from '../../../exception/request.exception';
import { ConvertPoolEntity } from '../../../entities';
import { V1ConvertService } from './v1.convert.service';
import { CommonCode } from '../../../commom/common-code';

@ApiBearerAuth()
@ApiTags('Game API')
@Controller({
  version: '1',
})
export class V1ConvertController {
  constructor(private readonly v1ConvertService: V1ConvertService) {}

  @Post('/convert/currencyInfo')
  @ApiOperation({ summary: 'Game Currency Info' })
  @ApiResponse({
    status: 200,
    description: '',
    type: V1ConvertCurrencyInfoOutputDto,
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async gameCurrencyInfo(
    @Body() body: V1ConvertCurrencyInfoInputDto,
  ): Promise<CommonResponseDto<V1ConvertCurrencyInfoOutputDto>> {
    const result = await this.v1ConvertService.currencyInfo(body);
    return new CommonResponseDto(GameApiHttpStatus.OK, 'success', result);
  }

  @Post('/convert/toCurrency')
  @ApiOperation({ summary: 'Convert Game Token to Game Currency' })
  @ApiResponse({
    status: 200,
    description: '',
    type: V1ConvertCurrencyInfoOutputDto,
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async convertToCurrency(
    @Body() body: V1ConvertToCurrencyInputDto,
  ): Promise<CommonResponseDto<V1ConvertToCurrencyOutputDto>> {
    let result;
    if (Number(body.amount) <= 0) {
      result = 'input amount < 0 ';
    } else {
      result = await this.v1ConvertService.convertToCurrency(body);
    }

    return new CommonResponseDto(GameApiHttpStatus.OK, 'success', result);
  }

  @Post('/convert/toToken')
  @ApiOperation({ summary: 'Convert Game Currency to Game Token ' })
  @ApiResponse({
    status: 200,
    description: '',
    type: V1ConvertToTokenInputDto,
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async convertToToken(
    @Body() body: V1ConvertToTokenInputDto,
  ): Promise<CommonResponseDto<any>> {
    const result = await this.v1ConvertService.convertToToken(body);
    return new CommonResponseDto(GameApiHttpStatus.OK, 'success', result);
  }
}
