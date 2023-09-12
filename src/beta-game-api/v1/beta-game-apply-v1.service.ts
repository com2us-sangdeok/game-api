import {
  Inject,
  Injectable,
  LoggerService,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { TransactionUtil } from '../../util/transacation.util';
import { BetagameApplyRepository } from './repository/beta-game-apply.repository';
import {
  BetaGameApplyEntity,
  BetaGameImagesEntity,
  BetaGameLinkEntity,
} from '../../entities/beta-game-apply.entity';
import {
  BetaGameImagesReqDto,
  BetaGameV1ApplyCompleteReqDto,
  BetaGameV1ApplyCreateReqDto,
  BetaGameV1ApplyTemporaryReqDto,
} from './dto/beta-game-apply-v1.req.dto';
import { GameApiException, GameApiHttpStatus } from '../../exception/exception';
import { BetaGameApplyResDto } from './dto/beta-game-apply-v1.res.dto';
import { CommonRepository } from '../../commom/repository/common.repository';
import { AxiosClientUtil } from '../../util/axios-client.util';

@Injectable()
export class BetaGameApplyV1Service {
  private TxUtil: TransactionUtil = new TransactionUtil(
    this.configService.get('SERVICE_USERAGENT'),
    this.configService.get('SERVICE_URL'),
    parseInt(this.configService.get('SERVICE_TIMEOUT')),
  );

  constructor(
    private configService: ConfigService,
    private readonly betaGameRepo: BetagameApplyRepository,
    private readonly commonRepo: CommonRepository,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
    private axiosClient: AxiosClientUtil,
  ) {}

  /**
   * 베타게임이 생성되어 있는지 확인함
   * @param request
   */
  async checkCreateBetaGame(
    request: BetaGameV1ApplyCreateReqDto,
  ): Promise<[statusCode: number, message: string, result?: any]> {
    try {
      // 등록되어 있지 않다면 등록
      if (
        !(await this.betaGameRepo.overlap(request.company, request.gameindex))
      ) {
        // 토큰네임 중복 체크
        let [statusCode, message, result] = await this.gameTokenOverlapCheck(
          request.gameindex,
          request.tokenName,
        );

        // 토큰네임 중복이면 에러
        if (statusCode != GameApiHttpStatus.OK) {
          return [statusCode, message];
        }
        // 등록이 안된 경우 신규 등록 후 리턴
        [statusCode, message, result] = await this.createBetaGame(request);
        if (statusCode != GameApiHttpStatus.OK) {
          return [statusCode, message];
        }
      }

      // 등록된 정보 전달
      return await this.findBetaGame(request.company, request.gameindex);
    } catch (e) {
      this.logger.error('exception: ' + JSON.stringify(request), e.stack);
      return [e.response.statusCode, e.response.message];
    }
  }

  /**
   * 베타게임 런처 최초 등록 시, 회사 정보와 게임정보, 등록자 정보만 들어감
   * @param request: CreateDto
   */
  async createBetaGame(
    request: BetaGameV1ApplyCreateReqDto,
  ): Promise<[statusCode: number, message: string, result?: any]> {
    try {
      // 등록되어 있는건지 확인함
      if (await this.betaGameRepo.overlap(request.company, request.gameindex)) {
        // 중복이 있는 경우
        return [GameApiHttpStatus.CONFLICT, 'duplicate game'];
      }

      // 최초 등록으로, 임시등록 코드로 강제 삽입
      request.registerStatusCd = '1001000301';

      // 최초 임시 데이터 삽입
      const result = await this.betaGameRepo.insert(<BetaGameApplyEntity>{
        company: request.company,
        gameindex: request.gameindex,
        tokenName: request.tokenName,
        createAdmin: request.createAdmin,
        registerStatusCd: request.registerStatusCd,
      });

      return [GameApiHttpStatus.OK, 'success', { id: result }];
    } catch (e) {
      this.logger.error('exception: ' + JSON.stringify(request), e.stack);
      return [e.response.statusCode, e.response.message];
    }
  }

  /**
   * 베타게임 런처 이미지 정보 저장
   * @param request BetaGameImagesReqDto
   */
  async insertImages(
    request: BetaGameImagesReqDto[],
  ): Promise<[statusCode: number, message: string, result?: any]> {
    try {
      const insertImages = [];
      for (const value of request) {
        insertImages.push(<BetaGameImagesEntity>{
          bliId: value.bliId,
          type: value.type,
          fileName: value.fileName,
          sortOrder: value.sortOrder,
        });
      }
      await this.betaGameRepo.insertImages(insertImages);
      return [GameApiHttpStatus.OK, 'success'];
    } catch (e) {
      this.logger.error('exception: ' + JSON.stringify(request), e.stack);
      return [e.response.statusCode, e.response.message];
    }
  }

  /**
   * 검색조건에 따라 raw 한개 검색
   * @param id: number
   */
  async findOne(
    id: number,
  ): Promise<[statusCode: number, message: string, result?: any]> {
    // 기본 정보 조회
    const result: BetaGameApplyEntity = await this.betaGameRepo.selectId(id);

    // 검색된게 없으면 바로 리턴
    if (!result) {
      return [GameApiHttpStatus.OK, 'success', null];
    }

    // 관련 링크 정보 조회
    const link: BetaGameLinkEntity[] = await this.betaGameRepo.selectLink(
      result.id,
    );

    const images: BetaGameImagesEntity[] = await this.betaGameRepo.selectImages(
      result.id,
    );

    const appInfo = await this.commonRepo.findAppInfo(
      result.gameindex,
      'C2XWALLET',
    );

    // 응답 데이터 생성
    const returnData = <BetaGameApplyResDto>{
      id: result.id,
      company: result.company,
      appid: appInfo ? appInfo.appid : null,
      gameindex: result.gameindex,
      gameIntro: result.gameIntro,
      gameIntroDetail: result.gameIntroDetail,
      gameGenre: result.gameGenre,
      osDownLink: {
        android: result.androidDownLink,
        ios: result.iosDownLink,
        pc: result.pcDownLink,
      },
      developStatusCd: result.developStatusCd,
      developStatusAdditionalText: result.developStatusAdditionalText,
      registerStatusCd: result.registerStatusCd,
      releaseDatetime: result.releaseDatetime,
      tokenName: result.tokenName,
      fanCardTokenName: result.fanCardTokenName,
      fanCardDescription: result.fanCardDescription,
      gameProviderAddress: result.gameProviderAddress,
      fanCardSalesStartDatetime: result.fanCardSalesStartDatetime,
      fanCardSalesEndDatetime: result.fanCardSalesEndDatetime,
      betaTestStartDatetime: result.betaTestStartDatetime,
      betaTestEndDatetime: result.betaTestEndDatetime,
      fanCardTargetQuantity: result.fanCardTargetQuantity,
      fanCardUnitPrice: result.fanCardUnitPrice,
      distributionType: result.distributionType,
      xplaConvertPoolInitialRatioGoods: result.xplaConvertPoolInitialRatioGoods,
      gameTokenConvertPoolInitialRatioGoods:
        result.gameTokenConvertPoolInitialRatioGoods,
      createAdmin: result.createAdmin,
      createAt: result.createAt,
      updateAdmin: result.updateAdmin,
      updateAt: result.updateAt,
      // 게임 서비스 링크 정보 추가
      serviceLink: null,
      // 이미지 정보 추가
      images: null,
    };

    // 조회가 되었을 경우에만 넣음
    if (link.length > 0) {
      returnData.serviceLink = link;
    }

    if (images.length > 0) {
      returnData.images = images;
    }

    return [GameApiHttpStatus.OK, 'success', returnData];
  }

  /**
   * 회사와 게임 고유 식별 코드로 상세 정보 조회
   * @param company
   * @param gameindex
   */
  async findBetaGame(
    company: number,
    gameindex: number,
  ): Promise<[statusCode: number, message: string, result?: any]> {
    // 기본 정보 조회
    const result: BetaGameApplyEntity =
      await this.betaGameRepo.selectCompanyGame(company, gameindex);

    // 검색된게 없으면 바로 리턴
    if (!result) {
      return [GameApiHttpStatus.OK, 'success', null];
    }

    // 관련 링크 정보 조회
    const link: BetaGameLinkEntity[] = await this.betaGameRepo.selectLink(
      result.id,
    );

    // 응답 데이터 생성
    const returnData = <BetaGameApplyResDto>{
      id: result.id,
      company: result.company,
      gameindex: result.gameindex,
      gameIntro: result.gameIntro,
      gameIntroDetail: result.gameIntroDetail,
      gameGenre: result.gameGenre,
      developStatusCd: result.developStatusCd,
      developStatusAdditionalText: result.developStatusAdditionalText,
      registerStatusCd: result.registerStatusCd,
      releaseDatetime: result.releaseDatetime,
      tokenName: result.tokenName,
      fanCardTokenName: result.fanCardTokenName,
      fanCardDescription: result.fanCardDescription,
      gameProviderAddress: result.gameProviderAddress,
      fanCardSalesStartDatetime: result.fanCardSalesStartDatetime,
      fanCardSalesEndDatetime: result.fanCardSalesEndDatetime,
      betaTestStartDatetime: result.betaTestStartDatetime,
      betaTestEndDatetime: result.betaTestEndDatetime,
      fanCardTargetQuantity: result.fanCardTargetQuantity,
      fanCardUnitPrice: result.fanCardUnitPrice,
      distributionType: result.distributionType,
      xplaConvertPoolInitialRatioGoods: result.xplaConvertPoolInitialRatioGoods,
      gameTokenConvertPoolInitialRatioGoods:
        result.gameTokenConvertPoolInitialRatioGoods,
      createAdmin: result.createAdmin,
      createAt: result.createAt,
      updateAdmin: result.updateAdmin,
      updateAt: result.updateAt,
      // 게임 서비스 링크 정보 추가
      serviceLink: null,
    };

    // 조회가 되었을 경우에만 넣음
    if (link.length > 0) {
      returnData.serviceLink = link;
    }

    return [GameApiHttpStatus.OK, 'success', returnData];
  }

  /**
   * 베타게임 런처 정보 저장 (company, gameindex 필수 )
   * 1001000301 : 임시저장 (모든 정보 필수 아님)
   * 1001000302 : 접수완료 (모든 정보 필수)
   * @param id
   * @param dto temporaryUpdateDto | applyUpdateDto
   */
  async update(
    id: number,
    dto: BetaGameV1ApplyTemporaryReqDto | BetaGameV1ApplyCompleteReqDto,
  ): Promise<[statusCode: number, message: string]> {
    try {
      let updateEntity: BetaGameApplyEntity = null;

      // 등록되어 있는건지 확인함
      if (!(await this.betaGameRepo.checkId(id))) {
        // 실패시 false
        throw new NotFoundException();
      }

      if (dto.registerStatusCd == '1001000301') {
        // 임시 저장의 경우 id를 제외한 모든 정보가 필수가 아님
        updateEntity = <BetaGameApplyEntity>{
          gameIntro: dto?.gameIntro,
          gameIntroDetail: dto?.gameIntroDetail,
          gameGenre: dto?.gameGenre,
          androidDownLink: dto?.osDownLink.android,
          iosDownLink: dto?.osDownLink.ios,
          pcDownLink: dto?.osDownLink.pc,
          developStatusCd: dto?.developStatusCd,
          developStatusAdditionalText: dto?.developStatusAdditionalText,
          registerStatusCd: dto?.registerStatusCd,
          releaseDatetime: dto?.releaseDatetime,
          tokenName: dto?.tokenName,
          fanCardTokenName: dto?.fanCardTokenName,
          fanCardDescription: dto?.fanCardDescription,
          gameProviderAddress: dto?.gameProviderAddress,
          fanCardSalesStartDatetime: dto?.fanCardSalesStartDatetime,
          fanCardSalesEndDatetime: dto?.fanCardSalesEndDatetime,
          betaTestStartDatetime: dto?.betaTestStartDatetime,
          betaTestEndDatetime: dto?.betaTestEndDatetime,
          fanCardTargetQuantity: dto?.fanCardTargetQuantity,
          fanCardUnitPrice: dto?.fanCardUnitPrice,
          distributionType: dto?.distributionType,
          xplaConvertPoolInitialRatioGoods:
            dto?.xplaConvertPoolInitialRatioGoods,
          gameTokenConvertPoolInitialRatioGoods:
            dto?.gameTokenConvertPoolInitialRatioGoods,
          updateAdmin: dto?.updateAdmin,
        };
      } else if (dto.registerStatusCd == '1001000302') {
        // 신청 접수 완료일 경우 모든 파라미터 필수
        updateEntity = <BetaGameApplyEntity>{
          gameIntro: dto.gameIntro,
          gameIntroDetail: dto.gameIntroDetail,
          gameGenre: dto.gameGenre,
          androidDownLink: dto?.osDownLink.android,
          iosDownLink: dto?.osDownLink.ios,
          pcDownLink: dto?.osDownLink.pc,
          developStatusCd: dto.developStatusCd,
          developStatusAdditionalText: dto.developStatusAdditionalText,
          registerStatusCd: dto.registerStatusCd,
          releaseDatetime: dto.releaseDatetime,
          tokenName: dto.tokenName,
          fanCardTokenName: dto.fanCardTokenName,
          fanCardDescription: dto.fanCardDescription,
          gameProviderAddress: dto.gameProviderAddress,
          fanCardSalesStartDatetime: dto.fanCardSalesStartDatetime,
          fanCardSalesEndDatetime: dto.fanCardSalesEndDatetime,
          betaTestStartDatetime: dto.betaTestStartDatetime,
          betaTestEndDatetime: dto.betaTestEndDatetime,
          fanCardTargetQuantity: dto.fanCardTargetQuantity,
          fanCardUnitPrice: dto.fanCardUnitPrice,
          distributionType: dto.distributionType,
          xplaConvertPoolInitialRatioGoods:
            dto.xplaConvertPoolInitialRatioGoods,
          gameTokenConvertPoolInitialRatioGoods:
            dto.gameTokenConvertPoolInitialRatioGoods,
          updateAdmin: dto.updateAdmin,
        };
      }
      console.log(
        '*****************************************updateEntity',
        updateEntity,
      );

      // 업데이트 요청
      await this.betaGameRepo.update(id, updateEntity);

      // 게임 서비스 링크가 있는 경우 삭제 후 재등록
      if (dto.serviceLink) {
        await this.betaGameRepo.deleteLink(id);

        // 인서트할 인트로 정보 가공
        const insertServiceLinkData: BetaGameLinkEntity[] = [];
        for (const key in dto.serviceLink) {
          insertServiceLinkData.push(<BetaGameLinkEntity>{
            bliId: id,
            serviceLinkTypeCd: dto.serviceLink[key].serviceLinkTypeCd,
            serviceLink: dto.serviceLink[key].serviceLink,
          });
        }
        await this.betaGameRepo.insertServiceLink(insertServiceLinkData);
      }

      return [GameApiHttpStatus.OK, 'success'];
    } catch (e) {
      this.logger.error(
        'exception: ' + JSON.stringify(BetaGameApplyEntity),
        e.stack,
      );
      return [GameApiHttpStatus.INTERNAL_SERVER_ERROR, 'update fail'];
    }
  }

  /**
   * 게임 토큰 중복 확인
   * @param company
   * @param gameindex
   * @param tokenName
   */
  async gameTokenOverlapCheck(
    gameindex: number,
    tokenName: string,
  ): Promise<[statusCode: number, message: string, result?: any]> {
    try {
      // 등록되어 있는건지 확인함
      if (await this.betaGameRepo.gameTokenOverlap(gameindex, tokenName)) {
        // 중복이 있는 경우
        return [GameApiHttpStatus.CONFLICT, 'Duplicate token name.'];
      } else {
        return [GameApiHttpStatus.OK, 'success'];
      }
    } catch (e) {
      this.logger.error('exception: ' + tokenName, e.stack);
      return [e.response.statusCode, e.response.message];
    }
  }

  /**
   * 이미지 삭제
   * @param id : number 이미지 고유번호
   */
  async deleteImage(
    id: number,
  ): Promise<[statusCode: number, message: string, result?: any]> {
    try {
      // 등록되어 있는건지 확인함
      if (await this.betaGameRepo.deleteImage(id)) {
        return [GameApiHttpStatus.OK, 'success'];
      } else {
        return [GameApiHttpStatus.INTERNAL_SERVER_ERROR, 'Fail delete'];
      }
    } catch (e) {
      this.logger.error('exception: ' + id, e.stack);
      return [GameApiHttpStatus.INTERNAL_SERVER_ERROR, 'Fail delete'];
    }
  }

  /**
   * 베타게임런처 접수 완료 시, 홀딩스에 해당 데이터를 전송
   * @param id 베타게임런처 고유번호
   */
  async betagameRequest(
    id: number,
  ): Promise<[statusCode: number, message: string]> {
    try {
      /** 공통으로 사용할 코드 그룹 조회 */
      const codeGroupCode: any = await this.commonRepo.findCodeGroups([
        'DEVELOP_STATUS',
      ]);

      /** 코드가 키가 되도록 변경 */
      const developStatus: any = {};
      for (const codeGroupValue of codeGroupCode.DEVELOP_STATUS) {
        developStatus[codeGroupValue.code] = codeGroupValue.codeName;
      }

      /** 베타게임런처 접수 정보 조회 */
      const [statusCode, message, betagameInfo] = await this.findOne(id);

      /** 이미지 정보 가져오기 */
      let thumbnail = '';
      const screenShot = [];
      let gameToken = '';
      let fanCard = '';
      for (const imageValue of betagameInfo.images) {
        /** 이미지 타입 ( 1: 썸네일 이미지, 2: 스크린샷, 3: 게임토큰, 4: 팬카드) */
        const fileUri =
          this.configService.get('AWS_S3_VIEW_URL') + '/' + imageValue.fileName;
        switch (imageValue.type) {
          case 1:
            thumbnail = fileUri;
            break;
          case 2:
            screenShot.push(fileUri);
            break;
          case 3:
            gameToken = fileUri;
            break;
          case 4:
            fanCard = fileUri;
            break;
        }
      }

      /** 링크 정보 만들기 */
      let gameVideoLink = '';
      let gameSiteLink = '';
      let gameDiscodeLink = '';
      for (const serviceLinkValue of betagameInfo.serviceLink) {
        /** 사이트 타입 ( 1001000401: 게임 동영상 링크, 1001000402: 공식 사이트 링크, 1001000405: 디스코드 채널 링크) */
        switch (serviceLinkValue.serviceLinkTypeCd) {
          case '1001000401':
            gameVideoLink = serviceLinkValue.serviceLink;
            break;
          case '1001000402':
            gameSiteLink = serviceLinkValue.serviceLink;
            break;
          case '1001000405':
            gameDiscodeLink = serviceLinkValue.serviceLink;
            break;
        }
      }

      /** 앱 정보 조회. 마켓이 C2XWALLET 인것만 조회 함 */
      const appInfo = await this.commonRepo.findAppInfo(
        betagameInfo.gameindex,
        'C2XWALLET',
      );

      if (!appInfo || appInfo === null) {
        return [GameApiHttpStatus.INTERNAL_SERVER_ERROR, 'not search appid'];
      }

      /** 게임명 조회 */
      const gameNameArray: any = await this.commonRepo.selectHiveGameName(
        betagameInfo.gameindex,
        'en',
      );

      let gameName = '';
      if (gameNameArray.length > 0) {
        gameName = gameNameArray[0].name;
      }
      /** 회사 정보 조회 */
      const companyInfo = await this.commonRepo.findHiveCompanyInfo(
        betagameInfo.company,
      );

      /** 회사명 조회 */
      const companyNameArray: any = await this.commonRepo.findHiveCompanyName(
        betagameInfo.company,
        'en',
      );

      let companyName = '';
      if (companyNameArray.length > 0) {
        companyName = companyNameArray[0].name;
      }

      /** 구분자 . 을 기준으로 3개까지만 잘라서 줘야함. */
      const betaAppIdSplit = appInfo.appid.split('.');
      let betaAppId = '';
      for (let i = 0; i < betaAppIdSplit.length; i += 1) {
        if (i === 3 || !betaAppIdSplit[i]) {
          break;
        }
        betaAppId += betaAppIdSplit[i] + '.';
      }
      betaAppId = betaAppId.substring(0, betaAppId.length - 1);

      /** 홀딩스에 전송할 데이터 */
      const betagameRequestData: any = {
        gameTitle: gameName,
        appId: appInfo.appid,
        betaAppId: betaAppId,
        gameIndex: betagameInfo.gameindex,
        /** com2usholing 등록 게임 = 1 하이브 콘솔 등록 = 2 -> 2 고정 */
        gameType: 2,
        /** 출시 예정일 */
        openDate: betagameInfo.releaseDatetime,
        /** 게임소개(요약) */
        subTitle: betagameInfo.gameIntro,
        /** 개발사 */
        infoDeveloper: companyName,
        /** 운영체제 */
        infoPlatform: Object.keys(betagameInfo.osDownLink)
          .map((value: string) => {
            let platformName = '';
            switch (value) {
              case 'android':
                platformName = 'Android';
                break;
              case 'ios':
                platformName = 'iOS';
                break;
              case 'pc':
                platformName = 'PC';
                break;
            }
            return platformName;
          })
          .join(' ,'),
        /** 장르 */
        infoGenre: betagameInfo.gameGenre,
        /** 개발 상태 */
        infoState: developStatus[betagameInfo.developStatusCd],
        /** 게임 소개(상세) */
        infoGameIntroduction: betagameInfo.gameIntroDetail,
        /** 게임 썸네일 이미지 */
        imageUrl: thumbnail,
        /** 공식 사이트 링크 */
        webSiteUrl: gameSiteLink,
        /** (선택) 디스코드 채널 링크 */
        discodeUrl: gameDiscodeLink,
        /** (선택) 게임 동영상 링크 */
        betaPopupUrl: gameVideoLink,
        /** 운영 체제 - Android 링크 */
        betaTestUrlAnd: betagameInfo.osDownLink.android,
        /** 운영 체제 - iOS 링크 */
        betaTestUrlIos: betagameInfo.osDownLink.ios,
        /** 운영 체제 - PC 링크 */
        betaTestUrlPc: betagameInfo.osDownLink.pc,
        /** 운영 체제 - 스크린샷 (하단에서 추가) */
        // screenShotUrl1: '',
        // screenShotUrl2: '',
        // screenShotUrl3: '',
        /** 팬 카드 NFT 이미지 */
        fanNftImageUrl: fanCard,
        /** 상위 재화 이름 */
        //upperGameCurrencyName: '',
        /** 하위 재화 이름 */
        //lowerGameCurrencyName: '',
        /** 팬 카드 NFT 판매 목표 수량 */
        softCap: betagameInfo.fanCardTargetQuantity,
        /** 개인 유저 구매 최대수량, 미입력 가능 */
        //userCap: '',
        /** 베타 게임 테스트 기간 시작일 */
        betaStartTime: betagameInfo.betaTestStartDatetime,
        /** 베타 게임 테스트 기간 시작일 */
        betaEndTime: betagameInfo.betaTestEndDatetime,
        /** 게임 토큰명 */
        gameTokenName: betagameInfo.tokenName,
        /** 게임 토큰명 */
        //gameTokenSymbol: '',
        //gameTokendecimals: '',
        /** 팬 카드 NFT 명 */
        fanNftName: betagameInfo.fanCardTokenName,
        /** 심볼 텍스트 */
        //fanNftSymbol: '',
        //fanNftTokenName: '',
        /** (선택) 팬 카드 NFT 설명 */
        fanNftDescription: betagameInfo.fanCardDescription,
        /** 팬 카드 NFT 판매 기간 (시작) */
        fanStartDate: betagameInfo.fanCardSalesStartDatetime,
        /** 팬 카드 NFT 판매 기간 (종료) */
        fanEndTime: betagameInfo.fanCardSalesEndDatetime,
        /** 팬 카드 NFT 가격 */
        invitationPriceUnit: betagameInfo.fanCardUnitPrice,
        /**
         1: Convert pool 사용 , 36개월 균등 지급, 매 달 수익 정산 진행
         2: Convert pool 사용 , 비선형적 지급 방식 , 매 달 수익 정산 진행
         3: Convert pool 사용 , 물량 일괄 배분(일부 Reserve로 남겨둠) , 수익 정산 진행 X
         4: 전환비 사용 , 수익 정산 진행 X
        */
        revenueSettlement: betagameInfo.distributionType,
        /** CTXT 컨버트 풀 초기 비율 설정 */
        ctxtPoolRate: betagameInfo.xplaConvertPoolInitialRatioGoods,
        /** 게임 토큰 컨버트 풀 초기 비율 설정 */
        gameTokenPoolRate: betagameInfo.gameTokenConvertPoolInitialRatioGoods,
        /** 지갑주소 */
        betaRegAccAddr: betagameInfo.gameProviderAddress,
        /** 게임 토큰 이미지 */
        gameTokenUrl: gameToken,
      };

      for (let i = 0; i < screenShot.length; i += 1) {
        betagameRequestData[`screenShotUrl${i + 1}`] = screenShot[i];
      }

      console.log(
        '-----------------------------------------------------',
        betagameRequestData,
        '-----------------------------------------------------',
      );

      /** 데이터 전송 및 응답 확인 */
      const response = await this.axiosClient.post(
        this.configService.get('C2X_STATION_BETAGAME_REQUEST_URL'),
        betagameRequestData,
      );

      console.log(response);

      return [GameApiHttpStatus.OK, 'success'];
    } catch (e) {
      this.logger.error('exception: ' + id, e.stack);
      return [GameApiHttpStatus.INTERNAL_SERVER_ERROR, 'betagameRequest'];
    }
  }
}
