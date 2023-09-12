import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { GameCommonApiV1Service } from './game-common-api-v1.service';
import { CommonResponseDto } from '../../commom/dto/common-response.dto';
import { PaginateQuery } from 'nestjs-paginate';
import {
  BlockChainGameReqDto,
  SearchAppidReqDto,
  MaintenanceReqDto,
} from './dto/game-common-api-v1.req.dto';
import {
  BlockchainGameApiResDto,
  BlockChainGameListResDto,
  BlockChainGameResDto,
  ConvertSettingResDto,
  MaintenanceResDto,
  MintCategorySettingResDto,
  MintFeeResDto,
} from '../../console-api/v1/dto/console-api-v1.res.dto';
import { AxiosClientUtil } from '../../util/axios-client.util';
import { GameApiHttpStatus } from '../../exception/exception';
import axios from 'axios';
import * as CryptoJS from 'crypto-js';
import {
  MaintenanceCode,
  MaintenanceResCodeMessage,
} from '../../enum/hive.enum';
import { ConfigService } from '@nestjs/config';

@ApiBearerAuth()
@ApiTags('Game Common v1 API')
@Controller({
  version: '1',
})
export class GameCommonApiV1Controller {
  constructor(
    private readonly gameCommonApiService: GameCommonApiV1Service,
    private axiosClient: AxiosClientUtil,
    private configService: ConfigService,
  ) {}

  @ApiOperation({
    summary: '게임목록 조회 (운영설정 ON 게임 목록)',
    description: '',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 200, description: '', type: BlockChainGameResDto })
  @Get('/game/lists')
  async findLists(
    @Query() request: BlockChainGameReqDto,
  ): Promise<CommonResponseDto<any>> {
    // 검색조건 생성
    const search = {};

    // 페이지가 없으면 1로 초기화
    if (!request.page) {
      search['page'] = 1;
    }

    // 운영중인것만 조회 함으로 운영중 코드 강제 삽입
    search['activeTypeCd'] = '1001000601';

    const query: PaginateQuery = {
      page: request.page,
      limit: 20,
      filter: search,
      path: '',
    };

    const [statusCode, message, result] = await this.gameCommonApiService.lists(
      query,
    );

    // 응답 정보 구성
    return new CommonResponseDto<any>(
      statusCode,
      message,
      <BlockChainGameResDto[]>result ?? null,
    );
  }

  @ApiOperation({
    summary: '게임정보 조회',
    description: '',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 200, description: '', type: BlockChainGameResDto })
  @Get('/game/:appid')
  async findGame(
    @Param() request: SearchAppidReqDto,
  ): Promise<CommonResponseDto<any>> {
    const [statusCode, message, result] =
      await this.gameCommonApiService.findGame(request.appid);
    // 응답 정보 구성
    return new CommonResponseDto<any>(
      statusCode,
      message,
      <BlockChainGameResDto>result ?? null,
    );
  }

  // @ApiOperation({
  //   summary: '게임 API 정보 조회',
  //   description: '',
  // })
  // @ApiResponse({ status: 403, description: 'Forbidden.' })
  // @ApiResponse({ status: 200, description: '', type: BlockchainGameApiResDto })
  // @Get('/game/:appid/api')
  // async findGameApi(
  //   @Param() request: SearchAppidReqDto,
  // ): Promise<CommonResponseDto<any>> {
  //   const [statusCode, message, id] = await this.gameCommonApiService.findAppId(
  //     request.appid,
  //   );
  //   const result = await this.gameCommonApiService.findApi(id);
  //
  //   // 응답 정보 구성
  //   return new CommonResponseDto<any>(statusCode, message, result ?? null);
  // }

