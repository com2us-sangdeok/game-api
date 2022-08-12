import { Body, Controller, Get, Headers, Param, Post } from '@nestjs/common';
import { V1MintService } from './v1.mint.service';
import {
  GameApiV1MintDto,
  GameApiV1MintItemDto,
  GameApiV1ResponseMintDto,
  GameApiV1ResponseMintItemDto,
  GameApiV1ResponseValidItemDto,
  GameApiV1ValidItemDto,
} from './dto/game-api-v1-mint.dto';
import { ConvertPoolEntity } from '../../entities/convert-pool.entity';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CommonResponseDto } from '../../commom/dto/common-response.dto';
import { GameApiHttpStatus } from '../../exception/request.exception';
import { RequestContext } from '../../commom/context/request.context';
import { GameApiV1BroadcastDto } from './dto/game-api-v1-broadcast.dto';

@ApiBearerAuth()
@ApiTags('Game API')
@Controller({
  version: '1',
})
export class GameApiV1Controller {
  constructor(private readonly gameApiService: V1MintService) {}

  @Post('/mint/valid-items')
  @ApiOperation({ summary: 'Mint NFT' })
  @ApiResponse({
    status: 200,
    description: '',
    type: GameApiV1ResponseValidItemDto,
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async validateItemsForMinting(
    @Body() gameApiV1ValidItemDto: GameApiV1ValidItemDto,
  ): Promise<CommonResponseDto<GameApiV1ResponseValidItemDto>> {
    const result = await this.gameApiService.validateItemsForMinting(
      gameApiV1ValidItemDto,
    );
    return new CommonResponseDto(GameApiHttpStatus.OK, 'success', result);
  }

  @Post('/mint')
  @ApiOperation({ summary: 'Mint NFT' })
  @ApiResponse({
    status: 200,
    description: '',
    // type: ConvertPoolEntity,
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async mintNft(
    @Body() gameApiV1MintDto: GameApiV1MintDto,
  ): Promise<CommonResponseDto<GameApiV1ResponseMintDto>> {
    const result = await this.gameApiService.mintNft(gameApiV1MintDto);
    return new CommonResponseDto(GameApiHttpStatus.OK, 'success', result);
  }

  // @Post('/mint/character')
  // @ApiOperation({ summary: 'Mint Character NFT' })
  // @ApiResponse({
  //   status: 200,
  //   description: '',
  //   type: ConvertPoolEntity,
  // })
  // @ApiResponse({ status: 403, description: 'Forbidden.' })
  // async mintCharacterNft(): Promise<CommonResponseDto<any>> {
  //   const result = await this.gameApiService.mintCharacterNft();
  //   return new CommonResponseDto(GameApiHttpStatus.OK, 'success', result);
  // }

  @Get('/mint/items')
  @ApiOperation({ summary: 'Item list for minting' })
  @ApiResponse({
    status: 200,
    description: '',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async itemsForMint(
    @Body() gameApiV1MintItemDto: GameApiV1MintItemDto,
  ): Promise<CommonResponseDto<GameApiV1ResponseMintItemDto>> {
    const result = await this.gameApiService.itemsForMint(gameApiV1MintItemDto);
    return new CommonResponseDto(<any>GameApiHttpStatus.OK, 'success', result);
  }

  @Post('/burn')
  @ApiOperation({ summary: 'Burn NFT' })
  @ApiResponse({
    status: 200,
    description: '',
    type: ConvertPoolEntity,
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async burnNft(): Promise<CommonResponseDto<any>> {
    const result = await this.gameApiService.burnNft();
    return new CommonResponseDto(<any>GameApiHttpStatus.OK, 'success', result);
  }

  @Post('/convert')
  @ApiOperation({ summary: 'Convert Game Token and C2X' })
  @ApiResponse({
    status: 200,
    description: '',
    type: ConvertPoolEntity,
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async convert(): Promise<CommonResponseDto<any>> {
    const result = await this.gameApiService.convert();
    return new CommonResponseDto(<any>GameApiHttpStatus.OK, 'success', result);
  }

  @Post('/lock/nft')
  @ApiOperation({ summary: 'Lock NFT' })
  @ApiResponse({
    status: 200,
    description: '',
    type: ConvertPoolEntity,
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async lockNft(): Promise<CommonResponseDto<any>> {
    const result = await this.gameApiService.lockNft();
    return new CommonResponseDto(<any>GameApiHttpStatus.OK, 'success', result);
  }

  @Get('/lock/nft')
  @ApiOperation({ summary: 'Get locked NFT' })
  @ApiResponse({
    status: 200,
    description: '',
    type: ConvertPoolEntity,
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async getLockNft(): Promise<CommonResponseDto<any>> {
    const result = await this.gameApiService.getLockNft();
    return new CommonResponseDto(<any>GameApiHttpStatus.OK, 'success', result);
  }

  @Post('/unlock/nft')
  @ApiOperation({ summary: 'Unlock NFT' })
  @ApiResponse({
    status: 200,
    description: '',
    type: ConvertPoolEntity,
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async unlockNft(): Promise<CommonResponseDto<any>> {
    const result = await this.gameApiService.unlockNft();
    return new CommonResponseDto(<any>GameApiHttpStatus.OK, 'success', result);
  }

  @Get('/unlock/nft')
  @ApiOperation({ summary: 'Get unlocked NFT' })
  @ApiResponse({
    status: 200,
    description: '',
    type: ConvertPoolEntity,
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async getUnlockNft(): Promise<CommonResponseDto<any>> {
    const result = await this.gameApiService.getUnlockNft();
    return new CommonResponseDto(<any>GameApiHttpStatus.OK, 'success', result);
  }

  @Get('/broadcast')
  @ApiOperation({ summary: 'broadcast tx' })
  @ApiResponse({
    status: 200,
    description: '',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async broadcast(
    @Body() gameApiV1BroadcastDto: GameApiV1BroadcastDto,
  ): Promise<CommonResponseDto<any>> {
    const result = await this.gameApiService.broadcast(gameApiV1BroadcastDto);
    return new CommonResponseDto(<any>GameApiHttpStatus.OK, 'success', result);
  }

  // @Get('send-request')
  // sendRequest(@Headers() headers) {
  //   return this.gameApiService.sendRequest();
  // }
  //
  // @Get('get-request')
  // getRequest(@Headers() headers): string {
  //   return headers;
  // }
}
