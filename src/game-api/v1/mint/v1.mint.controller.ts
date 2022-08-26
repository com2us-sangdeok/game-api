import { Body, Controller, Get, Headers, Param, Post } from '@nestjs/common';
import { V1MintService } from './v1.mint.service';
import {
  GameApiV1MintDto,
  GameApiV1MintItemDto, GameApiV1ResMintItemDto,
  GameApiV1ResponseMintDto,
  GameApiV1ResponseMintItemDto,
  GameApiV1ResponseValidItemDto,
  GameApiV1ValidItemDto,
} from '../dto/game-api-v1-mint.dto';
import { ConvertPoolEntity } from '../../../entities';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CommonResponseDto } from '../../../commom/dto/common-response.dto';
import { GameApiHttpStatus } from '../../../exception/request.exception';
import { GameApiV1BroadcastDto } from '../dto/game-api-v1-broadcast.dto';

@ApiBearerAuth()
@ApiTags('Game API')
@Controller({
  version: '1',
})
export class V1MintController {
  constructor(private readonly gameApiService: V1MintService) {}

  @Post('/mint/confirm')
  @ApiOperation({ summary: 'Mint NFT' })
  @ApiResponse({
    status: 200,
    description: '',
    type: GameApiV1ResponseValidItemDto,
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async confirmItems(
    @Body() gameApiV1ValidItemDto: GameApiV1ValidItemDto,
  ): Promise<CommonResponseDto<GameApiV1ResponseValidItemDto>> {
    const result = await this.gameApiService.confirmItems(
      gameApiV1ValidItemDto,
    );
    return new CommonResponseDto(GameApiHttpStatus.OK, 'success', result);
  }

  @Post('/mint')
  @ApiOperation({ summary: 'Mint NFT' })
  @ApiResponse({
    status: 200,
    description: '',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async mintNft(
    @Body() gameApiV1MintDto: GameApiV1MintDto,
  ): Promise<CommonResponseDto<GameApiV1ResponseMintDto>> {
    const result = await this.gameApiService.mintNft(gameApiV1MintDto);
    return new CommonResponseDto(GameApiHttpStatus.OK, 'success', result);
  }

  @Post('/mint/item-list')
  @ApiOperation({ summary: 'Item list for minting' })
  @ApiResponse({
    status: 200,
    description: '',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async items(
    @Body() gameApiV1MintItemDto: GameApiV1MintItemDto,
  ): Promise<CommonResponseDto<GameApiV1ResMintItemDto>> {
    const result = await this.gameApiService.items(gameApiV1MintItemDto);
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
}