  @ApiOperation({
    summary: 'Mint 카테고리 설정 정보 조회 (단일/조합/케릭터/수수료)',
    description:
      '민팅 타입 구분\n' +
      '단일 Mint : 1001000701\n' +
      '조합 Mint : 1001000702\n' +
      '캐릭터 Mint : 1001000703',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({
    status: 200,
    description: '',
    type: MintCategorySettingResDto,
  })
  @Get('/game/:appid/category')
  async findMintCategory(
    @Param() request: SearchAppidReqDto,
  ): Promise<CommonResponseDto<any>> {
    const [statusCode, message, id] = await this.gameCommonApiService.findAppId(
      request.appid,
    );
    const result = await this.gameCommonApiService.findCategory(id);

    // 응답 정보 구성
    return new CommonResponseDto<any>(statusCode, message, result ?? null);
  }

  @ApiOperation({
    summary: 'Convert 설정 정보 조회 ',
    description:
      '컨버트 타입 \n' +
      'CTX (CTX <-> 게임재화) : 1001000801\n' +
      'Game Token (Game Token <-> 게임재화) : 1001000802\n',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 200, description: '', type: ConvertSettingResDto })
  @Get('/game/:appid/convert')
  async findConvert(
    @Param() request: SearchAppidReqDto,
  ): Promise<CommonResponseDto<any>> {
    const [statusCode, message, id] = await this.gameCommonApiService.findAppId(
      request.appid,
    );
    const result = await this.gameCommonApiService.findConvert(id);

    // 응답 정보 구성
    return new CommonResponseDto<any>(statusCode, message, result ?? null);
  }

  @ApiOperation({
    summary: '수수료 설정 정보 조회',
    description: '',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 200, description: '', type: MintFeeResDto })
  @Get('/game/mint/category/:categoryId/fee')
  async findMintFee(
    @Param('categoryId') categoryId: number,
  ): Promise<CommonResponseDto<any>> {
    const [statusCode, message, result] =
      await this.gameCommonApiService.findMintFee(categoryId);
    // 응답 정보 구성
    return new CommonResponseDto<any>(
      statusCode,
      message,
      <MintFeeResDto[]>result,
    );
  }

  @ApiOperation({
    summary: '하이브 점검 공지 정보 조회',
    description: '',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 200, description: '', type: MaintenanceResDto })
  @Get('/game/:appid/server/:serverId/maintenance')
  async findMaintenance(
    @Param() request: MaintenanceReqDto,
  ): Promise<CommonResponseDto<any>> {
    const { appid, serverId } = request;

    /** 초기값 구성 */
    let maintenanceInfo = null;

    const hiveCertificationKey =
      await this.gameCommonApiService.findHiveGameCertificationKey(appid);

    const timestamp = Math.floor(Date.now() / 1000);
    const body = {
      appid: appid,
      server_id: serverId,
      hive_country: 'US',
      language: 'en',
      game_language: 'en',
      timestamp: timestamp,
      hive_certification_key: hiveCertificationKey,
    };
    /** 서명 생성 */
    const signature = CryptoJS.SHA256(JSON.stringify(body)).toString();

    /** 요청 헤더 생성 */
    const header = {
      TIMESTAMP: timestamp,
      SIGNATURE: signature,
      // 0: 암호화 미사용, 1: 암호화
      ISCRYPT: 0,
    };

    /** 데이터 전송 및 응답 확인 */
    const maintenanceResData = await this.axiosClient.post(
      this.configService.get('HIVE_MAINTENANCE_API_URL'),
      body,
      header,
    );

    const { result_code, data: maintenanceData } = maintenanceResData.body;

    /** 정상 응답 확인 */
    if (MaintenanceCode.SUCCESS === result_code) {
      /** 초기값 설정 */
      maintenanceInfo = [];

      const { maintenance } = maintenanceData;

      for (const maintenanceValue of maintenance) {
        maintenanceInfo.push(<MaintenanceResDto>{
          type: maintenanceValue.type,
          action: maintenanceValue.action,
          url: maintenanceValue.url,
          startDate: maintenanceValue.start_date,
          endDate: maintenanceValue.end_date,
          remainingTime: maintenanceValue.remaining_time,
          title: maintenanceValue.title,
          message: maintenanceValue.message,
          button: maintenanceValue.button,
          buttonLists: maintenanceValue.button_list,
        });
      }
    }

    /** 응답 정보 구성 */
    return new CommonResponseDto<any>(
      MaintenanceCode.SUCCESS === result_code
        ? GameApiHttpStatus.OK
        : result_code,
      MaintenanceResCodeMessage[result_code],
      maintenanceInfo,
    );
  }
}
