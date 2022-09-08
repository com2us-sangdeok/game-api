import {Body, Controller, Get, Headers, Post, Query} from '@nestjs/common';
import { V1MintService } from './v1.mint.service';
import {
  GameApiV1BurnItemReqDto,
  GameApiV1BurnItemResDto,
  GameApiV1MintDto,
  GameApiV1MintItemDto,
  GameApiV1ResMintItemDto,
  GameApiV1ResponseMintDto,
  GameApiV1ResponseValidItemDto,
  GameApiV1ValidItemDto,
  headerParams,
  TestDto,
} from '../dto/game-api-v1-mint.dto';
import {
  ApiBearerAuth,
  ApiHeaders,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CommonResponseDto } from '../../../commom/dto/common-response.dto';
import {GameApiHttpStatus} from '../../../exception/request.exception';

@ApiBearerAuth()
@ApiTags('Game API')
@Controller({
  version: '1',
})
export class V1MintController {
  constructor(private readonly gameApiService: V1MintService) {}

  @Post('/mint/confirm')
  @ApiHeaders(headerParams)
  @ApiOperation({ summary: 'Mint NFT' })
  @ApiResponse({
    status: 200,
    description: '',
    type: GameApiV1ResponseValidItemDto,
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async confirmItems(
    @Headers() headers,
    @Body() gameApiV1ValidItemDto: GameApiV1ValidItemDto,
  ): Promise<CommonResponseDto<GameApiV1ResponseValidItemDto>> {
    const requestDto = {
      appId: headers['appid'],
      server: headers['server'].split(','),
      playerId: headers['pid'],
      ...gameApiV1ValidItemDto,
    };
    const result = await this.gameApiService.confirmItems(
      requestDto
    );
    return new CommonResponseDto(GameApiHttpStatus.OK, 'success', result);
  }

  @Post('/mint')
  @ApiHeaders(headerParams)
  @ApiOperation({ summary: 'Mint NFT' })
  @ApiResponse({
    status: 200,
    description: '',
    type: GameApiV1ResponseMintDto,
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async mintNft(
      @Headers() headers,
    @Body() gameApiV1MintDto: GameApiV1MintDto,
  ): Promise<CommonResponseDto<GameApiV1ResponseMintDto>> {
    const requestDto = {
      appId: headers['appid'],
      server: headers['server'].split(','),
      playerId: headers['pid'],
      ...gameApiV1MintDto,
    };
    const result = await this.gameApiService.mintNft(requestDto);
    return new CommonResponseDto(GameApiHttpStatus.OK, 'success', result);
  }

  @Get('/mint/items')
  @ApiHeaders(headerParams)
  @ApiQuery({
    name: 'characterId',
    example: 'hulk',
    required: false,
  })
  @ApiQuery({
    name: 'categoryName',
    example: 'Inventory',
    required: false,
  })
  @ApiQuery({
    name: 'categoryType',
    example: 1,
    required: false,
  })
  @ApiOperation({ summary: 'Item list for minting' })
  @ApiResponse({
    status: 200,
    description: '',
    type: GameApiV1ResMintItemDto,
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async items(
    // @Body() gameApiV1MintItemDto: GameApiV1MintItemDto,
    @Headers() headers,
    @Query('mintType') mintType: string,
    @Query('characterId') characterId: string,
    @Query('categoryId') categoryId: string,
    @Query('categoryName') categoryName: string,
    @Query('categoryType') categoryType: string,
  ): Promise<CommonResponseDto<GameApiV1ResMintItemDto>> {
    const requestDto = {
      appId: headers['appid'],
      server: headers['server'].split(','),
      playerId: headers['pid'],
      ...<GameApiV1MintItemDto>{
        mintType: mintType,
        characterId: characterId,
        categoryId: Number(categoryId),
        categoryName: categoryName,
        categoryType: Number(categoryType),
      },
    };

    const result = await this.gameApiService.items(requestDto);
    return new CommonResponseDto(<any>GameApiHttpStatus.OK, 'success', result);
  }

  @Post('/burn')
  @ApiHeaders(headerParams)
  @ApiOperation({ summary: 'Burn NFT' })
  @ApiResponse({
    status: 200,
    description: '',
    type: GameApiV1BurnItemResDto,
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async burnNft(
    @Headers() headers,
    @Body() gameApiV1BurnItemReqDto: GameApiV1BurnItemReqDto,
  ): Promise<CommonResponseDto<GameApiV1BurnItemResDto>> {
    const requestDto = {
      appId: headers['appid'],
      server: headers['server'].split(','),
      playerId: headers['pid'],
      ...gameApiV1BurnItemReqDto,
    };
    const result = await this.gameApiService.burnNft(requestDto);
    return new CommonResponseDto(<any>GameApiHttpStatus.OK, 'success', result);
  }

  @Post('/test/sign')
  @ApiOperation({ summary: 'sign & broadcast test' })
  @ApiResponse({
    status: 200,
    description: '',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async testNft(@Body() testDto: TestDto): Promise<CommonResponseDto<string>> {
    const result = await this.gameApiService.testNft(testDto);
    return new CommonResponseDto(<any>GameApiHttpStatus.OK, 'success', result);
  }

  @Post('/test/send')
  @ApiOperation({ summary: 'sign & broadcast test' })
  @ApiResponse({
    status: 200,
    description: '',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async testTransfer(): // @Body() testDto: TestDto,
  Promise<CommonResponseDto<string>> {
    const result = await this.gameApiService.testTransfer();
    return new CommonResponseDto(<any>GameApiHttpStatus.OK, 'success', result);
  }
}
