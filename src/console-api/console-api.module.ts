import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WinstonModule } from 'nest-winston';
import { CommonRepository } from '../commom/repository/common.repository';
import { ConsoleApiV1Controller } from './v1/console-api-v1.controller';
import { ConsoleApiV1Service } from './v1/console-api-v1.service';
import { BlockchainGameRepository } from './v1/repository/blockchain-game.repository';
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
  BlockchainGameEntitty,
  BlockchainGameApiTestInfoEntity,
  BlockchainGameApiInfoEntity,
  ConvertSettingInfoEntity,
  MintCategorySettingInfoEntity,
  MintFeeInfoEntity,
} from '../entities/blockchain-game.entitty';
import { BetagameRepository } from '../beta-game-api/v1/repository/beta-game.repository';
import { BetaGameEntity } from '../entities/beta-game.entity';
import { AssetRepository } from '../asset-api/repository/asset.repository';
import { AssetV1Service } from '../asset-api/v1/asset-v1.service';
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

      /** 콘솔에서 등록하는 블록체인 게임 정보들 */
      BlockchainGameEntitty,
      BlockchainGameApiTestInfoEntity,
      BlockchainGameApiInfoEntity,
      ConvertSettingInfoEntity,
      MintCategorySettingInfoEntity,
      MintFeeInfoEntity,

      /** 베타게임 */
      BetaGameEntity,

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
  controllers: [ConsoleApiV1Controller],
  providers: [
    /** 공용 */
    CommonRepository,

    /** 콘솔 API */
    ConsoleApiV1Service,
    BlockchainGameRepository,

    /** 베타게임 */
    BetagameRepository,

    /** 이미지 업로드 */
    AssetRepository,
    AssetV1Service,
    ImageUtil,
    AxiosClientUtil,
    S3storageUtil,
  ],
})
export class ConsoleApiModule {}
