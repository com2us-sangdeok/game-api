import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { BetaGameApplyV1Service } from './beta-game-apply-v1.service';
import { BetaGameV1Service } from './beta-game-v1.service';
import { CommonResponseDto } from '../../commom/dto/common-response.dto';
import { GameApiHttpStatus } from '../../exception/exception';
import {
  BetaGameImagesReqDto,
  BetaGameV1ApplyCompleteReqDto,
  BetaGameV1ApplyCreateReqDto,
  BetaGameV1ApplyTemporaryReqDto,
  LinkDto,
} from './dto/beta-game-apply-v1.req.dto';
import {
  BetaGameApplyResDto,
  BetaGameV1ApplyCreateResDto,
} from './dto/beta-game-apply-v1.res.dto';
import { ParseFile } from '../../pipe/parse-file.pipe';
import { ApiFile } from '../../decorator/api-file.decorator';
import { fileMimetypeFilter } from '../../filter/file-mimetype.filter';
import { ApiMultiFile } from '../../decorator/api-multi-file.decorator';
import { FilesInterceptor } from '@nestjs/platform-express';
import { AssetInfo } from '../../asset-api/v1/type/file-info';
import { AssetV1Service } from '../../asset-api/v1/asset-v1.service';
import { BetaGameImagesEntity } from '../../entities/beta-game-apply.entity';
import { BetaGameResDto } from './dto/beta-game-v1.res.dto';
import { BlockChainGameCreateReqDto } from '../../console-api/v1/dto/console-api-v1.req.dto';
import { ConsoleApiV1Service } from '../../console-api/v1/console-api-v1.service';

@ApiBearerAuth()
@ApiTags('Beta Game Launcher 신청 API')
@Controller({
  version: '1',
})
export class BetaGameApplyV1Controller {
  constructor(
    private readonly applyV1Service: BetaGameApplyV1Service,
    private readonly betaGameV1Service: BetaGameV1Service,
    private readonly apiV1Service: AssetV1Service,
    private readonly consoleApiV1Service: ConsoleApiV1Service,
  ) {}

