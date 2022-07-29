import {
  Injectable,
  Inject,
  InternalServerErrorException,
} from '@nestjs/common';
import { BlockchainClient } from '@blockchain/chain-bridge';
import { InjectRepository } from '@nestjs/typeorm';
import { ConvertPoolEntity } from '../repository/convert-pool.entitty';
import { Repository } from 'typeorm';
import { GameApiV1ConvertPoolDto } from './dto/game-api-v1.dto';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { TransactionUtil } from '../../util/transacation.util';
import { BlockchainService } from '../../core/blockchain/blockchain.service';

@Injectable()
export class GameApiV1Service {
    private TxUtil: TransactionUtil = new TransactionUtil(
        this.configService.get('SERVICE_USERAGENT'),
        this.configService.get('SERVICE_URL'),
        parseInt(this.configService.get('SERVICE_TIMEOUT')),
    );

    private lcd = this.blockchainService.lcdClient();
    private bc = this.blockchainService.blockChainClient();

    constructor(
        private configService: ConfigService,
        private readonly blockchainService: BlockchainService,
        @InjectRepository(ConvertPoolEntity)
        private readonly usersRepository: Repository<ConvertPoolEntity>,
        @Inject(WINSTON_MODULE_NEST_PROVIDER)
        private readonly logger: LoggerService,
    ) {}

    async mintNft() {

    }

    async mintCharacterNft() {

    }

    async burnNft() {

    }

    async convert() {

    }

    async lockNft() {

    }

    async getLockNft() {

    }

    async unlockNft() {

    }

    async getUnlockNft() {

    }
}
