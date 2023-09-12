import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { TransactionUtil } from '../../util/transacation.util';
import { BetagameRepository } from './repository/beta-game.repository';
import { BetaGameEntity } from '../../entities/beta-game.entity';
import { BetagameApplyRepository } from './repository/beta-game-apply.repository';
import { BetaGameApplyEntity } from '../../entities/beta-game-apply.entity';
import { GameApiException, GameApiHttpStatus } from '../../exception/exception';
import {
  betaGameContractResDto,
  BetaGameLauncherResDto,
  BetaGameListsDto,
  BetaGameListsResDto,
  BetaGameResDto,
} from './dto/beta-game-v1.res.dto';
import { SalesSyncReqDto, UpdateReqDto } from './dto/beta-game-v1.req.dto';
import { CommonRepository } from '../../commom/repository/common.repository';
import { AxiosClientUtil } from '../../util/axios-client.util';

@Injectable()
export class BetaGameV1Service {
  private TxUtil: TransactionUtil = new TransactionUtil(
    this.configService.get('SERVICE_USERAGENT'),
    this.configService.get('SERVICE_URL'),
    parseInt(this.configService.get('SERVICE_TIMEOUT')),
  );

  constructor(
    private configService: ConfigService,
    private readonly betaGameRepo: BetagameRepository,
    private readonly betaGameApplyRepo: BetagameApplyRepository,
    private readonly commonRepo: CommonRepository,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
    private axiosClient: AxiosClientUtil,
  ) {}

  /**
   * 베타게임런처 진행현황 상세 정보 조회
   * @param id
   */
  async findOne(
    id: number,
  ): Promise<[statusCode: number, message: string, result?: any]> {
    try {
      // 등록되어 있는건지 확인함
      if (!(await this.betaGameRepo.checkId(id))) {
        // 실패시 false
        throw new NotFoundException();
      }

      const result = <BetaGameEntity>(
        await this.betaGameRepo.select(<BetaGameEntity>{ bliId: id })
      );
      return [
        GameApiHttpStatus.OK,
        'success',
        <BetaGameResDto>{
          id: result.id,
          bliId: result.bliId,
          company: result.company,
          gameindex: result.gameindex,
          progressStatusCd: result.progressStatusCd,
          fanCardSalesEndDatetime: result.fanCardSalesEndDatetime,
          fanCardSalesStartDatetime: result.fanCardSalesStartDatetime,
          betaTestStartDatetime: result.betaTestStartDatetime,
          betaTestEndDatetime: result.betaTestEndDatetime,
          fanCardTargetQuantity: result.fanCardTargetQuantity,
          fanCardSalesQuantity: result.fanCardSalesQuantity,
          fanCardUnitPrice: result.fanCardUnitPrice,
          lockContract: result.lockContract,
          xplaContract: result.xplaContract,
          gameProviderAddress: result.gameProviderAddress,
          treasuryAddress: result.treasuryAddress,
          serverAddress: result.serverAddress,
          xplaHolderAddress: result.xplaHolderAddress,
          gameTokenContract: result.gameTokenContract,
          fanHolderAddress: result.fanHolderAddress,
          nftContract: result.nftContract,
          gameContract: result.gameContract,
          updateAt: result.updateAt,
        },
      ];
    } catch (e) {
      this.logger.error('exception: ', e.stack);
      return [e.response.statusCode, e.response.message];
    }
  }

