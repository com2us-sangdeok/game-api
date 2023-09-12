// import {Injectable, Inject, InternalServerErrorException} from '@nestjs/common';
// import { BlockchainClient } from '@blockchain/chain-bridge';
// import { InjectRepository } from '@nestjs/typeorm';
// import { ConvertPoolEntity } from '../repository/convert-pool.entitty';
// import { Repository } from 'typeorm';
// import { GameApiV1ConvertPoolDto } from './dto/game-api-v1.dto';
// import { ConfigService } from '@nestjs/config';
// import { LoggerService } from '@nestjs/common';
// import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
// import {RequestContext} from "../../context/request.context";
// import {TransactionUtil} from "../../util/transacation.util";
//
// @Injectable()
// export class GameApiV1Service {
//   private TxUtil: TransactionUtil = new TransactionUtil(this.configService.get(''), 'http://127.0.0.1:3001', 5000);
//
//   constructor(
//     private configService: ConfigService,
//     @Inject('BLOCKCHAIN_CLIENT')
//     private bc: BlockchainClient,
//     @InjectRepository(ConvertPoolEntity)
//     private readonly usersRepository: Repository<ConvertPoolEntity>,
//     @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService,
//   ) {}
//
//   async createAccount(address: string): Promise<any> {
//     return this.bc.client.account(address);
//   }
//
//   create(createUserDto: GameApiV1ConvertPoolDto): Promise<ConvertPoolEntity> {
//     RequestContext.set('user-id', 'alice');
//     this.logger.log(`create >>>>>>>>>: user-id : ${RequestContext.get('user-id')}`);
//     this.logger.log(`create >>>>>>>>>: ${RequestContext.REQUEST_ID} : ${RequestContext.get(RequestContext.REQUEST_ID)}`);
//     this.logger.log(`create >>>>>>>>>: ${RequestContext.CORRELATION_ID} : ${RequestContext.get(RequestContext.CORRELATION_ID)}`);
//     this.logger.log(`create >>>>>>>>>: ${RequestContext.NAMESPACE} : ${RequestContext.get(RequestContext.NAMESPACE)}`);
//
//
//     // db test
//     const convertPoolEntity = new ConvertPoolEntity();
//     convertPoolEntity.appName = createUserDto.appName;
//     convertPoolEntity.lowerGameCurrency = createUserDto.lowerGameCurrency;
//     convertPoolEntity.gameToken = createUserDto.gameToken;
//     convertPoolEntity.upperGameCurrency = createUserDto.upperGameCurrency;
//     convertPoolEntity.ctx = createUserDto.ctx;
//
//     this.test2();
//     // this.test();
//     // log test
//     try {
//       throw new InternalServerErrorException('test');
//     } catch (e) {
//       this.logger.error('exception: ' + JSON.stringify(convertPoolEntity), e.stack);
//     }
//     this.logger.warn('warn: ' + JSON.stringify(convertPoolEntity));
//     this.logger.log('log: ' + JSON.stringify(convertPoolEntity));
//     this.logger.verbose('verbose: ' + JSON.stringify(convertPoolEntity));
//     this.logger.debug('debug: ' + JSON.stringify(convertPoolEntity));
//
//     return this.usersRepository.save(convertPoolEntity);
//   }
//
//   async test2() {
//
//     await this.TxUtil.restGetTransaction('/v1/request', {})
//     setTimeout(() => {
//       this.logger.log(`>>>>>test2: ${RequestContext.REQUEST_ID} : ${RequestContext.get(RequestContext.REQUEST_ID)}`);
//       this.logger.log(`>>>>>test2: ${RequestContext.CORRELATION_ID} : ${RequestContext.get(RequestContext.CORRELATION_ID)}`);
//       this.logger.log(`>>>>>test2: ${RequestContext.NAMESPACE} : ${RequestContext.currentRequestContext()}`);
//       this.logger.log(`>>>>>test2: ${RequestContext.NAMESPACE} : ${JSON.stringify(RequestContext.currentRequestNamespace())}`);
//
//     }, 2000)
//   }
// }
