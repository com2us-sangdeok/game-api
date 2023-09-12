import { Body, Controller, Get, Post } from '@nestjs/common';
// import { GameApiV1Service } from './game-api-v2.service';
import {
  ConvertConfirmDto,
  CharacterDto,
  CategoryDto,
  MintingConfirmDto,
  ServerDto,
  GoodsUpdateDto,
  CharacterMintingConfirmDto,
  NftItemStatusUpdateDto,
  NftCharacterStatusUpdateDto,
} from './dto/game-api-v2.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  categoryMintType,
  GameCharacter,
  GameGoods,
  GameServer,
  mintingCharacter,
  mintingItem,
  mintingItemInfo,
  nftStatus,
  response,
} from '../../entities/game-server-v2.entitty';

@ApiBearerAuth()
@ApiTags('sample Game v2 API')
@Controller({
  version: '2',
})
export class GameApiV2Controller {
  constructor() {} // private readonly gameApiService: GameApiV2Service

  @Get('/servers')
  @ApiOperation({ summary: 'get game server lists.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({
    status: 200,
    description: '',
    type: GameServer,
  })
  servers(): response {
    const servers: GameServer[] = [];
    servers.push(
      {
        serverName: '서버1',
        serverId: '1',
        channels: [
          {
            channelName: '채널1',
            channelId: '1',
            channels: [
              { channelName: '채널1-1', channelId: '1' },
              { channelName: '채널1-2', channelId: '2' },
            ],
          },
          { channelName: '채널2', channelId: '2' },
        ],
      },
      { serverName: '서버2', serverId: '2' },
      { serverName: '서버3', serverId: '3' },
    );
    return { code: 200, message: 'success', data: { servers: servers } };
  }

  @Post('/users/characters')
  @ApiOperation({ summary: 'get user character lists.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({
    status: 200,
    description: '',
    type: GameCharacter,
  })
  characters(@Body() request: ServerDto): response {
    const characters: GameCharacter[] = [];

    characters.push(
      { characterName: '닉네임1', characterId: '1' },
      { characterName: '닉네임2', characterId: '2' },
    );

    return {
      code: 200,
      message: 'success',
      data: { characters: characters },
    };
  }

  @Post('/users/goods')
  @ApiOperation({ summary: 'get user retained goods' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({
    status: 200,
    description: '',
    type: GameGoods,
  })
  goods(@Body() reqeust: CharacterDto): response {
    const goods: GameGoods[] = [];

    goods.push(
      {
        goodsCode: 'goldcode',
        goodsName: 'gold',
        quantity: 100,
      },
      {
        goodsCode: 'crystalcode',
        goodsName: 'crystal',
        quantity: 100,
      },
    );

    return {
      code: 200,
      message: 'success',
      data: { goods: goods },
    };
  }

  @Post('/users/items')
  @ApiOperation({ summary: 'get user items' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({
    status: 200,
    description: '',
    type: mintingItemInfo,
  })
  mintingCategoryItems(@Body() request: CategoryDto): response {
    const items: mintingItem[] = [];
    let character: mintingCharacter = {
      characterName: null,
      characterId: null,
      nftStatus: null,
    };

    let response_data = {};

    // ServerCharacterDto.categoryId 또는 ServerCharacterDto.categoryType 으로 구분하여 요청을 판단하여 응답.
    switch (request.categoryType) {
      // 단일 민팅
      case categoryMintType.minting:
        items.push(
          {
            itemName: 'sword1',
            itemDescription: 'sword1 description',
            itemCode: 'itemUniqCode1',
            nftStatus: nftStatus.nonNFT,
            tokenId: null,
          },
          {
            itemName: 'sword2',
            itemDescription: 'sword1 description',
            itemCode: 'itemUniqCode2',
            nftStatus: nftStatus.unLockedNFT,
            tokenId: 'tokenId',
          },
        );

        response_data = { items: items };

        break;
      // 조합 민팅
      case categoryMintType.mixMintig:
        items.push(
          {
            itemName: 'sword1',
            itemDescription: 'sword1 description',
            itemCode: 'itemUniqCode1',
            nftStatus: nftStatus.nonNFT,
            breedCount: 0,
            tokenId: null,
          },
          {
            itemName: 'sword2',
            itemDescription: 'sword2 description',
            itemCode: 'itemUniqCode2',
            nftStatus: nftStatus.unLockedNFT,
            breedCount: 4,
            tokenId: 'tokenId',
          },
          {
            itemName: 'sword3',
            itemDescription: 'sword3 description',
            itemCode: 'itemUniqCode3',
            nftStatus: nftStatus.LockedNFT,
            breedCount: 2,
            tokenId: 'tokenId',
          },
        );

        response_data = { items: items };

        break;
      // 케릭터 민팅
      case categoryMintType.CharacterMinting:
        character = {
          characterId: '1',
          characterName: 'NickName',
          nftStatus: nftStatus.nonNFT,
          tokenId: null,
        };

        response_data = { character: character };

        break;
    }

    return {
      code: 200,
      message: 'success',
      data: response_data,
    };
  }

  @Post('/users/convert/confirm')
  @ApiOperation({ summary: 'confirm user goods convert' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({
    status: 200,
    description: '',
    type: response,
  })
  convertConfirm(@Body() request: ConvertConfirmDto) {
    return {
      code: 200,
      message: 'success',
    };
  }

  @Post('/users/minting/item/confirm')
  @ApiOperation({ summary: 'confirm user item minting' })
  mintingConfirm(@Body() reqeust: MintingConfirmDto) {
    return {
      code: 200,
      message: 'success',
    };
  }

  @Post('/users/minting/character/confirm')
  @ApiOperation({ summary: 'confirm user character minting' })
  characterMintingConfirm(@Body() reqeust: CharacterMintingConfirmDto) {
    return {
      code: 200,
      message: 'success',
    };
  }

  @Post('/users/convert/goods')
  @ApiOperation({ summary: 'user goods update' })
  goodsUpdate(@Body() reqeust: GoodsUpdateDto) {
    return {
      code: 200,
      message: 'success',
    };
  }

  @Post('/users/item/lock')
  @ApiOperation({ summary: 'user item lock/unlock' })
  nftItemLock(@Body() reqeust: NftItemStatusUpdateDto) {
    return {
      code: 200,
      message: 'success',
    };
  }

  @Post('/users/item/unlock')
  @ApiOperation({ summary: 'user item lock/unlock' })
  nftItemUnlock(@Body() reqeust: NftItemStatusUpdateDto) {
    return {
      code: 200,
      message: 'success',
    };
  }

  @Post('/users/character/lock')
  @ApiOperation({ summary: 'user character lock' })
  nftCharacterLock(@Body() reqeust: NftCharacterStatusUpdateDto) {
    return {
      code: 200,
      message: 'success',
    };
  }

  @Post('/users/character/unlock')
  @ApiOperation({ summary: 'user character lock' })
  nftCharacterUnlock(@Body() reqeust: NftCharacterStatusUpdateDto) {
    return {
      code: 200,
      message: 'success',
    };
  }
}
