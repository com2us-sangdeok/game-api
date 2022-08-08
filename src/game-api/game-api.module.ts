import { Module } from '@nestjs/common';
import { GameApiV1Controller } from './v1/game-api-v1.controller';
import { GameApiV1Service } from './v1/game-api-v1.service';
import { BlockchainModule } from '../core/blockchain/blockchain.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConvertPoolEntity } from './repository/convert-pool.entity';
import { WinstonModule } from 'nest-winston';
import { BlockchainService } from '../core/blockchain/blockchain.service';
import { coreProviders } from '../core/core.provider';
import {CommonService} from "../core/modules/common.service";
import {CW721Service} from "../core/modules/contract/cw721.service";
import {GrantService} from "../core/modules/grant.service";
import {LockService} from "../core/modules/contract/lock.service";
import {HttpModule} from "@nestjs/axios";
import {ConfigModule, ConfigService} from "@nestjs/config";
import {AxiosClientUtil} from "../util/axios-client.util";
import {AssetModule} from "../asset/asset.module";
import {CW20Service} from "../core/modules/contract/cw20.service";
import {GameApiRepository} from "./repository/game-api.repository";
import {SequenceEntity} from "../core/repository/sequence.entity";
import {CoreModule} from "../core/core.module";
import {TransactionEntity} from "./repository/transaction.entity";
import {NonFungibleTokenEntity} from "./repository/non-fungible-token.entity";

@Module({
    imports: [
        BlockchainModule,
        TypeOrmModule.forFeature([ConvertPoolEntity, TransactionEntity, NonFungibleTokenEntity]),
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
        CoreModule,
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
        GameApiV1Service,
        AxiosClientUtil,
        GameApiRepository,
    ],
})
export class GameApiModule {}
