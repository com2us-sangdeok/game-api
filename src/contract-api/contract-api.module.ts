import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WinstonModule } from 'nest-winston';

import { AxiosClientUtil } from '../util/axios-client.util';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { ContractApiController } from './v1/contract-api.controller';
import { ContractApiService } from './v1/contract-api.service';
import { ContractApiRepository } from './v1/repository/contract-api.repository';
import { WalletInfoEntity } from '../entities/wallet-info.entity';
import { BetaGameEntity } from '../entities/beta-game.entity';
import { GameInfoEntity } from '../entities/common.entitty';
import { BlockchainGameEntitty } from '../entities/blockchain-game.entitty';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WalletInfoEntity,
      BlockchainGameEntitty,
      GameInfoEntity,
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
  controllers: [ContractApiController],
  providers: [ContractApiRepository, ContractApiService, AxiosClientUtil],
})
export class ContractApiModule {}
