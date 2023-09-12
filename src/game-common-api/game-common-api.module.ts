import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WinstonModule } from 'nest-winston';
import { CommonRepository } from '../commom/repository/common.repository';
import { GameCommonApiRepository } from './v1/repository/game-common-api.repository';
import { GameCommonApiV1Controller } from './v1/game-common-v1.controller';
import { GameCommonApiV1Service } from './v1/game-common-api-v1.service';
import {
  CodeEntity,
  CodeGroupEntity,
  CodeGroupCodeEntity,
  CompanyEntity,
  AppInfoEntity,
  CompanyNameEntity,
  GameInfoEntity,
  GameNameEntity,
  GameServerEntity,
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
import { BetaGameEntity } from '../entities/beta-game.entity';
import { AxiosClientUtil } from '../util/axios-client.util';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      /* 공용 */
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
      /* 콘솔에서 등록하는 블록체인 게임 정보들 */
      BlockchainGameEntitty,
      BlockchainGameApiTestInfoEntity,
      BlockchainGameApiInfoEntity,
      ConvertSettingInfoEntity,
      MintCategorySettingInfoEntity,
      MintFeeInfoEntity,

      /** 베타 게임 런처 정보 */
      BetaGameEntity,
    ]),
    WinstonModule,
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        timeout: configService.get('HTTP_TIMEOUT'),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [GameCommonApiV1Controller],
  providers: [
    /* 공용 */
    CommonRepository,

    /* 콘솔 API */
    GameCommonApiV1Service,
    GameCommonApiRepository,

    AxiosClientUtil,
  ],
})
export class GameCommonApiModule {}
