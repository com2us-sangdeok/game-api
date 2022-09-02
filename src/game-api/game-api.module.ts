import { Module } from '@nestjs/common';
import { V1MintService } from './v1/mint/v1.mint.service';
import { BlockchainModule } from '../bc-core/blockchain/blockchain.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WinstonModule } from 'nest-winston';
import { BlockchainService } from '../bc-core/blockchain/blockchain.service';
import { coreProviders } from '../bc-core/core.provider';
import { V1MintController } from './v1/mint/v1.mint.controller';
import { V1ConvertController } from './v1/convert/v1.convert.controller';
import { V1LockController } from './v1/lock/v1.lock.controller';
import { CommonService } from '../bc-core/modules/common.service';
import { CW721Service } from '../bc-core/modules/contract/cw721.service';
import { GrantService } from '../bc-core/modules/grant.service';
import { LockService } from '../bc-core/modules/contract/lock.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AxiosClientUtil } from '../util/axios-client.util';
import { AssetModule } from '../asset-api/asset.module';
import { CW20Service } from '../bc-core/modules/contract/cw20.service';
import { MintRepository } from './v1/repository/mint.repository';
import { BcCoreModule } from '../bc-core/core.module';
import { V1ConvertService } from './v1/convert/v1.convert.service';
import { V1LockService } from './v1/lock/v1.lock.service';
import {
  ConvertPoolEntity,
  TransactionEntity,
  TokenIdEntity,
  MintLogEntity,
  SequenceEntity,
} from '../entities';
import {MetadataModule} from "../metadata-api/metadata.module";
import { SequenceRepository } from '../util/repository/sequence.repository';
import { SequenceUtil } from '../util/sequence.util';
import { ConvertRepository } from './v1/repository/convert.repository';
import { TransactionRepository } from './v1/repository/transaction.repository';
import { V1BroadcastController } from './v1/broadcast/v1.broadcast.controller';
import { V1BroadcastService } from './v1/broadcast/v1.broadcast.service';

@Module({
  imports: [
    BlockchainModule,
    TypeOrmModule.forFeature([
      ConvertPoolEntity,
      TransactionEntity,
      TokenIdEntity,
      MintLogEntity,
      SequenceEntity,
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
  controllers: [V1MintController, V1ConvertController, V1LockController],
  providers: [
    ...coreProviders,
    BlockchainService,
    // GrantService,
    // LockService,
    // CommonService,
    CW20Service,
    // CW721Service,
    V1MintService,
    V1ConvertService,
    V1LockService,
    V1BroadcastService,
    AxiosClientUtil,
    MintRepository,
    SequenceRepository,
    SequenceUtil,
    ConvertRepository,
    TransactionRepository,
  ],
})
export class GameApiModule {}
