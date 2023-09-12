import {
  Get,
  Query,
  Body,
  Controller,
  Post,
  Headers,
  Header,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiQuery,
} from '@nestjs/swagger';
import { CommonResponseDto } from '../../commom/dto/common-response.dto';
import { GameApiHttpStatus } from '../../exception/exception';
import { ContractApiService } from './contract-api.service';
import {
  ContractCreateInputDto,
  ContractCreateOutputDto,
  ContractDeployInputDto,
  ContractDeployOutputDto,
  ContractWalletListOutputDto,
  GameListOutPutDto,
  WalletListOutPutDto,
} from './dto/contract-api.dto';
import { AccAddress } from '@xpla/xpla.js';

@ApiBearerAuth()
@ApiTags('컨트랙트 관리')
@Controller({
  version: '1',
})
export class ContractApiController {
  constructor(private readonly contractV1Service: ContractApiService) {}

  @Get('/contract/multi-contract-list')
  @ApiOperation({
    summary: 'multi 지갑 주소 리스트 정보 가져오기',
    description: '',
  })
  @ApiQuery({
    name: 'company',
    example: '1',
    required: true,
  })
  @ApiQuery({
    name: 'multiAddress',
    example: 'xpla1xfwlhuy4rpdqdnpd6cjqev9pa4xt3y24tu23z7',
    required: false,
  })
  @ApiQuery({
    name: 'page',
    example: '1',
    required: false,
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({
    status: 200,
    description: '',
    type: ContractWalletListOutputDto,
  })
  async contractMultiList(
    @Headers() headers,
    @Query() query,
  ): Promise<CommonResponseDto<ContractWalletListOutputDto>> {
    if (!query.multiAddress) query.multiAddress = '';
    if (!query.page) query.page = 1;
    if (!query.orderBy) query.orderBy = 'DESC';

    let lang = 'en';
    if (headers.lang) lang = headers.lang;

    const param = {
      ...query,
      lang: lang,
    };

    const addressCheck = AccAddress.validate(param.multiAddress);
    if (!addressCheck) param.multiAddress = '';

    const result = await this.contractV1Service.walletContractInfo(param);
    return new CommonResponseDto(GameApiHttpStatus.OK, 'success', result);
  }

  @Get('/contract/multi-list')
  @ApiOperation({
    summary: '컨트랙트 생성 페이지 초기 데이터',
    description: '',
  })
  @ApiQuery({
    name: 'company',
    example: '1',
    required: true,
  })
  @ApiQuery({
    name: 'lang',
    example: 'en',
    required: true,
  })
  @ApiQuery({
    name: 'multiAddress',
    example: 'xpla1xfwlhuy4rpdqdnpd6cjqev9pa4xt3y24tu23z7',
    required: false,
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({
    status: 200,
    description: '',
    type: WalletListOutPutDto,
  })
  async multiList(
    @Headers() headers,
    @Query() query,
  ): Promise<CommonResponseDto<any>> {
    if (!query.multiAddress) query.multiAddress = '';

    let lang = 'en';
    if (headers.lang) lang = headers.lang;

    const param = {
      ...query,
      lang: lang,
    };
    const result = await this.contractV1Service.multiList(param);
    return new CommonResponseDto(GameApiHttpStatus.OK, 'success', result);
  }

  @Get('/contract/game-list')
  @ApiOperation({
    summary: '게임 리스트',
    description: '',
  })
  @ApiQuery({
    name: 'company',
    example: '1',
    required: true,
  })
  @ApiQuery({
    name: 'lang',
    example: 'en',
    required: true,
  })
  @ApiQuery({
    name: 'multiAddress',
    example: 'xpla1xfwlhuy4rpdqdnpd6cjqev9pa4xt3y24tu23z7',
    required: false,
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({
    status: 200,
    description: '',
    // type: WalletListOutPutDto,
  })
  async gameList(
    @Headers() headers,
    @Query() query,
  ): Promise<CommonResponseDto<GameListOutPutDto>> {
    let lang = 'en';
    if (headers.lang) lang = headers.lang;

    const param = {
      ...query,
      lang: lang,
    };

    const result = await this.contractV1Service.gameList(param);
    return new CommonResponseDto(GameApiHttpStatus.OK, 'success', result);
  }

  //unsigned contract
  @Post('/contract/create')
  @ApiOperation({
    summary: '컨트랙트 배포 트랜잭션 생성',
    description: '',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({
    status: 200,
    description: '',
    type: ContractCreateOutputDto,
  })
  async contractCreate(
    @Headers() headers,
    @Body() body: ContractCreateInputDto,
  ): Promise<CommonResponseDto<ContractCreateOutputDto>> {
    let lang = 'en';
    if (headers.lang) lang = headers.lang;

    const param = {
      ...body,
      lang: lang,
    };

    const result = await this.contractV1Service.createContract(param);

    return new CommonResponseDto(GameApiHttpStatus.OK, 'success', result);
  }

  @Post('/contract/deploy')
  @ApiOperation({
    summary: '컨트랙트 배포',
    description: '',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({
    status: 200,
    description: '',
    type: ContractDeployOutputDto,
  })
  async contractDeploy(
    @Headers() headers,
    @Body() body: ContractDeployInputDto,
  ): Promise<CommonResponseDto<ContractDeployOutputDto>> {
    let lang = 'en';
    if (headers.lang) lang = headers.lang;

    const param = {
      ...body,
      lang: lang,
    };

    const result = await this.contractV1Service.contractDeploy(param);

    return new CommonResponseDto(GameApiHttpStatus.OK, 'success', result);
  }
}
