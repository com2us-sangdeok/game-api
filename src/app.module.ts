import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule, TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import { getLogFormat, typeOrmTransports } from './logger/winston.config';
import { LoggerMiddleware } from './middleware/logger.middleware';
import DatabaseLogger from './logger/database.logger';
import { RequestContextMiddleware } from './middleware/request-context.middleware';
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
} from './commom/repository/common.entitty';
import { BetaGameEntity } from './entities/beta-game.entity';
import {
  BetaGameApplyEntity,
  BetaGameLinkEntity,
  BetaGameImagesEntity,
} from './entities/beta-game-apply.entity';
import {
  BlockchainGameEntitty,
  BlockchainGameApiInfoEntity,
  BlockchainGameApiTestInfoEntity,
  MintCategorySettingInfoEntity,
  ConvertSettingInfoEntity,
  MintFeeInfoEntity,
} from './entities/blockchain-game.entitty';
import { AssetEntity } from './entities/asset.entity';
import { BetaGameModule } from './beta-game-api/beta-game.module';
import { ConsoleApiModule } from './console-api/console-api.module';
import { GameCommonApiModule } from './game-common-api/game-common-api.module';
import { GameApiModule } from './sample-game-api/game-api.module';
import { AssetModule } from './asset-api/asset.module';
import { WalletApiModule } from './wallet-api/wallet-api.module';
import { WalletInfoEntity } from './entities/wallet-info.entity';
import { ContractApiModule } from './contract-api/contract-api.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `${process.cwd()}/.env.${process.env.NODE_ENV}`,
    }),
    TerminusModule,
    HttpModule,
    WinstonModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        format: getLogFormat(process.env.NODE_ENV),
        transports: typeOrmTransports(process.env.NODE_ENV, configService),
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forRootAsync({
      useFactory: async (configService: ConfigService) => {
        return {
          type: configService.get('DB_TYPE'),
          host: configService.get('DB_HOST'),
          port: configService.get('DB_PORT'),
          username: configService.get('DB_USERNAME'),
          password: configService.get('DB_PASSWORD'),
          database: configService.get('DB_DATABASE'),
          entities: [
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

            /** 베타게임런처 신청 */
            BetaGameApplyEntity,
            BetaGameLinkEntity,
            BetaGameImagesEntity,
            /** 베타게임런처 현황 */
            BetaGameEntity,

            /** 블록체인게임 */
            BlockchainGameEntitty,
            BlockchainGameApiInfoEntity,
            BlockchainGameApiTestInfoEntity,
            MintCategorySettingInfoEntity,
            ConvertSettingInfoEntity,
            MintFeeInfoEntity,

            /** 이미지 업로드 */
            AssetEntity,

            /** 지갑 관리 */
            WalletInfoEntity,
          ],
          synchronize: configService.get('DB_SYNCHRONIZE') === 'true',
          logging: true,
          logger: new DatabaseLogger(process.env.NODE_ENV),
        } as TypeOrmModuleAsyncOptions;
      },
      inject: [ConfigService],
    }),
    /** 베타게임런처 API */
    BetaGameModule,
    /** 콘솔 API */
    ConsoleApiModule,
    /** 웹뷰 API */
    GameCommonApiModule,
    /** 샘플게임 API */
    GameApiModule,
    /** 이미지 업로드 */
    AssetModule,
    /** 지갑 관리 */
    WalletApiModule,
    /** 컨트랙트 관리 */
    ContractApiModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestContextMiddleware, LoggerMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
