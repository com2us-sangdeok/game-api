import {
  Injectable,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConvertPoolEntity } from '../repository/convert-pool.entity';
import { Repository } from 'typeorm';
import { GameApiV1MintDto} from './dto/game-api-v1.dto';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { BlockchainService } from '../../core/blockchain/blockchain.service';
import {betagameFeeApi, betagameInfoApi, getMinterKey, updateGameServerForMintingApi} from "./game-api.mock";
import {ExternalServerException} from "../../exception/external-server.exception";
import {LockService} from "../../core/modules/contract/lock.service";
import {GameApiException, GameApiHttpStatus} from "../../exception/request.exception";
import {AxiosClientUtil} from "../../util/axios-client.util";
import {AssetV1Service} from "../../asset/v1/asset-v1.service";
import {CW20Service} from "../../core/modules/contract/cw20.service";
import {CW721Service} from "../../core/modules/contract/cw721.service";
import {GameApiRepository} from "../repository/game-api.repository";
import {SimplePublicKey} from "@terra-money/terra.js";

@Injectable()
export class GameApiV1Service {
    private bcClient = this.blockchainService.blockChainClient().client;
    private lcdClient = this.blockchainService.blockChainClient().client.getLcdClient();

    constructor(
        private configService: ConfigService,
        private readonly blockchainService: BlockchainService,
        @InjectRepository(ConvertPoolEntity)
        private readonly usersRepository: Repository<ConvertPoolEntity>,
        @Inject(WINSTON_MODULE_NEST_PROVIDER)
        private readonly logger: LoggerService,
        private readonly cw20Service: CW20Service,
        private readonly cw721Service: CW721Service,
        private readonly lockService: LockService,
        private axiosClient: AxiosClientUtil,
        private assetV1Service: AssetV1Service,
        private readonly gameApiRepository: GameApiRepository,
    ) {
    }

