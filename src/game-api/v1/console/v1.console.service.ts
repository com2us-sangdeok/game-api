import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {QueryRunner, Repository, Table} from 'typeorm';
import {
  GameApiV1CalculateMintingFeeDto,
  GameApiV1MintDto,
  GameApiV1MintItemDto,
  GameApiV1ResponseMintDto,
  GameApiV1ResponseMintItemDto,
  GameApiV1ResponseValidItemDto,
  GameApiV1ValidItemDto,
} from '../dto/game-api-v1-mint.dto';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { BlockchainService } from '../../../bc-core/blockchain/blockchain.service';
import {
  betagameInfoApi,
  gameItemsForMint,
  getMinterKey,
  updateGameServerForMintingApi,
  validateItemFromGameServer,
} from '../game-api.mock';
import { ExternalServerException } from '../../../exception/external-server.exception';
import { LockService } from '../../../bc-core/modules/contract/lock.service';
import {
  GameApiException,
  GameApiHttpStatus,
} from '../../../exception/request.exception';
import { AxiosClientUtil } from '../../../util/axios-client.util';
import { AssetV1Service } from '../../../asset-api/v1/asset-v1.service';
import { CW20Service } from '../../../bc-core/modules/contract/cw20.service';
import { CW721Service } from '../../../bc-core/modules/contract/cw721.service';
import { MintRepository } from '../repository/mint.repository';
import { Fee, SimplePublicKey } from '@xpla/xpla.js';
import { CommonService } from '../../../bc-core/modules/common.service';
import {
  ConvertPoolEntity,
  NonFungibleTokenEntity,
  TransactionEntity,
  MintLogEntity,
} from '../../../entities';
import { getNamespace } from 'cls-hooked';
import { RequestContext } from '../../../commom/context/request.context';
import { compareObject } from '../../../util/common.util';
import { GameApiV1BroadcastDto } from '../dto/game-api-v1-broadcast.dto';
import { Tx as Tx_pb } from '@terra-money/terra.proto/cosmos/tx/v1beta1/tx';
import { Tx } from '@xpla/xpla.js/dist/core';
import { SequenceUtil } from '../../../util/sequence.util';
import {MetadataV1Service} from "../../../metadata-api/v1/metadata-v1.service";
import {MintException, MintHttpStatus} from "../../../exception/mint.exception";
import {ConsoleRepository} from "../repository/console.repository";
// import {MintException, MintHttpStatus} from "../../exception/mint.exception";
// import {MetadataV1Service} from "../../metadata-api/v1/metadata-v1.service";


@Injectable()
export class V1ConsoleService {

  constructor(
    private configService: ConfigService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
    private readonly repo: ConsoleRepository,
    private sequenceUtil: SequenceUtil,
  ) {}



  async burnNft() {}

  async create() {
    return await this.repo.create();
  }


}
