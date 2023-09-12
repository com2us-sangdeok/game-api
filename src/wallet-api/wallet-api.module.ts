import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WinstonModule } from 'nest-winston';

import { AxiosClientUtil } from '../util/axios-client.util';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { WalletApiController } from './v1/wallet-api.controller';
import { WalletApiService } from './v1/wallet-api.service';
import { WalletApiRepository } from './v1/repository/wallet-api.repository';
import { WalletInfoEntity } from '../entities/wallet-info.entity';
import { BlockchainGameEntitty } from '../entities/blockchain-game.entitty';

@Module({
  imports: [
    TypeOrmModule.forFeature([WalletInfoEntity, BlockchainGameEntitty]),
    WinstonModule,
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        timeout: configService.get('HTTP_TIMEOUT'),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [WalletApiController],
  providers: [WalletApiRepository, WalletApiService, AxiosClientUtil],
})
export class WalletApiModule {}
