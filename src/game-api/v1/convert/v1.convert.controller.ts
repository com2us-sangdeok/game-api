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
    let data;
    let code = GameApiHttpStatus.OK;
    if (Number(body.amount) <= 0) {
      data = 'input amount < 0 ';
      code = GameApiHttpStatus.NO_CONTENT;
    }
    if (
      body.convertTypeCd !== CommonCode.CONVERT_COIN_GAME &&
      body.convertTypeCd !== CommonCode.CONVERT_TOKEN_GAME
    ) {
      data = 'convertTypeCode is not matched';
      code = GameApiHttpStatus.NO_CONTENT;
    } else {
      const result = await this.v1ConvertService.convertToCurrency(body);
      code = result.code;
      data = result.data;
      //유저 sign후 broadcast시 필수값
    }
    return new CommonResponseDto(code, 'success', data);
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
    return new CommonResponseDto(<any>GameApiHttpStatus.OK, 'success', result);
  }

  //TODO 테스트로 만듬 추후 통합 예정
  @Post('/convert/broadcast')
  @ApiOperation({ summary: 'Convert Game Currency to Game Token ' })
  @ApiResponse({
    status: 200,
    description: '',
    type: V1ConvertBroadcast,
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async broadcast(@Body() body: V1ConvertBroadcast): Promise<any> {
    const result = await this.v1ConvertService.convertBroadcast(body);
    return new CommonResponseDto(GameApiHttpStatus.OK, 'success', result);
  }
}
