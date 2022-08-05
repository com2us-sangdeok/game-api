import {Body, Controller, Get, Headers, Param, Post} from '@nestjs/common';
import { GameApiV1Service } from './game-api-v1.service';
import {GameApiV1ConvertPoolDto, GameApiV1MintDto} from './dto/game-api-v1.dto';
import { ConvertPoolEntity } from '../repository/convert-pool.entity';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import {CommonResponseDto} from "../../commom/dto/common-response.dto";
import {GameApiHttpStatus} from "../../exception/request.exception";
import {ExtensionDto} from "../../metadata/v1/dto/metadata-v1.dto";

@ApiBearerAuth()
@ApiTags('Game API')
@Controller({
    version: '1',
})
export class GameApiV1Controller {
    constructor(private readonly gameApiService: GameApiV1Service) {}

    @Post('/mint')
    @ApiOperation({ summary: 'Mint NFT' })
    @ApiResponse({
        status: 200,
        description: '',
        type: ConvertPoolEntity,
    })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    async mintNft(
        @Body() gameApiV1MintDto: GameApiV1MintDto,
    ): Promise<CommonResponseDto<any>> {
        const result = await this.gameApiService.mintNft(gameApiV1MintDto);
        return new CommonResponseDto(<any>
            GameApiHttpStatus.OK,
            'success',
            result
        )
    }

    @Post('/mint/character')
    @ApiOperation({ summary: 'Mint Character NFT' })
    @ApiResponse({
        status: 200,
        description: '',
        type: ConvertPoolEntity,
    })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    async mintCharacterNft(
    ): Promise<CommonResponseDto<any>> {
        const result = await this.gameApiService.mintCharacterNft();
        return new CommonResponseDto(<any>
                GameApiHttpStatus.OK,
            'success',
            result
        )
    }

    @Post('/burn')
    @ApiOperation({ summary: 'Burn NFT' })
    @ApiResponse({
        status: 200,
        description: '',
        type: ConvertPoolEntity,
    })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    async burnNft(
    ): Promise<CommonResponseDto<any>> {
        const result = await this.gameApiService.burnNft();
        return new CommonResponseDto(<any>
                GameApiHttpStatus.OK,
            'success',
            result
        )
    }

    @Post('/convert')
    @ApiOperation({ summary: 'Convert Game Token and C2X' })
    @ApiResponse({
        status: 200,
        description: '',
        type: ConvertPoolEntity,
    })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    async convert(
    ): Promise<CommonResponseDto<any>> {
        const result = await this.gameApiService.convert();
        return new CommonResponseDto(<any>
                GameApiHttpStatus.OK,
            'success',
            result
        )
    }

    @Post('/lock/nft')
    @ApiOperation({ summary: 'Lock NFT' })
    @ApiResponse({
        status: 200,
        description: '',
        type: ConvertPoolEntity,
    })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    async lockNft(
    ): Promise<CommonResponseDto<any>> {
        const result = await this.gameApiService.lockNft();
        return new CommonResponseDto(<any>
                GameApiHttpStatus.OK,
            'success',
            result
        )
    }

    @Get('/lock/nft')
    @ApiOperation({ summary: 'Get locked NFT' })
    @ApiResponse({
        status: 200,
        description: '',
        type: ConvertPoolEntity,
    })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    async getLockNft(
    ): Promise<CommonResponseDto<any>> {
        const result = await this.gameApiService.getLockNft();
        return new CommonResponseDto(<any>
                GameApiHttpStatus.OK,
            'success',
            result
        )
    }

    @Post('/unlock/nft')
    @ApiOperation({ summary: 'Unlock NFT' })
    @ApiResponse({
        status: 200,
        description: '',
        type: ConvertPoolEntity,
    })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    async unlockNft(
    ): Promise<CommonResponseDto<any>> {
        const result = await this.gameApiService.unlockNft();
        return new CommonResponseDto(<any>
                GameApiHttpStatus.OK,
            'success',
            result
        )
    }

    @Get('/unlock/nft')
    @ApiOperation({ summary: 'Get unlocked NFT' })
    @ApiResponse({
        status: 200,
        description: '',
        type: ConvertPoolEntity,
    })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    async getUnlockNft(
    ): Promise<CommonResponseDto<any>> {
        const result = await this.gameApiService.getUnlockNft();
        return new CommonResponseDto(<any>
                GameApiHttpStatus.OK,
            'success',
            result
        )
    }

    @Get('send-request')
    sendRequest(@Headers() headers) {
        return this.gameApiService.sendRequest()
    }

    @Get('get-request')
    getRequest(@Headers() headers): string {
        return headers
    }
}
