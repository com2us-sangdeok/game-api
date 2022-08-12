import { Module } from '@nestjs/common';
import { GameApiV1Controller } from './v1/game-api-v1.controller';
import { V1MintService } from './v1/v1.mint.service';
import { BlockchainModule } from '../bc-core/blockchain/blockchain.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WinstonModule } from 'nest-winston';
import { BlockchainService } from '../bc-core/blockchain/blockchain.service';
import { coreProviders } from '../bc-core/core.provider';
import { CommonService } from '../bc-core/modules/common.service';
import { CW721Service } from '../bc-core/modules/contract/cw721.service';
import { GrantService } from '../bc-core/modules/grant.service';
import { LockService } from '../bc-core/modules/contract/lock.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AxiosClientUtil } from '../util/axios-client.util';
import { AssetModule } from '../asset-api/asset.module';
import { CW20Service } from '../bc-core/modules/contract/cw20.service';
import { GameApiRepository } from './v1/repository/game-api.repository';
import { BcCoreModule } from '../bc-core/core.module';
import {
  ConvertPoolEntity,
  TransactionEntity,
  NonFungibleTokenEntity,
  MintLogEntity,
  SequenceEntity,
} from '../entities';
import {MetadataModule} from "../metadata-api/metadata.module";

@Module({
  imports: [
    BlockchainModule,
    TypeOrmModule.forFeature([
      ConvertPoolEntity,
      TransactionEntity,
      NonFungibleTokenEntity,
      MintLogEntity,
    ]),
    WinstonModule,
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        timeout: configService.get('HTTP_TIMEOUT'),
        // maxRedirects: configService.get('HTTP_MAX_REDIRECTS'),
      }),
      inject: [ConfigService],
    }),
    AssetModule,
    MetadataModule,
    BcCoreModule,
  ],
  controllers: [GameApiV1Controller],
  providers: [
    ...coreProviders,
    BlockchainService,
    // GrantService,
    // LockService,
    // CommonService,
    // CW20Service,
    // CW721Service,
    V1MintService,
    AxiosClientUtil,
    GameApiRepository,
  ],
})
export class GameApiModule {}
