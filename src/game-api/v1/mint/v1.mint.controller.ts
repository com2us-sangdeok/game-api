import { Body, Controller, Get, Post } from '@nestjs/common';
import { V1MintService } from './v1.mint.service';
import {
  GameApiV1BurnItemDto, GameApiV1BurnItemResDto,
  GameApiV1MintDto,
  GameApiV1MintItemDto, GameApiV1ResMintItemDto,
  GameApiV1ResponseMintDto,
  GameApiV1ResponseValidItemDto,
  GameApiV1ValidItemDto, TestDto,
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
    type: GameApiV1ResponseMintDto
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
    type: GameApiV1ResMintItemDto
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
    type: GameApiV1BurnItemResDto,
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async burnNft(
    @Body() gameApiV1BurnItemDto: GameApiV1BurnItemDto,
  ): Promise<CommonResponseDto<GameApiV1BurnItemResDto>> {
    const result = await this.gameApiService.burnNft(gameApiV1BurnItemDto);
    return new CommonResponseDto(<any>GameApiHttpStatus.OK, 'success', result);
  }

  @Post('/test/sign')
  @ApiOperation({ summary: 'sign & broadcast test' })
  @ApiResponse({
    status: 200,
    description: '',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async testNft(
      @Body() testDto: TestDto,
  ): Promise<CommonResponseDto<string>> {
    const result = await this.gameApiService.testNft(testDto);
    return new CommonResponseDto(<any>GameApiHttpStatus.OK, 'success', result);
  }
}
