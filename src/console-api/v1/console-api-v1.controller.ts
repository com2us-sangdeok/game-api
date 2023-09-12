import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ConsoleApiV1Service } from './console-api-v1.service';
import { CommonResponseDto } from '../../commom/dto/common-response.dto';
import { PaginateQuery } from 'nestjs-paginate';
import {
  BlockChainGameActiveUpdateReqDto,
  BlockChainGameApiUpdateReqDto,
  BlockChainGameListsReqDto,
  BlockChainGameServerUpdateReqDto,
  BlockChainGameTemporaryUpdateReqDto,
  BlockChainGameUpdateReqDto,
  HiveAppSyncReqDto,
} from './dto/console-api-v1.req.dto';
import {
  BlockChainGameResDto,
  SelectBlockChainGameResDto,
} from './dto/console-api-v1.res.dto';
import { GameApiHttpStatus } from '../../exception/exception';
import { ApiFile } from '../../decorator/api-file.decorator';
import { fileMimetypeFilter } from '../../filter/file-mimetype.filter';
import { ParseFile } from '../../pipe/parse-file.pipe';
import { AssetV1Service } from '../../asset-api/v1/asset-v1.service';
import { AxiosClientUtil } from '../../util/axios-client.util';
import { ConfigService } from '@nestjs/config';
import {
  Transaction,
  TransactionListResDto,
  TransactionReqDto,
} from './dto/console-api-v1-transaction.dto';

@ApiBearerAuth()
@ApiTags('BlockChain Game v1 API - Hive Console 전용')
@Controller({
  version: '1',
})
export class ConsoleApiV1Controller {
  constructor(
    private readonly consoleApiService: ConsoleApiV1Service,
    private readonly apiV1Service: AssetV1Service,
    private axiosClient: AxiosClientUtil,
    private configService: ConfigService,
  ) {}

  /**
   * 앱센터 동기화 (회사 정보 전체 동기화)
   * @param company
   */
  @ApiOperation({
    summary: 'Hive 회사 정보 전체 동기화',
    description: '',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 200, description: '' })
  @Post('/console/company/sync/all')
  @HttpCode(200)
  async syncHiveCompanyAll(): Promise<CommonResponseDto<any>> {
    const response = (
      await this.axiosClient.get(
        `${this.configService.get('HIVE_APPCENTER_API_URL')}/api/code/list`,
      )
    ).body;

    const { resultCode, resultmsg, data } = response;

    /** dataType: code (company) */
    const companyInfo = [];
    for (let index = 0; index < data.length; index += 1) {
      if (data[index].mainCodeName === 'COMPANY') {
        for (const value of data[index].middleCodeList) {
          companyInfo.push({
            company: value.middleCodeSeq,
            code: value.middleCode,
            locale: [
              {
                language: 'ko',
                name: value.nameKo,
              },
              {
                language: 'en',
                name: value.nameEn,
              },
            ],
          });
        }
      }
    }

    await this.consoleApiService.syncCompany(companyInfo);

    // 응답 정보 구성
    return new CommonResponseDto<any>(GameApiHttpStatus.OK, 'success');
  }