  /**
   * 베타 게임 런처에서 임시저장 및 신청 완료 시, 해당 Service를 통해 대기중 상태로 등록
   * @param id : number 베타게임런처 고유번호
   */
  async create(
    id: number,
  ): Promise<[statusCode: number, message: string, result?: any]> {
    try {
      /** 등록하기 위해서 bli_id로 신청 접수한 내용 조회 */
      const betaGameApplyInfo: BetaGameApplyEntity =
        await this.betaGameApplyRepo.selectId(id);

      /** 신청 내역이 없으면 에러 */
      if (!betaGameApplyInfo) {
        throw new NotFoundException();
      }

      /** 이미 등록되어 있는지 확인. 이미 등록된 내역이면 업데이트 함. */
      if (await this.betaGameRepo.checkId(id)) {
        // 접수 내역 업데이트
        await this.betaGameRepo.applyUpdate(id, <BetaGameEntity>{
          gameIntro: betaGameApplyInfo.gameIntro,
          gameIntroDetail: betaGameApplyInfo.gameIntroDetail,
          gameProviderAddress: betaGameApplyInfo.gameProviderAddress,
          fanCardTargetQuantity: betaGameApplyInfo.fanCardTargetQuantity,
          fanCardUnitPrice: betaGameApplyInfo.fanCardUnitPrice,
          distributionType: betaGameApplyInfo.distributionType,
          registerStatusCd: betaGameApplyInfo.registerStatusCd,
          xplaConvertPoolInitialRatio:
            betaGameApplyInfo.xplaConvertPoolInitialRatio,
          xplaConvertPoolInitialRatioGoods:
            betaGameApplyInfo.xplaConvertPoolInitialRatioGoods,
          gameTokenConvertPoolInitialRatio:
            betaGameApplyInfo.gameTokenConvertPoolInitialRatio,
          gameTokenConvertPoolInitialRatioGoods:
            betaGameApplyInfo.gameTokenConvertPoolInitialRatioGoods,
          fanCardSalesStartDatetime:
            betaGameApplyInfo.fanCardSalesStartDatetime,
          fanCardSalesEndDatetime: betaGameApplyInfo.fanCardSalesEndDatetime,
          betaTestStartDatetime: betaGameApplyInfo.betaTestStartDatetime,
          betaTestEndDatetime: betaGameApplyInfo.betaTestEndDatetime,
        });

        return [GameApiHttpStatus.OK, 'success'];
      } else {
        // 중복이 아니라면 등록
        const insert_id = await this.betaGameRepo.insert(<BetaGameEntity>{
          bliId: id,
          company: betaGameApplyInfo.company,
          gameindex: betaGameApplyInfo.gameindex,
          gameIntro: betaGameApplyInfo.gameIntro,
          gameIntroDetail: betaGameApplyInfo.gameIntroDetail,
          gameProviderAddress: betaGameApplyInfo.gameProviderAddress,
          fanCardTargetQuantity: betaGameApplyInfo.fanCardTargetQuantity,
          fanCardUnitPrice: betaGameApplyInfo.fanCardUnitPrice,
          fanCardSalesStartDatetime:
            betaGameApplyInfo.fanCardSalesStartDatetime,
          fanCardSalesEndDatetime: betaGameApplyInfo.fanCardSalesEndDatetime,
          betaTestStartDatetime: betaGameApplyInfo.betaTestStartDatetime,
          betaTestEndDatetime: betaGameApplyInfo.betaTestEndDatetime,
          distributionType: betaGameApplyInfo.distributionType,
          registerStatusCd: betaGameApplyInfo.registerStatusCd,
          xplaConvertPoolInitialRatio:
            betaGameApplyInfo.xplaConvertPoolInitialRatio,
          xplaConvertPoolInitialRatioGoods:
            betaGameApplyInfo.xplaConvertPoolInitialRatioGoods,
          gameTokenConvertPoolInitialRatio:
            betaGameApplyInfo.gameTokenConvertPoolInitialRatio,
          gameTokenConvertPoolInitialRatioGoods:
            betaGameApplyInfo.gameTokenConvertPoolInitialRatioGoods,
          progressStatusCd: '1001000101',
        });

        return [GameApiHttpStatus.OK, 'success', { id: insert_id }];
      }
    } catch (e) {
      this.logger.error('exception: ', e.stack);
      return [e.response.statusCode, e.response.message];
    }
  }