    async mintNft(gameApiV1MintDto: GameApiV1MintDto) {
        try {
            // todo: call betagame api for api url
            // const betagameInfo = await this.axiosClient.get('/v1/')
            const betagame = betagameInfoApi(gameApiV1MintDto.appId)

            if (betagame.code !== 200) {
                throw ExternalServerException;
            }

            if (gameApiV1MintDto.tokens !== undefined || gameApiV1MintDto.tokens.length > 0) {
                //todo: get address from betagame info
                const lockedNft = await this.lockService.lockNftList('terra1sshdl5qajv0q0k6shlk8m9sd4lplpn6gggfr86', gameApiV1MintDto.accAddress)
                const unmatchedToken = gameApiV1MintDto.tokens.filter(token => !lockedNft.tokens.includes(token.tokenId))
                console.log(lockedNft)
                console.log(unmatchedToken)
                if (unmatchedToken.length > 0) {
                    throw new GameApiException('tokenId mismatch', '', GameApiHttpStatus.BAD_REQUEST)
                }
            }

            // todo: get minter from hsm
            const minter = await getMinterKey();

            // todo: call betagame api for minting fee
            // const betagameInfo = await this.reqBetagame.get('/v1/')
            const betagameFee = betagameFeeApi(gameApiV1MintDto.appId);

            // todo: calculate minting fee
            //      call betagame to get fee info
            let c2xFee: number = 0;
            let tokenFee: number = 0;
            // await gameApiV1MintDto.items.forEach(function (item) {
            // })
            // await gameApiV1MintDto.tokens.forEach(function (item) {
            // })

            // todo: acc
            const userC2xBalance = await this.bcClient.getBalance(gameApiV1MintDto.accAddress);
            if (userC2xBalance < c2xFee) {
                throw new GameApiException('c2x balance is insufficient.', '', GameApiHttpStatus.BAD_REQUEST)
            }

            const userTokenBalance = await this.bcClient.getBalance(gameApiV1MintDto.accAddress);
            if (userTokenBalance < tokenFee) {
                throw new GameApiException('game token balance is insufficient.', '', GameApiHttpStatus.BAD_REQUEST)
            }

            // todo: call game server for updating game info
            // const updatedGameRes = await this.axiosClient.post('',{
            //     gameId: '',
            //     serverId: '',
            //     channelId: '',
            //     characterId: '',
            //     tokenId: '',
            //     itemId: ''
            // })
            const updatedGameRes = updateGameServerForMintingApi({
                gameId: '',
                serverId: '',
                channelId: '',
                characterId: '',
                tokenId: '',
                itemId: ''
            })

            // todo: create a token id
            const tokenId = '';

            if (updatedGameRes.code !== 200) {
                throw new GameApiException('error occurred while updating item status for minting.', '', GameApiHttpStatus.INTERNAL_SERVER_ERROR)
            }

            const uploadAsset = await this.assetV1Service.uploadImageByUrl({url: updatedGameRes.data.imageUrl})


            // C2X
            // todo: create tx
            //  gameProvider, token contract required (if the token contract is the governance token)
            const c2xContractAddress = '';
            const gameProviderAddress = '';
            const gameProviderC2xAmount = String(Math.round(c2xFee * 0.5))
            const gameProviderC2xExe = await this.cw20Service.transferToken(c2xContractAddress, gameApiV1MintDto.accAddress, gameProviderAddress, gameProviderC2xAmount)

            const treasuryAddress = '';
            const treasuryC2xAmount = String(Math.round(c2xFee * 0.16))
            const treasuryC2xExe = await this.cw20Service.transferToken(c2xContractAddress, gameApiV1MintDto.accAddress, treasuryAddress, treasuryC2xAmount)

            const serverAddress = '';
            const serverC2xAmount = String(Math.round(c2xFee * 0.04))
            const serverC2xExe = await this.cw20Service.transferToken(c2xContractAddress, gameApiV1MintDto.accAddress, serverAddress, serverC2xAmount)

            const c2xHolderAddress = '';
            const c2XHolderC2xAmount = String(Math.round(c2xFee * 0.3))
            const c2XHolderC2xExe = await this.cw20Service.transferToken(c2xContractAddress, gameApiV1MintDto.accAddress, c2xHolderAddress, c2XHolderC2xAmount)

            // token
            const tokenContractAddress = '';
            const minterAddress = '';
            const minterTokenAmount = String(Math.round(tokenFee * 0.5))
            const minterTokenExe = await this.cw20Service.transferToken(tokenContractAddress, gameApiV1MintDto.accAddress, minterAddress, minterTokenAmount)

            // const treasuryAddress = '';
            const treasuryTokenAmount = String(Math.round(tokenFee * 0.16))
            const treasuryTokenExe = await this.cw20Service.transferToken(tokenContractAddress, gameApiV1MintDto.accAddress, treasuryAddress, treasuryTokenAmount)

            // const serverAddress = '';
            const serverTokenAmount = String(Math.round(tokenFee * 0.04))
            const serverTokenExe = await this.cw20Service.transferToken(tokenContractAddress, gameApiV1MintDto.accAddress, serverAddress, serverTokenAmount)

            const fanHolderAddress = '';
            const fanHolderAmount = String(Math.round(tokenFee * 0.3))
            const fanHolderTokenExe = await this.cw20Service.transferToken(tokenContractAddress, gameApiV1MintDto.accAddress, fanHolderAddress, fanHolderAmount)

            // todo  set tokenId, tokenUrl, extension
            const nftContractAddress = '';
            const mintingExe = await this.cw721Service.mint(minterAddress, nftContractAddress, gameApiV1MintDto.accAddress, tokenId, '', {})

            // todo set memo
            const memo = String(tokenId) + '-' + 'appName' + '-nft';

            const user = await this.gameApiRepository.getSequence(minterAddress)

            // todo: user seq, public key
            const userSequenceNumber = 0;
            const userPublickey = '';
            const simulateFee = await this.lcdClient.tx.estimateFee(
                [
                    {sequenceNumber: userSequenceNumber, publicKey: new SimplePublicKey(userPublickey)},
                    {sequenceNumber: user.sequenceNumber, publicKey: minter.publicKey}
                ],{
                    msgs: [
                        gameProviderC2xExe, treasuryC2xExe, serverC2xExe, c2XHolderC2xExe,
                        minterTokenExe, treasuryTokenExe, serverTokenExe, fanHolderTokenExe,
                        mintingExe
                    ],
                    memo: memo,
                    gasAdjustment: 1.3,
                }
            )
            simulateFee.payer = '';


        } catch (e) {
            throw e;
        }
    }

    async mintCharacterNft() {
        const response = await this.axiosClient.get('https://www.naver.com/')
        console.log('asdfa : ', response)
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

    async sendRequest() {
        // const response = await this.requestClient.get('http://localhost:3001/v1/get-request')
        const response = await this.axiosClient.post('http://localhost:3001/v1/post-request')
        return response


    }
}