  /**
   * 앱센터 동기화
   * @param company
   */
  @ApiOperation({
    summary: 'Hive 앱센터 전체 동기화',
    description: '',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 200, description: '' })
  @Post('/console/app/sync/all')
  @HttpCode(200)
  async syncHiveAppcenterAll(@Body() request: HiveAppSyncReqDto): Promise<any> {
    const response = (
      await this.axiosClient.get(
        `${this.configService.get('HIVE_APPCENTER_API_URL')}/api/game/list`,
      )
    ).body;

    const { resultCode, resultmsg, data } = response;

    if (resultCode === 0) {
      for (let index = 0; index < data.length; index += 1) {
        if (
          data[index].companyIndex !== null &&
          data[index].gameindex !== null
        ) {
          /** 게임정보 생성 */
          const gameInfo = {
            gameindex: data[index].gameindex,
            gameId: data[index].gameid,
            company: data[index].companyIndex,
            iconImage: null,
            hiveCertificationKey: data[index].hiveCertificationKey,
            locale: [],
          };

          /** 게임명 */
          for (const value of data[index].gameLocale) {
            gameInfo.locale.push({
              language: value.language,
              title: value.title,
            });
          }

          /** 아이콘 이미지만 추출 */
          for (const value of data[index].multimedia) {
            if (value.mediaType === 'icon') {
              gameInfo.iconImage = value.url;
            }
          }

          /** 게임 정보 등록 */
          await this.consoleApiService.syncGame(gameInfo);

          for (const value of data[index].app) {
            /** 앱정보 생성 */
            const appInfo = {
              gameindex: gameInfo.gameindex,
              appindex: value.appindex,
              appid: value.appid,
            };

            /** 앱정보 등록 */
            await this.consoleApiService.syncApp(appInfo);
          }
        }
      }
    }

    /** 앱센터 요구 사항에 맞추어 응답 정보 구성 (아래와 같지 않으면 동기화 실패 메시지 전송됨) */
    return {
      resultCode: resultCode,
      resultMsg: resultmsg,
    };
  }

  /**
   * 앱센터 동기화
   * @param company
   */
  @ApiOperation({
    summary: 'Hive 앱센터 동기화',
    description: '',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 200, description: '' })
  @Post('/console/app/sync')
  @HttpCode(200)
  async syncHiveApp(@Body() request: HiveAppSyncReqDto): Promise<any> {
    const data: any = request.data;
    if (request.dataType === 'game') {
      /** dataType: game */
      const gameInfo = {
        gameindex: data.gameindex,
        gameId: data.gameid,
        company: data.companyIndex,
        iconImage: null,
        genre: data.genre,
        hiveCertificationKey: data.hiveCertificationKey,
        server: [],
        locale: [],
      };

      /** 게임 서버 */
      for (const value of data.server) {
        gameInfo.server.push({
          serverId: value.serverId,
          serverNameKO: value.serverNameKO,
          serverNameEN: value.serverNameEN,
          timezone: value.timezone,
        });
      }

      /** 게임명 */
      for (const value of data.locale) {
        gameInfo.locale.push({
          language: value.language,
          title: value.title,
        });
      }

      /** 아이콘 이미지만 추출 */
      for (const value of data.multimedia) {
        if (value.mediaType === 'icon') {
          gameInfo.iconImage = value.url;
        }
      }

      await this.consoleApiService.syncGame(gameInfo);
    } else if (request.dataType === 'app') {
      /** dataType: app */
      const appInfo = {
        gameindex: data.gameindex,
        appindex: data.appindex,
        appid: data.appid,
        market: data.market,
        marketUrl: data.marketUrl,
        marketApplicationId: data.marketApplicationId,
        os: data.os,
        serviceType: data.serviceType,
      };

      await this.consoleApiService.syncApp(appInfo);

      /** wallet 이 포함된 appid만 추가함 */
      // if (appInfo.appid.indexOf('wallet') > -1) {
      //   await this.consoleApiService.syncApp(appInfo);
      // }
    } else if (request.dataType === 'code') {
      const companyInfo = [];

      /** dataType: code (company) */
      for (const value of data.middleCodeList) {
        companyInfo.push({
          company: value.middleCodeSeq,
          code: value.middleCode,
          locale: [
            {
              language: 'ko',
              name: value.nameKo,
            },
            {
              language: 'en',
              name: value.nameEn,
            },
          ],
        });
      }

      await this.consoleApiService.syncCompany(companyInfo);
    }

    /** 앱센터 요구 사항에 맞추어 응답 정보 구성 (아래와 같지 않으면 동기화 실패 메시지 전송됨) */
    return {
      resultCode: 0,
      resultMsg: 'OK',
    };
  }

