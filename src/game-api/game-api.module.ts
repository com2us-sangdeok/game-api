import { Module } from '@nestjs/common';
// import { GameApiV1Module } from './v1/game-api-v1.modules';
// import { GameApiV2Module } from './v2/game-api-v2.modules';
// import { RouterModule } from '@nestjs/core';
import { GameApiV2Controller } from './v2/game-api-v2.controller';
import { GameApiV1Controller } from './v1/game-api-v1.controller';
import { gameApiProviders } from './game-api.providers';
import { GameApiV1Service } from './v1/game-api-v1.service';
import { BlockchainModule } from '../core/blockchain/blockchain.module';
import { GameApiV2Service } from './v2/game-api-v2.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConvertPoolEntity } from './repository/convert-pool.entitty';
import { WinstonModule } from 'nest-winston';
import { BlockchainService } from '../core/blockchain/blockchain.service';
import { coreProviders } from '../core/core.provider';

@Module({
  // imports: [
  //   GameApiV1Module,
  //   GameApiV2Module,
  //
  //   RouterModule.register([
  //     {
  //       path: 'v1',
  //       modules: GameApiV1Module,
  //     },
  //     {
  //       path: 'v2',
  //       modules: GameApiV2Module,
  //     },
  //   ]),
  // ],
    imports: [
        BlockchainModule,
        TypeOrmModule.forFeature([ConvertPoolEntity]),
        WinstonModule,
    ],
    controllers: [GameApiV1Controller, GameApiV2Controller],
    providers: [
        ...coreProviders,
        GameApiV1Service,
        GameApiV2Service,
        BlockchainService,
    ],
})
export class GameApiModule {}
