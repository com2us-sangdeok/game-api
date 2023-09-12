import { Module } from '@nestjs/common';
import { GameApiV1Controller } from './v1/game-api-v1.controller';
import { WinstonModule } from 'nest-winston';

@Module({
  // imports: [
  //   GameApiV1Module,
  //   GameApiV2Module,
  //
  //   RouterModule.register([
  //     {
  //       path: 'v1',
  //       module: GameApiV1Module,
  //     },
  //     {
  //       path: 'v2',
  //       module: GameApiV2Module,
  //     },
  //   ]),
  // ],
  imports: [
    /*BlockchainModule, TypeOrmModule.forFeature([ConvertPoolEntity]),*/ WinstonModule,
  ],
  controllers: [GameApiV1Controller],
  // providers: [...gameApiProviders, GameApiV1Service, GameApiV2Service],
})
export class GameApiModule {}
