import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PaginateQuery } from 'nestjs-paginate';
import { GameApiHttpStatus } from '../../exception/exception';
import { CommonResponseDto } from '../../commom/dto/common-response.dto';
import { BetaGameV1Service } from './beta-game-v1.service';
import { BetaGameApplyV1Service } from './beta-game-apply-v1.service';
import { ConsoleApiV1Service } from '../../console-api/v1/console-api-v1.service';
import {
  BetaGameListsResDto,
  BetaGameResDto,
} from './dto/beta-game-v1.res.dto';
import { BetaGameApplyResDto } from './dto/beta-game-apply-v1.res.dto';
import {
  BetaGameListReqDto,
  SalesSyncReqDto,
  UpdateReqDto,
} from './dto/beta-game-v1.req.dto';
import { BlockChainGameCreateReqDto } from '../../console-api/v1/dto/console-api-v1.req.dto';

@ApiBearerAuth()
@ApiTags('Beta Game Launcher V1 진행현황 API')
@Controller({
  version: '1',
})
export class BetaGameV1Controller {
  constructor(
    private readonly betaGameV1Service: BetaGameV1Service,
    private readonly betaGameApplyV1Service: BetaGameApplyV1Service,
    private readonly consoleApiV1Service: ConsoleApiV1Service,
  ) {}

  @Get('/beta-game/:id')
  @ApiOperation({
    summary: '진행현황 상제 정보 조회',
    description: '',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 200, description: '', type: BetaGameResDto })
  async findOne(@Param('id') id: number): Promise<CommonResponseDto<any>> {
    // 진행현황 정보 조회
    let [statusCode, message, result] = await this.betaGameV1Service.findOne(
      id,
    );

    // 정상 조회가 안되었으면 에러 처리 하고 종료
    if (statusCode != GameApiHttpStatus.OK) {
      return new CommonResponseDto<any>(statusCode, message);
    }

    // 정상조회인 경우 데이터 삽입 후, 베타게임 신청 정보 조회
    const betaGameInfo = <BetaGameResDto>result;

    // 신청 정보 조회
    [statusCode, message, result] = await this.betaGameApplyV1Service.findOne(
      betaGameInfo.bliId,
    );
    betaGameInfo.applyInfo = <BetaGameApplyResDto>result;

    return new CommonResponseDto<any>(statusCode, message, betaGameInfo);
  }

  @Get('/beta-game/lists/:page')
  @ApiOperation({
    summary: '진행현황 목록 조회',
    description: '',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 200, description: '', type: BetaGameListsResDto })
  async lists(
    @Param('page') page: number,
    @Query() request: BetaGameListReqDto,
  ): Promise<CommonResponseDto<any>> {
    // 검색조건 생성
    const search = {};

    if (request.company) {
      search['company'] = request.company;
    }

    if (request.gameindex) {
      search['gameindex'] = request.gameindex;
    }

    if (request.progressStatusCd) {
      // , 를 구분자로 보낸 경우
      if (request.progressStatusCd.indexOf(',')) {
        search['progressStatusCd'] = request.progressStatusCd.split(',');
      } else {
        search['progressStatusCd'] = request.progressStatusCd;
      }
    } else {
      search['progressStatusCd'] = ['1001000101', '1001000102', '1001000103'];
    }

    const query: PaginateQuery = {
      page: page,
      limit: 10,
      filter: search,
      path: '',
    };

    const [statusCode, message, result] = await this.betaGameV1Service.lists(
      query,
    );
    return new CommonResponseDto<any>(statusCode, message, result);
  }

  @Patch('/beta-game/:id')
  @ApiOperation({
    summary: '신청 결과 저장',
    description: '',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 200, description: '', type: CommonResponseDto })
  async update(
    @Param('id') id: number,
    @Body() reqest: UpdateReqDto,
  ): Promise<CommonResponseDto<any>> {
    // 진행 현황 정보 조회
    let [statusCode, message, betaGame] = await this.betaGameV1Service.findOne(
      id,
    );
    betaGame = <BetaGameResDto>betaGame;

    if (statusCode != GameApiHttpStatus.OK) {
      // 조회가 안되면 에러
      return new CommonResponseDto<any>(statusCode, message);
    }

    /** 앱아이디 정보 조회 */
    const appid: string = await this.consoleApiV1Service.findAppid(
      betaGame.gameindex,
    );

    /** 앱센터를 통해 동기화 받은 APPID가 없는 경우 */
    if (!appid || appid === null) {
      return new CommonResponseDto<any>(
        GameApiHttpStatus.NOT_FOUND,
        '신청결과 저장은 지갑 전용 APPID 를 등록 후, 사용이 가능 합니다.',
      );
    }

    // 베타게임런처정보 업데이트
    [statusCode, message] = await this.betaGameV1Service.update(
      betaGame.bliId,
      reqest,
    );

    if (statusCode != GameApiHttpStatus.OK) {
      // 업데이트 실패시 에러
      return new CommonResponseDto<any>(GameApiHttpStatus.NOT_FOUND, message);
    }

    // 신청 정보 조회
    let betaGameApply;
    [statusCode, message, betaGameApply] =
      await this.betaGameApplyV1Service.findOne(betaGame.bliId);
    betaGameApply = <BetaGameApplyResDto>betaGameApply;

    if (statusCode != GameApiHttpStatus.OK) {
      // 조회가 안되면 에러
      return new CommonResponseDto<any>(statusCode, message);
    }

    // 베타게임런처 처리가 완료되면 블록체인 게임 설정이 가능 하므로 콘솔API 서비스를 통해 신규 등록함.
    // 중복처리가 되어 있어서 에러가 발생할 수 있음으로 응답은 별도로 받지 않음.
    await this.consoleApiV1Service.create(<BlockChainGameCreateReqDto>{
      blci_id: betaGame.id,
      company: betaGame.company,
      gameindex: betaGame.gameindex,
      gameTokenName: betaGameApply.tokenName,
      distributionType: betaGameApply.distributionType,
      xplaConvertPoolInitialRatio: betaGameApply.xplaConvertPoolInitialRatio,
      xplaConvertPoolInitialRatioGoods:
        betaGameApply.xplaConvertPoolInitialRatioGoods,
      gameTokenConvertPoolInitialRatioGoods:
        betaGameApply.gameTokenConvertPoolInitialRatioGoods,
      gameTokenConvertPoolInitialRatio:
        betaGameApply.gameTokenConvertPoolInitialRatio,
      gameProviderAddress: betaGameApply.gameProviderAddress,
      createAdmin: 'system',
      appid: appid,
    });

    return new CommonResponseDto<any>(statusCode, message);
  }

  @Patch('/beta-game/:id/fan-card-sales/sync')
  @ApiOperation({
    summary: '팬카드 판매 수량 업데이트',
    description:
      '팬카드의 판미량을 업데이트 하여 콘솔에서 달성률을 확인 할 수 있도록 함 (https://betagamelauncher.c2x.world/)',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 200, description: '', type: CommonResponseDto })
  async salesSync(
    @Param('id') id: number,
    @Body() reqest: SalesSyncReqDto,
  ): Promise<CommonResponseDto<any>> {
    const [statusCode, message] =
      await this.betaGameV1Service.updateFanCardSales(id, reqest);
    return new CommonResponseDto<any>(statusCode, message);
  }
}