  /**
   * 콘솔에 필요한 각종 정보 조회
   * @param company
   */
  @ApiOperation({
    summary: '콘솔에 필요한 각종 설정 정보 조회',
    description: '',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 200, description: '', type: BlockChainGameResDto })
  @Get('/console/init')
  async initData(
    /** TODO: 로그인 연동되면 해당 파라미터를 로그인 정보로 넣도록 변경해야 함. */
    @Query('company') company: number,
  ): Promise<CommonResponseDto<any>> {
    /** company 회사 코드가 있는지 검색 */
    if (!(await this.consoleApiService.checkHiveCompanyInfo(company))) {
      await this.syncHiveCompanyAll();
    }

    const consoleInitData = await this.consoleApiService.consoleInitData(
      company,
    );
    // 응답 정보 구성
    return new CommonResponseDto<any>(
      GameApiHttpStatus.OK,
      'success',
      consoleInitData,
    );
  }

  /**
   * 특정 회사에서 베타게임 접속을 하지 않은 게임 목록 조회
   * @param company
   */
  @ApiOperation({
    summary: '특정 회사의 베타게임 등록을 하지 않은 게임 목록 조회',
    description: '',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 200, description: '', type: BlockChainGameResDto })
  @Get('/company/:company/gamelists/not-reg-betagame')
  async notRegBetaGame(
    /** TODO: 로그인 연동되면 해당 파라미터를 로그인 정보로 넣도록 변경해야 함. */
    @Param('company') company: number,
  ): Promise<CommonResponseDto<any>> {
    const consoleInitData = await this.consoleApiService.notRegBetaGameHiveGame(
      company,
    );
    // 응답 정보 구성
    return new CommonResponseDto<any>(
      GameApiHttpStatus.OK,
      'success',
      consoleInitData,
    );
  }

