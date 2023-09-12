import {
  Body,
  Controller,
  Get,
  Headers,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { GameApiException, GameApiHttpStatus } from '../../exception/exception';
import {
  GameGoodsReqDto,
  MintConfirmReqDto,
  MintFinishedReqDto,
  MintReqDto,
} from './dto/game-api-v1.req.dto';
import {
  GameCharacterResDto,
  GameGoodsResDto,
  GameServerChannelResDto,
  GameServerResDto,
  MintDataResDto,
  MintResDto,
} from './dto/game-api-v1.res.dto';
import { CommonResponseDto } from '../../commom/dto/common-response.dto';
import {
  ApiBearerAuth,
  ApiHeaders,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { categoryMintType, nftStatus } from '../../enum/common.enum';

@ApiBearerAuth()
@ApiTags('Sample Game API')
// todo: appid는 모든 게임서버 API 기본 요청값? -> api 요청 시 게임 서버의 URL이 이미 고정되어 있음으로 게임서버에서는 appid를 전달 받지 않아도 무방 할 것 같으나, appid가 국가또는 플렛폼 정보를 포함하고 있기 때문에 게임에서 별도로 구분하여 분기 처리를 하고자 한다면 필수값이 될 것같습니다.
@ApiHeaders([
  {
    name: 'appid',
    description: 'App ID (ex. com.com2us.c2xwallet.global.normal)',
    example: 'com.com2us.c2xwallet.global.normal',
  },
])
@Controller({
  version: '2',
})
export class GameApiV1Controller {
  constructor() {} // private readonly gameApiService: GameApiV2Service

  @Get('/game/servers')
  @ApiOperation({ summary: '게임 서버 정보 조회' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({
    status: 200,
    description: '게임 서버 목록 조회',
    type: GameServerResDto,
  })
  async findServers(@Headers() headers): Promise<CommonResponseDto<any>> {
    const appid = headers['appid'] ?? false;
    if (!appid) {
      throw new GameApiException(
        'no appid requested',
        '',
        GameApiHttpStatus.BAD_REQUEST,
      );
    }
    const servers: GameServerResDto[] = [];

    servers.push(<GameServerResDto>{
      serverId: '1',
      serverName: '서버1',
      channels: [
        <GameServerChannelResDto>{
          channelName: '채널1',
          channelId: '1',
          channels: [
            <GameServerChannelResDto>{
              channelName: '채널1-1',
              channelId: '1',
            },
            <GameServerChannelResDto>{
              channelName: '채널1-2',
              channelId: '2',
            },
          ],
        },
        { channelName: '채널2', channelId: '2' },
      ],
    });

    servers.push(<GameServerResDto>{
      serverId: '2',
      serverName: '서버2',
    });

    servers.push(<GameServerResDto>{
      serverId: '3',
      serverName: '서버3',
    });

    // 응답 정보 구성
    return new CommonResponseDto<any>(GameApiHttpStatus.OK, 'success', servers);
  }

  @Get('/convert/goods')
  @ApiHeaders([
    {
      name: 'pid',
      description: 'Player ID',
    },
  ])
  @ApiQuery({
    name: 'server',
    example: '1,1,1',
    required: true,
  })
  @ApiQuery({
    name: 'characterId',
    example: 'hulk',
    required: false,
  })
  @ApiOperation({ summary: '게임재화 수량 정보 조회' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({
    status: 200,
    description: '',
    type: GameGoodsResDto,
  })
  async findGoods(
    @Headers() headers,
    @Query('server') server: string,
    @Query('characterId') characterId: string,
  ): Promise<CommonResponseDto<any>> {
    console.log('headers: ', headers);
    console.log('server: ', server);
    console.log('characterId: ', characterId);
    const goods: GameGoodsResDto[] = [];

    goods.push(
      <GameGoodsResDto>{
        goodsCode: 'goldcode',
        goodsName: 'gold',
        amount: 2000,
        avalibleAmount: 10000,
      },
      <GameGoodsResDto>{
        goodsCode: 'crystalcode',
        goodsName: 'crystal',
        amount: 2000,
        avalibleAmount: 100000,
      },
    );

    // 응답 정보 구성
    return new CommonResponseDto<any>(GameApiHttpStatus.OK, 'success', goods);
  }

  @Get('/convert/confirm')
  @ApiHeaders([
    {
      name: 'pid',
      description: 'Player ID',
    },
  ])
  @ApiQuery({
    name: 'server',
    example: '1,1,1',
    required: true,
  })
  @ApiQuery({
    name: 'characterId',
    example: 'hulk',
    required: false,
  })
  @ApiOperation({ summary: '유저의 재화가 convert 가능한 상태인지 확인' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({
    status: 200,
    description: '',
    type: CommonResponseDto,
  })
  async convertConfirm(
    @Headers() headers,
    @Query('server') server: string,
    @Query('characterId') characterId: string,
    @Query('type') type: string, // 교환 타입
    @Query('goodsCode') goodsCode: string, // 재화 구분
    @Query('goodsAmount') goodsAmount: string,
    @Query('tokenId') tokenId: string, // 토큰 구분
    @Query('tokenAmount') tokenAmount: string,
  ): Promise<CommonResponseDto<any>> {
    console.log('headers: ', headers);
    console.log('server: ', server);
    console.log('characterId: ', characterId);
    console.log('type: ', type);
    console.log('goodsCode: ', goodsCode);
    console.log('goodsAmount: ', goodsAmount);
    console.log('tokenId: ', tokenId);
    console.log('tokenAmount: ', tokenAmount);
    // 응답 정보 구성
    return new CommonResponseDto<any>(GameApiHttpStatus.OK, 'success');
  }

  @Patch('/convert')
  @ApiHeaders([
    {
      name: 'pid',
      description: 'Player ID',
    },
  ])
  @ApiOperation({ summary: '유저 재화 변경' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({
    status: 200,
    description: '',
    type: GameGoodsResDto,
  })
  async updateGoods(
    @Headers() headers,
    @Body() request: GameGoodsReqDto,
  ): Promise<CommonResponseDto<any>> {
    console.log('headers: ', headers);
    console.log('body: ', request);
    // 차감 후 변화 금액
    const goods: GameGoodsResDto = <GameGoodsResDto>{
      goodsCode: 'goldcode',
      goodsName: 'gold',
      amount: 100,
    };
    // 응답 정보 구성
    return new CommonResponseDto<any>(GameApiHttpStatus.OK, 'success', goods);
  }

  @Get('/mint/characters')
  @ApiHeaders([
    {
      name: 'pid',
      description: 'Player ID (ex. 1234, 5678)',
    },
  ])
  @ApiQuery({
    name: 'server',
    example: '1,1,1',
    required: true,
  })
  @ApiOperation({ summary: '캐릭터 목록 조회' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({
    status: 200,
    description: '',
    type: GameCharacterResDto,
  })
  async findCharacters(
    @Headers() headers,
    @Query('server') server: string,
  ): Promise<CommonResponseDto<any>> {
    console.log('headers: ', headers);
    console.log('server: ', server);
    const characters: GameCharacterResDto[] = [];
    const pid = headers['pid'] ?? false;
    if (!pid) {
      throw new GameApiException(
        'no pid requested',
        '',
        GameApiHttpStatus.BAD_REQUEST,
      );
    }

    if (pid === '1234') {
      characters.push(
        <GameCharacterResDto>{
          characterName: '캐릭터명(닉네임)1',
          characterId: '1234-1',
        },
        <GameCharacterResDto>{
          characterName: '캐릭터명(닉네임)2',
          characterId: '1234-2',
        },
      );
    } else if (pid === '5678') {
      characters.push(
        <GameCharacterResDto>{
          characterName: '캐릭터명(닉네임)1',
          characterId: '5678-1',
        },
        <GameCharacterResDto>{
          characterName: '캐릭터명(닉네임)2',
          characterId: '5678-2',
        },
      );
    }

    // 응답 정보 구성
    return new CommonResponseDto<any>(
      GameApiHttpStatus.OK,
      'success',
      characters,
    );
  }

  @Get('/mint/items')
  @ApiHeaders([
    {
      name: 'pid',
      description: 'Player ID (ex. 1234, 5678)',
    },
    {
      name: 'minttype',
      description: 'Player ID (ex. item, items)',
    },
  ])
  @ApiQuery({
    name: 'server',
    example: '1,1,1',
    required: true,
  })
  @ApiQuery({
    name: 'characterId',
    example: 'hulk',
    required: false,
  })
  @ApiQuery({
    name: 'categoryId',
    example: 1,
    required: true,
  })
  @ApiOperation({
    summary: '카테고리별 민팅 가능 목록 조회',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({
    status: 200,
    description: '',
    type: MintResDto,
  })
  async findItemForMint(
    @Headers() headers,
    @Query('server') server: string,
    @Query('characterId') characterId: string,
    @Query('categoryId') categoryId: string,
    // todo: categoryType 필요? -> 필수는 아니나 되도록 게임서버 쪽에 가능한 많은 정보를 주는 것이 좋을 것 같아서 추가 하였습니다.
  ): Promise<CommonResponseDto<any>> {
    console.log('headers: ', headers);
    console.log('server: ', server);
    console.log('characterId: ', characterId);
    console.log('categoryId: ', categoryId);
    const result = [];

    if (headers['minttype'] === '1001000701') {
      result.push(
        <MintResDto>{
          name: 'sword1',
          description: 'sword1 description',
          uniqueId: 'itemUniqCode1',
          nftStatus: nftStatus.nonNFT,
          tokenId: null,
        },
        <MintResDto>{
          name: 'sword2',
          description: 'sword1 description',
          uniqueId: 'itemUniqCode2',
          nftStatus: nftStatus.unLockedNFT,
          tokenId: 'sword2',
        },
      );
    } else if (headers['minttype'] === '1001000702') {
      result.push(
        <MintResDto>{
          name: 'sword1-mix',
          description: 'sword1 description',
          uniqueId: 'itemUniqCode1',
          nftStatus: nftStatus.nonNFT,
          mintingFeeCode: 0,
          tokenId: null,
        },
        <MintResDto>{
          name: 'sword2-mix',
          description: 'sword2 description',
          uniqueId: 'itemUniqCode2',
          nftStatus: nftStatus.unLockedNFT,
          mintingFeeCode: 2,
          tokenId: 'sword2-mix-test',
        },
        <MintResDto>{
          name: 'sword3-mix',
          description: 'sword3 description',
          uniqueId: 'itemUniqCode3',
          nftStatus: nftStatus.LockedNFT,
          mintingFeeCode: 3,
          tokenId: 'sword3-mix-test',
        },
      );
    }

    // 응답 정보 구성
    return new CommonResponseDto<any>(GameApiHttpStatus.OK, 'success', result);
  }

  @Post('/mint/confirm')
  @ApiHeaders([
    {
      name: 'pid',
      description: 'Player ID',
    },
  ])
  @ApiOperation({ summary: 'Minting 가능 여부 확인 및 metadata 생성' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({
    status: 200,
    description: '',
    type: MintDataResDto,
  })
  async mintConfirm(
    @Headers() headers,
    @Body() request: MintConfirmReqDto,
  ): Promise<CommonResponseDto<any>> {
    console.log('headers: ', headers);
    console.log('body: ', request);

    const nameArr = [
      `Dark Devil's Robe`,
      `Ice Dragon's Mantle`,
      `Fire Lord's Dagger`,
      `Lightning Devil's Dagger`,
      `Dark Devil's Robe`,
      `Sacred Light's Hammer`,
      `Fire Lord's Helmet`,
    ];
    const descArr = [
      `[UR] Dark Devil's Robe
Mage [Chest]
Craft Count: 0/5
Main Stat
HP: 296357
CRIT HIT: 52574
[UR] Dark Devil's Soul
[Lv. 1] Reduces ATK SPD by 10%, but increases skill damage by 22.8%.
[Lv. 10] Reduces ATK SPD penalty by 2%.
`,
      `[UR] Ice Dragon's Mantle
Mage [Back]
Craft Count: 0/5
Main Stat
HP: 216632
ACC: 46948
[R] Ice Dragon's Heart
[Lv. 1] Reduces incoming damage by 4%.
[Lv. 10] Increases DEF by 2% each time you receive damage.
`,
      `[UR] Fire Lord's Dagger
Rogue [Weapon]
Craft Count: 3/5
Main Stat
ATK: 223563
HP: 288843
[R] Fire Lord's Essence
[Lv. 1] Increases damage, healing, and Barrier absorption of Fire skills by 12%.
[Lv. 10] Increases damage/healing/Barrier absorption of the next Fire skill by 6% when a Fire skill is used.
`,
      `[UR] Lightning Devil's Dagger
Rogue [Weapon]
Craft Count: 0/5
Main Stat
ATK: 240034
DEF: 136819
[SR] Lightning Devil's Soul
[Lv. 1] Generates a DoT effect that deals 17.5% damage every sec when landing a CRIT HIT with direct attacks.
[Lv. 10] Increases CRIT Rate of direct attacks by 5%.
`,
      `[UR] Dark Devil's Robe
Mage [Chest]
Craft Count: 0/5
Main Stat
HP: 239436
CRIT HIT: 42477
[R] Dark Devil's Soul
[Lv. 1] Reduces ATK SPD by 10%, but increases skill damage by 15%.
[Lv. 10] Reduces ATK SPD penalty by 2%.
`,
      `[UR] Sacred Light's Hammer
Druid [Weapon]
Craft Count: 4/5
Main Stat
ATK: 320046
HP: 252530
[SR] Sacred Light
[Lv. 1] Heals all allies by 7% upon Basic Attack after using a respective skill.
[Lv. 10] Heals the ally with the lowest HP by 15%.
`,
      `[UR] Fire Lord's Helmet
Knight [Head]
Craft Count: 0/5
Main Stat
DEF: 182044
EVA: 46948
[R] Fire Lord's Essence
[Lv. 1] Increases damage, healing, and Barrier absorption of Fire skills by 12%.
[Lv. 10] Increases damage/healing/Barrier absorption of the next Fire skill by 6% when a Fire skill is used.
`,
    ];
    const imageArr = [
      'https://image01.c2x.world/equip_92033050.gif',
      'https://image01.c2x.world/equip_94013020.gif',
      'https://image01.c2x.world/equip_91042010.gif',
      'https://image01.c2x.world/equip_91032040.gif',
      'https://image01.c2x.world/equip_92033060.gif',
      'https://image01.c2x.world/equip_91024050.gif',
      'https://image01.c2x.world/equip_93041010.gif',
    ];
    const externalArr = [
      'https://dex.c2xnft.com/market?key=4831',
      'https://dex.c2xnft.com/market?key=4956',
      'https://dex.c2xnft.com/market?key=4949',
      'https://dex.c2xnft.com/market?key=4941',
      'https://dex.c2xnft.com/market?key=4910',
      'https://dex.c2xnft.com/market?key=4905',
      'https://dex.c2xnft.com/market?key=4838',
    ];
    const arrLen = Math.floor(Math.random() * nameArr.length);
    // 응답데이터 구성
    const randomStr = Math.random().toString(36).substring(2, 8);
    const uniqId = 'unique-id-' + randomStr;
    const result = <MintDataResDto>{
      uniqueId: uniqId,
      extension: {
        name: nameArr[arrLen],
        description: descArr[arrLen],
        image: imageArr[arrLen],
        animation_url: imageArr[arrLen],
        youtube_url: '',
        image_data: '',
        external_url: externalArr[arrLen],
        background_color: '',
        attributes: [
          {
            trait_type: 'Category',
            max_value: '',
            value: 'Game',
            display_type: '',
          },
        ],
      },
    };

    // 응답 정보 구성
    return new CommonResponseDto<any>(GameApiHttpStatus.OK, 'success', result);
  }

  @Post('/mint')
  @ApiHeaders([
    {
      name: 'pid',
      description: 'Player ID',
    },
  ])
  @ApiOperation({ summary: 'NFT 아이템 생성' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({
    status: 200,
    description: '',
    type: MintDataResDto,
  })
  async mint(
    @Headers() headers,
    @Body() request: MintReqDto,
  ): Promise<CommonResponseDto<any>> {
    console.log('headers: ', headers);
    console.log('body: ', request);
    // 응답데이터 구성
    const result = <MintDataResDto>{
      uniqueId: 'MintuniqCode1',
      extension: {
        name: "Arbiter's Robe",
        description: 'desc',
        image: 'https://image01.c2x.world/equip_92053030.gif',
        animation_url: 'https://image01.c2x.world/equip_92053030.gif',
        youtube_url: '',
        image_data: '',
        external_url: 'https://dex.c2xnft.com/market?key=4423',
        background_color: '',
        attributes: [
          {
            trait_type: 'Category',
            max_value: '',
            value: 'Game',
            display_type: '',
          },
        ],
      },
    };

    // 응답 정보 구성
    return new CommonResponseDto<any>(GameApiHttpStatus.OK, 'success', result);
  }

  @Patch('/lock')
  @ApiHeaders([
    {
      name: 'pid',
      description: 'Player ID',
    },
  ])
  @ApiOperation({ summary: '게임내 사용 불가 요청' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({
    status: 200,
    description: '',
    type: CommonResponseDto,
  })
  async lock(
    @Headers() headers,
    @Body() request: MintReqDto,
  ): Promise<CommonResponseDto<any>> {
    console.log('headers: ', headers);
    console.log('body: ', request);
    // 응답 정보 구성
    return new CommonResponseDto<any>(GameApiHttpStatus.OK, 'success');
  }

  @Patch('/unlock')
  @ApiHeaders([
    {
      name: 'pid',
      description: 'Player ID',
    },
  ])
  @ApiOperation({ summary: '게임내 사용 가능 요청' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({
    status: 200,
    description: '',
    type: CommonResponseDto,
  })
  async unlock(
    @Headers() headers,
    @Body() request: MintReqDto,
  ): Promise<CommonResponseDto<any>> {
    console.log('headers: ', headers);
    console.log('body: ', request);
    // 응답 정보 구성
    return new CommonResponseDto<any>(GameApiHttpStatus.OK, 'success');
  }

  @Post('/tx/result')
  @ApiHeaders([
    {
      name: 'pid',
      description: 'Player ID',
    },
  ])
  @ApiOperation({ summary: 'TX 결과 전송' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({
    status: 200,
    description: '',
    type: CommonResponseDto,
  })
  async mintFinished(
    @Headers() headers,
    @Body() request: MintFinishedReqDto,
  ): Promise<CommonResponseDto<any>> {
    console.log('headers: ', headers);
    console.log('body: ', request);
    // 응답 정보 구성
    return new CommonResponseDto<any>(GameApiHttpStatus.OK, 'success');
  }
}
