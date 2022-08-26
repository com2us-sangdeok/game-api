import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import {
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
} from '@nestjs/terminus';
import { BlockchainService } from './bc-core/blockchain/blockchain.service';
import { CommonService } from './bc-core/modules/common.service';

@Controller()
export class AppController {
  private bc = this.blockchainService.blockChainClient();
  private lcd = this.blockchainService.lcdClient();

  constructor(
    private readonly appService: AppService,
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private blockchainService: BlockchainService,
    private commonService: CommonService,
  ) {}

  @Get('health')
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.http.pingCheck('blockchain-api', 'http://localhost:3000'),
    ]);
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('test')
  async getTest(): Promise<string> {
    console.log(
      await this.commonService.getBalance(
        'xpla16v6y48xllwy7amcmvhkv0a3zp7jepl44yvhvxt',
      ),
    );
    return this.appService.getHello();
  }
}