  /**
   * 특정 회사에서 베타게임 접속을 하지 않은 게임 목록 조회
   * @param company
   */
  @ApiOperation({
    summary: '특정 회사의 베타게임 등록을 하지 않은 게임 목록 조회',
    description: '',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({
    status: 200,
    description: '',
    type: SelectBlockChainGameResDto,
  })
  @Get('/company/:company/blockchain-game/lists')
  async blockchainGameLists(
    @Param('company') company: number,
  ): Promise<CommonResponseDto<any>> {
    const consoleInitData = await this.consoleApiService.blockchainGameLists(
      company,
    );
    // 응답 정보 구성
    return new CommonResponseDto<any>(
      GameApiHttpStatus.OK,
      'success',
      consoleInitData,
    );
  }

  /**
   * 블록체인 게임 리스트 조회
   * @param request
   */
  @ApiOperation({
    summary: '게임 목록 조회',
    description: '',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 200, description: '', type: BlockChainGameResDto })
  @Get('/blockchain-game/lists/:page')
  async lists(
    @Param('page') page: number,
    @Query() request: BlockChainGameListsReqDto,
  ): Promise<CommonResponseDto<any>> {
    // 검색조건 생성
    const search = {};

    if (request.company) {
      search['company'] = request.company;
    }

    if (request.gameindex) {
      search['gameindex'] = request.gameindex;
    }

    search['page'] = page;

    const query: PaginateQuery = {
      page: page,
      limit: 10,
      filter: search,
      path: '',
    };

    const [statusCode, message, result] = await this.consoleApiService.lists(
      query,
    );
    return new CommonResponseDto<any>(statusCode, message, result);
  }

  /**
   * 고유번호를 통한 상세 정보 조회
   * @param id
   */
  @ApiOperation({
    summary: '상세 정보 조회',
    description: '',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 200, description: '', type: BlockChainGameResDto })
  @Get('/blockchain-game/:id')
  async findOne(@Param('id') id: number): Promise<CommonResponseDto<any>> {
    const [statusCode, message, result] =
      await this.consoleApiService.findBlockChainGame(id);
    // 응답 정보 구성
    return new CommonResponseDto<any>(
      statusCode,
      message,
      <BlockChainGameResDto>result,
    );
  }

  @Patch('/blockchain-game/:id/temporary')
  @ApiOperation({
    summary: '임시저장',
    description: '',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 200, description: '', type: CommonResponseDto })
  async temporary(
    @Param('id') id: number,
    @Body() request: BlockChainGameTemporaryUpdateReqDto,
  ): Promise<CommonResponseDto<any>> {
    // 임시저장은 설정중으로 강제 삽입
    request.settingCompleteTypeCd = '1001000902';

    // 업데이트 요청
    const [statusCode, message] = await this.consoleApiService.update(
      id,
      request,
    );

    // 응답 정보 구성
    return new CommonResponseDto<any>(statusCode, message);
  }

  @Patch('/blockchain-game/:id/complete')
  @ApiOperation({
    summary: '저장 완료',
    description: '',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 200, description: '', type: CommonResponseDto })
  async update(
    @Param('id') id: number,
    @Body() request: BlockChainGameUpdateReqDto,
  ): Promise<CommonResponseDto<any>> {
    // 저장완료는 설정완료로 강제 삽입
    request.settingCompleteTypeCd = '1001000901';

    // 업데이트 요청
    const [statusCode, message] = await this.consoleApiService.update(
      id,
      request,
    );

    // 응답 정보 구성
    return new CommonResponseDto<any>(statusCode, message);
  }

  @Patch('/blockchain-game/:id/game-api')
  @ApiOperation({
    summary: '게임 API 정보 저장',
    description: '',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 200, description: '', type: CommonResponseDto })
  async gameApi(
    @Param('id') id: number,
    @Body() request: BlockChainGameApiUpdateReqDto,
  ): Promise<CommonResponseDto<any>> {
    if (request.saveType === 1) {
      // 임시저장
      request.apiSettingCompleteTypeCd = '1001000902';
    } else if (request.saveType === 2) {
      // 신청
      request.apiSettingCompleteTypeCd = '1001000901';
    }

    // 업데이트 요청
    const [statusCode, message] = await this.consoleApiService.updateGameApi(
      id,
      request,
    );

    // 응답 정보 구성
    return new CommonResponseDto<any>(statusCode, message);
  }

  @Patch('/blockchain-game/:id/active')
  @ApiOperation({
    summary: '운영 설정 정보 변경 (서비스 ON/OFF)',
    description: '',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 200, description: '', type: CommonResponseDto })
  async gameActive(
    @Param('id') id: number,
    @Body() request: BlockChainGameActiveUpdateReqDto,
  ): Promise<CommonResponseDto<any>> {
    // 업데이트 요청
    const [statusCode, message] = await this.consoleApiService.gameActive(
      id,
      request,
    );

    // 응답 정보 구성
    return new CommonResponseDto<any>(statusCode, message);
  }

  @Post('/blockchain-game/images/upload')
  @ApiOperation({
    summary: '이미지 업로드 후, 이미지 파일명 전달',
    description: '',
  })
  @ApiFile('file', true, {
    fileFilter: fileMimetypeFilter('image'),
    limits: { fileSize: 15000000 }, //10MB
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 200, description: '', type: CommonResponseDto })
  async imageUpload(
    @UploadedFile(ParseFile) file: Express.Multer.File,
  ): Promise<CommonResponseDto<any>> {
    try {
      const result = await this.apiV1Service.uploadImage(file);
      return new CommonResponseDto<any>(GameApiHttpStatus.OK, 'success', {
        fileName: result.assetName,
      });
    } catch (e) {
      return new CommonResponseDto<any>(
        e.response.statusCode,
        e.response.message,
      );
    }
    return new CommonResponseDto<any>(GameApiHttpStatus.OK, 'success');
  }

  @Post('/blockchain-game/:id/server')
  @ApiOperation({
    summary: 'update blockchain game server',
  })
  @ApiResponse({
    status: 200,
    description: '',
    type: BlockChainGameServerUpdateReqDto,
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async updateBcGameServer(
    @Param('id') id: number,
    @Body() request: BlockChainGameServerUpdateReqDto,
  ): Promise<CommonResponseDto<any>> {
    try {
      const [statusCode, message, bcGame] =
        await this.consoleApiService.findBlockChainGame(id);

      if (!bcGame) {
        return new CommonResponseDto<any>(
          GameApiHttpStatus.NO_CONTENT,
          'NO_CONTENT',
        );
      }

      const result = await this.consoleApiService.bcGameServerUpdate(
        id,
        bcGame.gameindex,
        request.serverIds,
      );
    } catch (e) {
      return new CommonResponseDto<any>(
        e.response.statusCode,
        e.response.message,
      );
    }

    return new CommonResponseDto(GameApiHttpStatus.OK, 'success');
  }

  @Get('/transaction/:id/details')
  @ApiOperation({
    summary: 'Find lists transaction log',
  })
  @ApiResponse({
    status: 200,
    description: '',
    type: Transaction,
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async findOneTransaction(
    @Param('id') id: number,
  ): Promise<CommonResponseDto<Transaction>> {
    /** game-api 인증에 필요한 토큰 획 */
    const authResponse = (
      await this.axiosClient.post(
        this.configService.get('BLOCKCHAIN_AUTH_URL'),
        {
          id: this.configService.get('SERVICE_ID'),
          secretKey: this.configService.get('SECRET_KEY'),
        },
      )
    ).body;

    /** 인증 성공이 아니면 에러 */
    if (authResponse.code !== 0) {
      return new CommonResponseDto(
        GameApiHttpStatus.UNAUTHORIZED,
        'Unauthorized',
      );
    }

    /** 인증 토큰 */
    const accessToken = authResponse.data.accessToken;

    /** 데이터 전송 및 응답 확인 */
    const transaction = (
      await this.axiosClient.get(
        `${this.configService.get(
          'GAME_API_URL',
        )}/game/v1/transaction/${id}/details`,
        {
          Authorization: `Bearer ${accessToken}`,
        },
      )
    ).body;

    const data = <Transaction>transaction.data;
    return new CommonResponseDto(GameApiHttpStatus.OK, 'success', data);
  }

  @Get('/transaction/lists')
  @ApiOperation({
    summary: 'Find lists transaction log',
  })
  @ApiResponse({
    status: 200,
    description: '',
    type: TransactionListResDto,
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async transactionLists(
    @Query() query: TransactionReqDto,
  ): Promise<CommonResponseDto<TransactionListResDto>> {
    /** game-api 인증에 필요한 토큰 획 */
    const authResponse = (
      await this.axiosClient.post(
        this.configService.get('BLOCKCHAIN_AUTH_URL'),
        {
          id: this.configService.get('SERVICE_ID'),
          secretKey: this.configService.get('SECRET_KEY'),
        },
      )
    ).body;

    /** 인증 성공이 아니면 에러 */
    if (authResponse.code !== 0) {
      return new CommonResponseDto(
        GameApiHttpStatus.UNAUTHORIZED,
        'Unauthorized',
      );
    }

    /** 인증 토큰 */
    const accessToken = authResponse.data.accessToken;

    const params: any = query;

    const queryStr: any = new URLSearchParams(params).toString();

    /** 데이터 전송 및 응답 확인 */
    const transactionLists = (
      await this.axiosClient.get(
        `${this.configService.get(
          'GAME_API_URL',
        )}/game/v1/transaction/lists?${queryStr}`,
        {
          Authorization: `Bearer ${accessToken}`,
        },
      )
    ).body;

    const data = <TransactionListResDto>{
      lists: transactionLists.data.lists,
      paging: transactionLists.data.paging,
    };

    return new CommonResponseDto(GameApiHttpStatus.OK, 'success', data);
  }
}
