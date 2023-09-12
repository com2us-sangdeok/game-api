import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WinstonModule } from 'nest-winston';
import { BetagameApplyRepository } from './v1/repository/beta-game-apply.repository';
import { BetaGameApplyV1Controller } from './v1/beta-game-apply-v1.controller';
import { BetaGameV1Controller } from './v1/beta-game-v1.controller';
import { BetagameRepository } from './v1/repository/beta-game.repository';
import { BetaGameApplyV1Service } from './v1/beta-game-apply-v1.service';
import { BetaGameV1Service } from './v1/beta-game-v1.service';
import { ConsoleApiV1Service } from '../console-api/v1/console-api-v1.service';
import { BlockchainGameRepository } from '../console-api/v1/repository/blockchain-game.repository';
import { CommonRepository } from '../commom/repository/common.repository';
import {
  CodeEntity,
  CodeGroupEntity,
  CodeGroupCodeEntity,
  CompanyEntity,
  AppInfoEntity,
  CompanyNameEntity,
  GameInfoEntity,
  GameServerEntity,
  GameNameEntity,
  BlockChainGameServerEntity,
} from '../commom/repository/common.entitty';
import {
  BetaGameApplyEntity,
  BetaGameLinkEntity,
  BetaGameImagesEntity,
} from '../entities/beta-game-apply.entity';
import { BetaGameEntity } from '../entities/beta-game.entity';
import {
  BlockchainGameApiInfoEntity,
  BlockchainGameApiTestInfoEntity,
  BlockchainGameEntitty,
  ConvertSettingInfoEntity,
  MintCategorySettingInfoEntity,
  MintFeeInfoEntity,
} from '../entities/blockchain-game.entitty';
import { AssetV1Service } from '../asset-api/v1/asset-v1.service';
import { AssetRepository } from '../asset-api/repository/asset.repository';
import { ImageUtil } from '../util/image.util';
import { AxiosClientUtil } from '../util/axios-client.util';
import { S3storageUtil } from '../util/s3storage.util';
import { AssetEntity } from '../entities/asset.entity';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      /** 공용 */
      CodeEntity,
      CodeGroupEntity,
      CodeGroupCodeEntity,
      CompanyEntity,
      AppInfoEntity,
      CompanyNameEntity,
      GameInfoEntity,
      GameServerEntity,
      GameNameEntity,
      BlockChainGameServerEntity,

      /** 베타게임 신청 */
      BetaGameApplyEntity,
      BetaGameLinkEntity,
      BetaGameImagesEntity,

      /** 베타게임 현황 */
      BetaGameEntity,

      /** 콘솔에서 등록하는 블록체인 게임 정보들 */
      BlockchainGameEntitty,
      BlockchainGameApiTestInfoEntity,
      BlockchainGameApiInfoEntity,
      ConvertSettingInfoEntity,
      MintCategorySettingInfoEntity,
      MintFeeInfoEntity,

      /** 이미지 업로드 */
      AssetEntity,
    ]),
    WinstonModule,
    /** 이미지 업로드 */
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        timeout: configService.get('HTTP_TIMEOUT'),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [
    /** 베타게임 신청 */
    BetaGameApplyV1Controller,

    /** 베타게임 현황 */
    BetaGameV1Controller,
  ],
  providers: [
    /** 공용 */
    CommonRepository,

    /** 베타게임 신청 */
    BetaGameApplyV1Service,
    BetagameApplyRepository,

    /** 베타게임 현황 */
    BetaGameV1Service,
    BetagameRepository,

    /** 콘솔API 서비스 */
    ConsoleApiV1Service,
    BlockchainGameRepository,

    /** 이미지 업로드 */
    AssetRepository,
    AssetV1Service,
    ImageUtil,
    AxiosClientUtil,
    S3storageUtil,
  ],
})
export class BetaGameModule {}
