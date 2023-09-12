import { Headers, Get, Query, Body, Controller, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiQuery,
} from '@nestjs/swagger';
import { CommonResponseDto } from '../../commom/dto/common-response.dto';
import { GameApiHttpStatus } from '../../exception/exception';
import { WalletApiService } from './wallet-api.service';
import {
  WalletCreateInputDto,
  WalletCreateOutPutDto,
  WalletDeleteInputDto,
  WalletDeleteOutPutDto,
  WalletListOutPutDto,
} from './dto/wallet-api.dto';

@ApiBearerAuth()
@ApiTags('지갑 관리')
@Controller({
  version: '1',
})
export class WalletApiController {
  constructor(private readonly walletV1Service: WalletApiService) {}

  @Get('/wallet/list')
  @ApiOperation({
    summary: '지갑 주소 리스트 정보 가져오기',
    description: '',
  })
  @ApiQuery({
    name: 'company',
    example: '1',
    required: true,
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({
    status: 200,
    description: '',
    type: WalletListOutPutDto,
  })
  async list(
    @Headers() headers,
    @Query() query,
  ): Promise<CommonResponseDto<any>> {
    let lang = 'en';
    if (headers.lang) lang = headers.lang;

    const param = {
      ...query,
      lang: lang,
    };
    const result = await this.walletV1Service.walletList(param);

    return new CommonResponseDto(GameApiHttpStatus.OK, 'success', result);
  }

  @Post('/wallet/create')
  @ApiOperation({
    summary: '지갑 주소 생성하기',
    description: 'single, multi 지갑 생성',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({
    status: 200,
    description: '',
    type: WalletCreateOutPutDto,
  })
  async create(
    @Headers() headers,
    @Body() body: WalletCreateInputDto,
  ): Promise<CommonResponseDto<WalletCreateOutPutDto>> {
    let lang = 'en';
    if (headers.lang) lang = headers.lang;

    const param = {
      ...body,
      lang: lang,
    };
    const result = await this.walletV1Service.createWallet(param);

    return new CommonResponseDto(GameApiHttpStatus.OK, 'success', result);
  }

  @Post('/wallet/delete')
  @ApiOperation({
    summary: '지갑 주소 삭제하기',
    description: '지갑 주소 삭제',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({
    status: 200,
    description: '',
    type: WalletDeleteOutPutDto,
  })
  async delete(
    @Headers() headers,
    @Body() body: WalletDeleteInputDto,
  ): Promise<CommonResponseDto<WalletDeleteOutPutDto>> {
    let lang = 'en';
    if (headers.lang) lang = headers.lang;

    const param = {
      ...body,
      lang: lang,
    };
    const result = await this.walletV1Service.deleteWallet(param);

    return new CommonResponseDto(GameApiHttpStatus.OK, 'success', result);
  }
}
