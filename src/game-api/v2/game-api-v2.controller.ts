import { Controller, Get, Param, Version } from '@nestjs/common';
import { GameApiV2Service } from './game-api-v2.service';

@Controller({
  version: '2',
})
export class GameApiV2Controller {
  constructor(private readonly gameApiService: GameApiV2Service) {}

  @Get('/account/:address')
  test(@Param('address') address: string): string {
    return 'v2'; //this.gameApiService.createAccount(address);
  }
}