  /**
   * 베타게임 런처 진행 현황 목록 조회
   * @param query
   */
  async lists(
    query,
  ): Promise<[statusCode: number, message: string, result?: any]> {
    try {
      const result = await this.betaGameRepo.selectLists(query);

      let data = {
        lists: null,
        meta: null,
      };

      console.log(result.data);

      if (result.data.length > 0) {
        const BetaGameRes: BetaGameListsDto[] = [];
        for (const value of result.data) {
          BetaGameRes.push(<BetaGameListsDto>{
            id: value.id,
            bliId: value.bliId,
            company: value.company,
            gameindex: value.gameindex,
            gameIntro: value.gameIntro,
            gameIntroDetail: value.gameIntroDetail,
            progressStatusCd: value.progressStatusCd,
            registerStatusCd: value.registerStatusCd,
            fanCardSalesStartDatetime: value.fanCardSalesStartDatetime,
            fanCardSalesEndDatetime: value.fanCardSalesEndDatetime,
            betaTestStartDatetime: value.betaTestStartDatetime,
            betaTestEndDatetime: value.betaTestEndDatetime,
            fanCardTargetQuantity: value.fanCardTargetQuantity,
            fanCardSalesQuantity: value.fanCardSalesQuantity,
            lockContract: value.lockContract,
            xplaContract: value.xplaContract,
            gameProviderAddress: value.gameProviderAddress,
            treasuryAddress: value.treasuryAddress,
            serverAddress: value.serverAddress,
            xplaHolderAddress: value.xplaHolderAddress,
            gameTokenContract: value.gameTokenContract,
            fanHolderAddress: value.fanHolderAddress,
            nftContract: value.nftContract,
            gameContract: value.gameContract,
            distributionType: value.distributionType,
            xplaConvertPoolInitialRatio: value.xplaConvertPoolInitialRatio,
            xplaConvertPoolInitialRatioGoods:
              value.xplaConvertPoolInitialRatioGoods,
            gameTokenConvertPoolInitialRatio:
              value.gameTokenConvertPoolInitialRatio,
            gameTokenConvertPoolInitialRatioGoods:
              value.gameTokenConvertPoolInitialRatioGoods,
            createAt: value.createAt,
            updateAt: value.updateAt,
            appid: null,
            betaGameLauncherData: null,
          });
        }

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
          return [GameApiHttpStatus.UNAUTHORIZED, 'Unauthorized'];
        }

        const accessToken = authResponse.data.accessToken;

        /** 게임 index 만 추리고 */
        const gameIndexList: number[] = BetaGameRes.map((data) => {
          return data.gameindex;
        });

        /** 쿼리 한번에 게임 인덱스에 매칭된 appid 불러오고 */
        const appLists = await this.commonRepo.findAppLists(
          gameIndexList,
          'C2XWALLET',
        );

        /** 데이터 전송 및 응답 확인 */
        const BetaGameLauncherResponseData = (
          await this.axiosClient.get(
            this.configService.get('C2X_STATION_BETAGAME_LIST_URL'),
          )
        ).body;

        const BetaGameLauncherLists: any = {};
        for (const value of BetaGameLauncherResponseData) {
          BetaGameLauncherLists[value.appid] = value;
        }

        /** 베타게임 정보에 appid, 베게런정보 추가 */
        for (const key in BetaGameRes) {
          for (const value of appLists) {
            if (BetaGameRes[key].gameindex === value.gameindex) {
              BetaGameRes[key].appid = value.appid;
              if (Object.keys(BetaGameLauncherLists).includes(value.appid)) {
                BetaGameRes[key].betaGameLauncherData = <
                  BetaGameLauncherResDto
                >{
                  gameId: BetaGameLauncherLists[value.appid].gameId,
                  title: BetaGameLauncherLists[value.appid].title,
                  subTitle: BetaGameLauncherLists[value.appid].subTitle,
                  startDate: BetaGameLauncherLists[value.appid].startDate,
                  endDate: BetaGameLauncherLists[value.appid].endDate,
                  hardCap: BetaGameLauncherLists[value.appid].hardCap,
                  softCap: BetaGameLauncherLists[value.appid].softCap,
                  userCap: BetaGameLauncherLists[value.appid].userCap,
                  invitationPrice:
                    BetaGameLauncherLists[value.appid].invitationPrice,
                  infoDeveloper:
                    BetaGameLauncherLists[value.appid].infoDeveloper,
                  infoPlatform: BetaGameLauncherLists[value.appid].infoPlatform,
                  infoGenre: BetaGameLauncherLists[value.appid].infoGenre,
                  infoState: BetaGameLauncherLists[value.appid].infoState,
                  infoReleaseDate:
                    BetaGameLauncherLists[value.appid].infoReleaseDate,
                  infoGameIntroduction:
                    BetaGameLauncherLists[value.appid].infoGameIntroduction,
                  status: BetaGameLauncherLists[value.appid].status,
                  leftTime: BetaGameLauncherLists[value.appid].leftTime,
                  nftName: BetaGameLauncherLists[value.appid].nftName,
                  fanStartDate: BetaGameLauncherLists[value.appid].fanStartDate,
                  fanEndTime: BetaGameLauncherLists[value.appid].fanEndTime,
                  imageUrl: BetaGameLauncherLists[value.appid].imageUrl,
                  webSiteUrl: BetaGameLauncherLists[value.appid].webSiteUrl,
                  discodeUrl: BetaGameLauncherLists[value.appid].discodeUrl,
                  betaTestUrlAnd:
                    BetaGameLauncherLists[value.appid].betaTestUrlAnd,
                  betaTestUrlIos:
                    BetaGameLauncherLists[value.appid].betaTestUrlIos,
                  betaTestUrlPc:
                    BetaGameLauncherLists[value.appid].betaTestUrlPc,
                  screenShotUrl1:
                    BetaGameLauncherLists[value.appid].screenShotUrl1,
                  screenShotUrl2:
                    BetaGameLauncherLists[value.appid].screenShotUrl2,
                  screenShotUrl3:
                    BetaGameLauncherLists[value.appid].screenShotUrl3,
                  betaPopupUrl: BetaGameLauncherLists[value.appid].betaPopupUrl,
                  gameContract: BetaGameLauncherLists[value.appid].gameContract,
                  decimals: BetaGameLauncherLists[value.appid].decimals,
                  fanContract: BetaGameLauncherLists[value.appid].fanContract,
                  symbol: BetaGameLauncherLists[value.appid].symbol,
                  claimServerAddr:
                    BetaGameLauncherLists[value.appid].claimServerAddr,
                  betaContract: BetaGameLauncherLists[value.appid].betaContract,
                  appid: BetaGameLauncherLists[value.appid].appid,
                  contractData: null,
                };

                /** 베타게임 컨트랙트 정보 조회 */
                const betaGameContractInfo = (
                  await this.axiosClient.get(
                    this.configService.get('BETAGAME_CONTRACT_REQUEST_API_URL'),
                    {
                      Authorization: 'Bearer ' + accessToken,
                      betaGameContractAddress:
                        BetaGameLauncherLists[value.appid].betaContract,
                      gameTokenAddress:
                        BetaGameLauncherLists[value.appid].gameContract,
                    },
                  )
                ).body;

                /** 베타게임 컨트랙트 정보가 정상 조회 되었으면 값을 넣어줌 */
                if (betaGameContractInfo.code === 0) {
                  BetaGameRes[key].betaGameLauncherData.contractData =
                    betaGameContractInfo.data;
                } else {
                  BetaGameRes[key].betaGameLauncherData = null;
                }
              } // end if (Object.keys(BetaGameLauncherLists).includes(value.appid)) {
            }
          }
        }

        //console.log(BetaGameRes);

        // 검색이 되었을때 데이터 주입
        data = {
          lists: BetaGameRes,
          meta: {
            totalItems: result.meta.totalItems,
            currentPage: result.meta.currentPage,
            totalPages: result.meta.totalPages,
          },
        };
      }

      return [GameApiHttpStatus.OK, 'success', data];
    } catch (e) {
      this.logger.error('exception: ', e.stack);
      return [e.response.statusCode, e.response.message];
    }
  }

  /**
   * 베타게임 런처 현황 정보 업데이트 후, 응답 정보 생성
   * @param id
   * @param dto
   */
  async update(
    id: number,
    dto: UpdateReqDto,
  ): Promise<[statusCode: number, message: string, result?: any]> {
    try {
      const update = await this.betaGameRepo.update(id, <BetaGameEntity>{
        fanCardUnitPrice: dto.fanCardUnitPrice,
        fanCardTargetQuantity: dto.fanCardTargetQuantity,
        fanCardSalesStartDatetime: dto.fanCardSalesStartDatetime,
        fanCardSalesEndDatetime: dto.fanCardSalesEndDatetime,
        betaTestStartDatetime: dto.betaTestStartDatetime,
        betaTestEndDatetime: dto.betaTestEndDatetime,
        registerStatusCd: dto.registerStatusCd,
        distributionType: dto.distributionType,
        xplaConvertPoolInitialRatioGoods: dto.xplaConvertPoolInitialRatioGoods,
        gameTokenConvertPoolInitialRatioGoods:
          dto.gameTokenConvertPoolInitialRatioGoods,
      });
      return [GameApiHttpStatus.OK, 'success'];
    } catch (e) {
      this.logger.error(
        'exception: ' + JSON.stringify(BetaGameEntity),
        e.stack,
      );
      return [e.response.statusCode, e.response.message];
    }
  }

  /**
   * 베타게임런처 팬카드 판매 수량 업데이트
   * @param id
   * @param dto
   */
  async updateFanCardSales(
    id: number,
    dto: SalesSyncReqDto,
  ): Promise<[statusCode: number, message: string, result?: any]> {
    try {
      const update = await this.betaGameRepo.update(id, <BetaGameEntity>{
        fanCardSalesQuantity: dto.fanCardSalesQuantity,
      });
      return [GameApiHttpStatus.OK, 'success'];
    } catch (e) {
      this.logger.error(
        'exception: ' + JSON.stringify(BetaGameEntity),
        e.stack,
      );
      return [e.response.statusCode, e.response.message];
    }
  }
}