  @Post('/beta-game/apply')
  @ApiOperation({
    summary: '기본정보 등록',
    description: '기본정보 등록 후, 고유 식별 코드 발급',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({
    status: 200,
    description: '',
    type: BetaGameV1ApplyCreateResDto,
  })
  async create(
    @Body() request: BetaGameV1ApplyCreateReqDto,
  ): Promise<CommonResponseDto<any>> {
    // 중복이 없는 경우 신규 등록 후 insert_id 를 리턴함
    const [statusCode, message, result] =
      await this.applyV1Service.createBetaGame(request);

    // 응답 정보 구성
    return new CommonResponseDto<any>(
      statusCode,
      message,
      <BetaGameV1ApplyCreateResDto>result ?? null,
    );
  }

  @Get('/beta-game/game/token/overlap')
  @ApiOperation({
    summary: '게임 토큰명 중복 체크',
    description: '베타게임 런처 신청 전, 게임 토큰명이 중복되는지 체크함',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({
    status: 200,
    description: '',
    type: CommonResponseDto,
  })
  async gameTokenOverlapCheck(
    @Query() request: any,
  ): Promise<CommonResponseDto<any>> {
    const [statusCode, message] =
      await this.applyV1Service.gameTokenOverlapCheck(
        request.gameindex,
        request.tokenName,
      );

    // 응답 정보 구성
    return new CommonResponseDto<any>(statusCode, message);
  }

  @Patch('/beta-game/apply/temporary')
  @ApiOperation({
    summary: '임시저장',
    description: '',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 200, description: '', type: CommonResponseDto })
  async temporary(
    @Body() request: BetaGameV1ApplyTemporaryReqDto,
  ): Promise<CommonResponseDto<any>> {
    let [statusCode, message] = await this.updateReqDuplicateCheck(request);
    let result;
    // 체크 결과가 정상이면 임시저장 업데이트 진행
    if (statusCode == GameApiHttpStatus.OK) {
      // 임시저장 코드 삽입
      request.registerStatusCd = '1001000301';

      /** 등록되지 않은 경우 등록하고, 등록된 경우 조회하여 정보 전달 */
      [statusCode, message, result] =
        await this.applyV1Service.checkCreateBetaGame(<
          BetaGameV1ApplyCreateReqDto
        >{
          company: request.company,
          gameindex: request.gameindex,
          tokenName: request.tokenName,
          createAdmin: request.createAdmin,
        });

      if (statusCode == GameApiHttpStatus.OK) {
        // 등록된 정보를 통해 요청 받은 정보를 업데이트 함.
        [statusCode, message] = await this.applyV1Service.update(
          result.id,
          request,
        );

        if (statusCode == GameApiHttpStatus.OK) {
          // 베타게임 런처 진행에 정보 등록함.
          [statusCode, message] = await this.betaGameV1Service.create(
            result.id,
          );
        }
      }
    }

    return new CommonResponseDto<any>(statusCode, message, result);
  }

  @Patch('/beta-game/apply/complete')
  @ApiOperation({
    summary: '신청 완료 처리',
    description:
      '대기중 상태로 베타게임런처 진행 현황에 등록되며, 홀딩스 확인 후 블록체인게임에 등록되어 게임설정이 가능하다.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 200, description: '', type: CommonResponseDto })
  async complete(
    @Body() request: BetaGameV1ApplyCompleteReqDto,
  ): Promise<CommonResponseDto<any>> {
    let [statusCode, message] = await this.updateReqDuplicateCheck(request);
    let result;
    /** 체크 결과가 정상이면 접수신청 등록 진행 */
    if (statusCode == GameApiHttpStatus.OK) {
      /** 신청 코드 삽입 */
      request.registerStatusCd = '1001000302';

      /** 등록되지 않은 경우 등록하고, 등록된 경우 조회하여 정보 전달 */
      [statusCode, message, result] =
        await this.applyV1Service.checkCreateBetaGame(<
          BetaGameV1ApplyCreateReqDto
        >{
          company: request.company,
          gameindex: request.gameindex,
          tokenName: request.tokenName,
          createAdmin: request.updateAdmin,
        });

      if (statusCode == GameApiHttpStatus.OK) {
        // 등록된 정보를 통해 요청 받은 정보를 업데이트 함.
        [statusCode, message] = await this.applyV1Service.update(
          result.id,
          request,
        );

        [statusCode, message, result] = await this.applyV1Service.findBetaGame(
          result.company,
          result.gameindex,
        );

        if (statusCode == GameApiHttpStatus.OK) {
          // 베타게임 런처 진행에 정보 등록함.
          [statusCode, message] = await this.betaGameV1Service.create(
            result.id,
          );

          /** 앱아이디 정보 조회 */
          const appid: string = await this.consoleApiV1Service.findAppid(
            result.gameindex,
          );

          await this.consoleApiV1Service.create(<BlockChainGameCreateReqDto>{
            blci_id: result.id,
            company: result.company,
            gameindex: result.gameindex,
            gameTokenName: result.tokenName,
            distributionType: result.distributionType,
            xplaConvertPoolInitialRatio: result.xplaConvertPoolInitialRatio,
            xplaConvertPoolInitialRatioGoods:
              result.xplaConvertPoolInitialRatioGoods,
            gameTokenConvertPoolInitialRatioGoods:
              result.gameTokenConvertPoolInitialRatioGoods,
            gameTokenConvertPoolInitialRatio:
              result.gameTokenConvertPoolInitialRatio,
            gameProviderAddress: result.gameProviderAddress,
            createAdmin: 'system',
            appid: appid,
          });
        }
      }
    }

    return new CommonResponseDto<any>(statusCode, message, result);
  }

  @Get('/beta-game/apply/:id')
  @ApiOperation({
    summary: '상세 정보 조회',
    description: '',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 200, description: '', type: BetaGameApplyResDto })
  async findIdDto(@Param('id') id: number): Promise<CommonResponseDto<any>> {
    let [statusCode, message, result] = await this.applyV1Service.findOne(id);

    const betaGameApplyInfo: BetaGameApplyResDto = result;

    if (statusCode === GameApiHttpStatus.OK) {
      [statusCode, message, result] = await this.betaGameV1Service.findOne(
        betaGameApplyInfo.id,
      );
      betaGameApplyInfo.betaGameConfirmInfo = result;
    }

    console.log(betaGameApplyInfo);

    return new CommonResponseDto<any>(
      statusCode,
      message,
      <BetaGameApplyResDto>betaGameApplyInfo,
    );
  }

  @Post('/beta-game/:id/request')
  @ApiOperation({
    summary: '접수된 베타게임런처 정보를 홀딩스로 전송',
    description: '',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 200, description: '' })
  async betagameRequest(
    @Param('id') id: number,
  ): Promise<CommonResponseDto<any>> {
    const [statusCode, message] = await this.applyV1Service.betagameRequest(id);
    return new CommonResponseDto<any>(statusCode, message);
  }

  @Post('/beta-game/:id/images/thumbnail')
  @ApiOperation({
    summary: '베터게임런처 썸네일 이미지',
    description: '',
  })
  @ApiFile('thumbnail', true, {
    fileFilter: fileMimetypeFilter('image'),
    limits: { fileSize: 15000000 }, //10MB
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 200, description: '', type: CommonResponseDto })
  async gametitleUpload(
    @Param('id') id: number,
    @UploadedFile(ParseFile) thumbnail: Express.Multer.File,
  ): Promise<CommonResponseDto<any>> {
    try {
      const result = await this.apiV1Service.uploadImage(thumbnail);
      const insertImages = [];
      insertImages.push(<BetaGameImagesReqDto>{
        bliId: id,
        type: 1,
        fileName: result.assetName,
        sortOrder: 1,
      });

      await this.applyV1Service.insertImages(insertImages);
      return new CommonResponseDto<AssetInfo>(GameApiHttpStatus.OK, 'success');
    } catch (e) {
      return new CommonResponseDto<any>(
        e.response.statusCode,
        e.response.message,
      );
    }
    return new CommonResponseDto<any>(GameApiHttpStatus.OK, 'success');
  }

  @Post('/beta-game/:id/images/screenshot')
  @ApiOperation({
    summary: '베터게임런처 스크린샷 등록',
    description: '',
  })
  @ApiMultiFile('screenshot', true, 20, {
    fileFilter: fileMimetypeFilter('image'),
    limits: { fileSize: 15000000 }, //10MB
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 200, description: '', type: CommonResponseDto })
  async screenshotUpload(
    @Param('id') id: number,
    @UploadedFiles(ParseFile) screenshot: Express.Multer.File[],
  ): Promise<CommonResponseDto<any>> {
    try {
      const uploadData = [];
      for (const file of screenshot) {
        uploadData.push(await this.apiV1Service.uploadImage(file));
      }

      const insertImages = [];
      for (const key in uploadData) {
        insertImages.push(<BetaGameImagesReqDto>{
          bliId: id,
          type: 2,
          fileName: uploadData[key].assetName,
          sortOrder: Number(key) + 1,
        });
      }
      await this.applyV1Service.insertImages(insertImages);
      return new CommonResponseDto<AssetInfo>(GameApiHttpStatus.OK, 'success');
    } catch (e) {
      return new CommonResponseDto<any>(
        e.response.statusCode,
        e.response.message,
      );
    }
  }

  @Post('/beta-game/:id/images/game-token')
  @ApiOperation({
    summary: '게임 토큰 이미지',
    description: '',
  })
  @ApiFile('gameTokenImage', true, {
    fileFilter: fileMimetypeFilter('image'),
    limits: { fileSize: 15000000 }, //10MB
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 200, description: '', type: CommonResponseDto })
  async gameTokenImageUpload(
    @Param('id') id: number,
    @UploadedFile(ParseFile) gameToken: Express.Multer.File,
  ): Promise<CommonResponseDto<any>> {
    try {
      const result = await this.apiV1Service.uploadImage(gameToken);
      const insertImages = [];
      insertImages.push(<BetaGameImagesReqDto>{
        bliId: id,
        type: 3,
        fileName: result.assetName,
        sortOrder: 1,
      });
      await this.applyV1Service.insertImages(insertImages);
      return new CommonResponseDto<AssetInfo>(GameApiHttpStatus.OK, 'success');
    } catch (e) {
      return new CommonResponseDto<any>(
        e.response.statusCode,
        e.response.message,
      );
    }
    return new CommonResponseDto<any>(GameApiHttpStatus.OK, 'success');
  }

  @Post('/beta-game/:id/images/fan-card')
  @ApiOperation({
    summary: '팬카드 NFT 이미지',
    description: '',
  })
  @ApiFile('fanCardImage', true, {
    fileFilter: fileMimetypeFilter('image'),
    limits: { fileSize: 15000000 }, //10MB
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 200, description: '', type: CommonResponseDto })
  async fanCardImageUpload(
    @Param('id') id: number,
    @UploadedFile(ParseFile) fanCard: Express.Multer.File,
  ): Promise<CommonResponseDto<any>> {
    try {
      const result = await this.apiV1Service.uploadImage(fanCard);
      const insertImages = [];
      insertImages.push(<BetaGameImagesReqDto>{
        bliId: id,
        type: 4,
        fileName: result.assetName,
        sortOrder: 1,
      });
      await this.applyV1Service.insertImages(insertImages);
      return new CommonResponseDto<AssetInfo>(GameApiHttpStatus.OK, 'success');
    } catch (e) {
      return new CommonResponseDto<any>(
        e.response.statusCode,
        e.response.message,
      );
    }
    return new CommonResponseDto<any>(GameApiHttpStatus.OK, 'success');
  }

  /**
   * gameIntro와 serviceLink 의 주요 키값이 중복인지 체크하고 결과를 리턴함
   * @param request
   */
  private async updateReqDuplicateCheck(
    request: BetaGameV1ApplyTemporaryReqDto | BetaGameV1ApplyCompleteReqDto,
  ): Promise<[statusCode: number, message: string]> {
    // 게임 서비스 링크가 있으면 코드가 겹치는지 확인함
    if (request.serviceLink) {
      if (
        !(await this.duplicateData('serviceLinkTypeCd', request.serviceLink))
      ) {
        return [GameApiHttpStatus.CONFLICT, 'duplicate serviceLink type code'];
      }
    }

    return [GameApiHttpStatus.OK, 'success'];
  }

  @Delete('/beta-game/images/:id')
  @ApiOperation({
    summary: '이미지 삭제',
    description: '이미지 고유번호를 이용한 삭제',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({
    status: 200,
    description: '',
    type: CommonResponseDto,
  })
  private async deleteImages(
    @Param('id') id: number,
  ): Promise<CommonResponseDto<any>> {
    const [statusCode, message] = await this.applyV1Service.deleteImage(id);
    return new CommonResponseDto<any>(statusCode, message);
  }

  /**
   * checkKey의 값이 중복인지 확인
   * @param checkKey
   * @param checkDto
   * @private
   */
  private async duplicateData(
    checkKey: string,
    checkDto: LinkDto[],
  ): Promise<boolean> {
    let checkArray = [];
    for (const key in checkDto) {
      checkArray.push(checkDto[key][checkKey]);
    }
    checkArray = Array.from(new Set(checkArray));
    // 개수가 같지 않으면 중복이 있는 것임
    if (checkArray.length != checkDto.length) {
      return false;
    }
    return true;
  }
}
