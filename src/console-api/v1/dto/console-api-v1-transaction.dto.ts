import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class TransactionReqDto {
  @ApiProperty({
    example: '1',
    description: 'Page',
  })
  @IsString()
  page: number;

  @ApiProperty({
    example: 'com.com2us.hivesdk.c2xwallet.hivepc.kr.test',
    description: 'Hive Appid',
  })
  @IsString()
  appid: string;

  @ApiProperty({
    example: '1234',
    description: 'Hive User Player ID',
    required: false,
  })
  @IsString()
  @IsOptional()
  playerId?: number;

  @ApiProperty({
    example: '2023-02-20',
    description: '검색 시작일',
  })
  @IsDateString()
  startDate: string;

  @ApiProperty({
    example: '2023-02-20',
    description: '검색 종료일',
  })
  @IsDateString()
  endDate: string;

  @ApiProperty({
    example: 1,
    description: '정렬 순서',
  })
  @IsString()
  sortType: number;
}

export class paging {
  itemsPerPage: number;
  totalItems: number;
  currentPage: string;
  totalPages: number;
}

export class Transaction {
  @ApiProperty({
    example: '1',
    description: '고유번호',
  })
  id: number;

  @ApiProperty({
    example: '2217828f-a7f9-4699-9d3c-fe07317bd231',
  })
  requestId: string;

  @ApiProperty({
    example: 'com.com2us.hivesdk.c2xwallet.hivepc.kr.test',
    description: 'Hive AppID',
  })
  appId: string;

  @ApiProperty({
    example: '1234',
    description: 'Hive User ID',
  })
  playerId: number;

  @ApiProperty({
    example: 'xpla1ump5yp4l5f2ulp5ps8k6sdgdcrs2ne8rjurwmk',
    description: '요청자 지갑 주소',
  })
  senderAddress: string;

  @ApiProperty({
    example: 'xpla15hxhf8mn4de4qvgj6edfd8gf2jqgmwyszv6ldnefy7gpml969pjspmut6m',
    description: 'mint: cw721, convert: cw20↲lock : lock',
  })
  contractAddress?: string;

  @ApiProperty({
    example: 'E9762E9FB475EBDCF5EB2A3608BAD712A7A739A20F691425D3F04FE50CE9633A',
    description: 'tx_hash 값',
  })
  txHash?: string;

  @ApiProperty({
    example:
      'CooCCocCCiQvY29zbXdhc20ud2FzbS52MS5Nc2dFeGVjdXRlQ29udHJhY3QS3gEKK3hwbGExZTZsY3p1dTduNDZ4cXk3Z25rZjNxa3VwZHN0ZXF6MHRwNTB0Y3ASP3hwbGExNWh4aGY4bW40ZGU0cXZnajZlZGZkOGdmMmpxZ213eXN6djZsZG5lZnk3Z3BtbDk2OXBqc3BtdXQ2bRpueyJ1bmxvY2siOnsibmZ0X2FkZHJlc3MiOiJ4cGxhMTVrM3ZhbXp3bDMwdHh5dnBlNWY4eDZmZGVsaDd3Y2V2d3d4M3hydzhwd2pqMGhneHdrc3F3NDNzZmYiLCJ0b2tlbl9pZCI6InFhIzMifX0SfwpaCk8KKC9ldGhlcm1pbnQuY3J5cHRvLnYxLmV0aHNlY3AyNTZrMS5QdWJLZXkSIwohA0L+YtagxvoW8n/8FAyA2bp0pCv9sOsilrb0xOiMtVvWEgQKAgh/GIQBEiEKGwoFYXhwbGESEjM0MDY5MTA1MDAwMDAwMDAwMBCtuxgaQPF7wxZKYZtVsF6sBXdllTIbWoYz4BRkGQmXkUo8pDfIXTBSgoS+b4D0EmkR+N5+a07ALy58K07Fs40yxp995IQ=',
    description: 'tx 배포전 인코딩 데이터',
  })
  tx: string;

  @ApiProperty({
    example:
      '{"appId":"com.com2us.hivesdk.c2xwallet.hivepc.kr.test","address":"xpla1ump5yp4l5f2ulp5ps8k6sdgdcrs2ne8rjurwmk","pid":"234","server":"1,1","characterId":"character Id","tokenId":"qa#3","gameindex":539,"title":[{"language":"ar","name":"HIVE SDK(ar)"},{"language":"de","name":"HIVE SDK(de)"},{"language":"en","name":"HIVE SDK(en)"},{"language":"es","name":"HIVE SDK(es)"},{"language":"fr","name":"HIVE SDK(fr)"},{"language":"id","name":"HIVE SDK(id)"},{"language":"it","name":"HIVE SDK(it)"},{"language":"ja","name":"HIVE SDK(Ja)"},{"language":"ko","name":"하이브SDK"},{"language":"pt","name":"HIVE SDK(pt)"},{"language":"ru","name":"HIVE SDK(ru)"},{"language":"th","name":"HIVE SDK(th)"},{"language":"tr","name":"HIVE SDK(tr)"},{"language":"vi","name":"HIVE SDK(vi)"},{"language":"zh-hans","name":"HIVE SDK(zhs)"},{"language":"zh-hant","name":"HIVE SDK(zht)"}],"iconImage":"https://hive-fn.qpyou.cn/hubweb/gmnotice/appcenter/test/1651485241439.png","genre":"RPG","gameTokenName":"CPBC","gameTokenImage":"https://c2xnft.qpyou.cn/blockchain-sdk/blockchain/7b60c566-8c65-2dac-876d-fb3be3ce8eed.png","settingCompleteTypeCd":"1001000901","apiSettingCompleteTypeCd":"1001000901","activeTypeCd":"1001000601","serverAddress":null,"fanHolderAddress":null,"gameProviderAddress":"xpla1e6lczuu7n46xqy7gnkf3qkupdsteqz0tp50tcp","gameTokenContract":"xpla1hkcp8avzchehvt5y8373ac0xyqklz6yalyz2q2t28k0qpvpkeyzsvgqf6s","lockContract":"xpla15hxhf8mn4de4qvgj6edfd8gf2jqgmwyszv6ldnefy7gpml969pjspmut6m","nftContract":"xpla15k3vamzwl30txyvpe5f8x6fdelh7wcevwwx3xrw8pwjj0hgxwksqw43sff","treasuryAddress":null,"xplaContract":null,"xplaHolderAddress":null,"distributionType":3,"xplaConvertPoolInitialRatioGoods":"8.206100000000000000","gameTokenConvertPoolInitialRatioGoods":"9.858100000000000000","apiLists":[{"apiTypeCd":"1001000501","apiUrl":"http://10.89.91.11:3002/v2/game/servers"},{"apiTypeCd":"1001000502","apiUrl":"http://10.89.91.11:3002/v2/mint/characters"},{"apiTypeCd":"1001000503","apiUrl":"http://34.146.148.127:3002/v2/mint/items"},{"apiTypeCd":"1001000504","apiUrl":"http://34.146.148.127:3002/v2/mint/confirm"},{"apiTypeCd":"1001000505","apiUrl":"http://34.146.148.127:3002/v2/mint"},{"apiTypeCd":"1001000506","apiUrl":"http://10.89.91.11:3002/v2/convert/goods"},{"apiTypeCd":"1001000507","apiUrl":"http://10.89.91.11:3002/v2/convert/confirm"},{"apiTypeCd":"1001000508","apiUrl":"http://10.89.91.11:3002/v2/convert"},{"apiTypeCd":"1001000509","apiUrl":"http://10.89.91.11:3002/v2/unlock"},{"apiTypeCd":"1001000510","apiUrl":"http://10.89.91.11:3002/v2/lock"},{"apiTypeCd":"1001000511","apiUrl":"http://10.89.91.11:3002/v2/tx/result"}],"apiTestLists":[{"apiTypeCd":"1001000501","apiUrl":"http://34.146.148.127:3002/v2/game/servers"},{"apiTypeCd":"1001000502","apiUrl":"http://34.146.148.127:3002/v2/mint/characters"},{"apiTypeCd":"1001000503","apiUrl":"http://34.146.148.127:3002/v2/mint/items"},{"apiTypeCd":"1001000504","apiUrl":"http://34.146.148.127:3002/v2/mint/confirm"},{"apiTypeCd":"1001000505","apiUrl":"http://34.146.148.127:3002/v2/mint"},{"apiTypeCd":"1001000506","apiUrl":"http://34.146.148.127:3002/v2/convert/goods"},{"apiTypeCd":"1001000507","apiUrl":"http://34.146.148.127:3002/v2/convert/confirm"},{"apiTypeCd":"1001000508","apiUrl":"http://34.146.148.127:3002/v2/convert"},{"apiTypeCd":"1001000509","apiUrl":"http://34.146.148.127:3002/v2/unlock"},{"apiTypeCd":"1001000510","apiUrl":"http://34.146.148.127:3002/v2/lock"},{"apiTypeCd":"1001000511","apiUrl":"http://34.146.148.127:3002/v2/tx/result"}],"categoryLists":[{"id":256,"activeTypeCd":"1001000601","mintTypeCd":"1001000701","name":"test","feeInfo":[{"xplaFee":"0.111100000000000000","gameTokenFee":"0.111100000000000000","mintCount":0}]}],"convertLists":[{"convertTypeCd":"1001000801","goodsName":"gold","goodsCode":"goldcode","goodsImage":"https://c2xnft.qpyou.cn/blockchain-sdk/blockchain/48479951-8fc3-7aa5-b2a8-433c312a30d2.png","minConvertQuantityOneTime":10,"maxConvertQuantityDays":10000},{"convertTypeCd":"1001000802","goodsName":"crystal","goodsCode":"crystalcode","goodsImage":"https://c2xnft.qpyou.cn/blockchain-sdk/blockchain/48479951-8fc3-7aa5-b2a8-433c312a30d2.png","minConvertQuantityOneTime":10,"maxConvertQuantityDays":10000}],"gameServerLists":[{"serverId":"Wallet","serverNameKO":"Wallet","serverNameEN":"Wallet","timezone":"Asia/Seoul"},{"serverId":"MNN-kr","serverNameKO":"망나뇽의한국서버","serverNameEN":"MNN-en","timezone":"Asia/Seoul"},{"serverId":"us","serverNameKO":"HIVE SDK 샘플앱 미국","serverNameEN":"HIVE SDK Sample US","timezone":"America/Los_Angeles"},{"serverId":"cn","serverNameKO":"HIVE SDK 샘플앱 중국","serverNameEN":"HIVE SDK Sample China","timezone":"Asia/Shanghai"},{"serverId":"jp","serverNameKO":"HIVE SDK 샘플앱 일본","serverNameEN":"HIVE SDK Sample Japan","timezone":"Asia/Tokyo"},{"serverId":"testserver2","serverNameKO":"testserver2","serverNameEN":"testserver2","timezone":"Asia/Seoul"},{"serverId":"server-test2","serverNameKO":"테스트서버2222","serverNameEN":"testsv2222","timezone":"Asia/Seoul"},{"serverId":"server-test3","serverNameKO":"테스트서버3","serverNameEN":"testsv3","timezone":"Asia/Seoul"},{"serverId":"kr","serverNameKO":"HIVE SDK 샘플앱 한국","serverNameEN":"HIVE SDK Sample Korea","timezone":"Asia/Seoul"},{"serverId":"server_004","serverNameKO":"server_004","serverNameEN":"server_004","timezone":"Australia/Brisbane"},{"serverId":"server_003","serverNameKO":"server_003","serverNameEN":"server_003","timezone":"America/Los_Angeles"},{"serverId":"server_002","serverNameKO":"server_002","serverNameEN":"server_002","timezone":"Australia/Brisbane"},{"serverId":"server_001","serverNameKO":"server_001","serverNameEN":"server_001","timezone":"Australia/Canberra"},{"serverId":"test_server","serverNameKO":"테스트 게임아이템 중계서버 (KO)","serverNameEN":"테스트 게임아이템 중계서버 (EN)","timezone":"Etc/GMT"},{"serverId":"USA","serverNameKO":"미국","serverNameEN":"USA","timezone":"America/Los_Angeles"},{"serverId":"GLOBAL","serverNameKO":"글로벌","serverNameEN":"글로벌","timezone":"Etc/GMT"}]}',
    description:
      '사용자가 요청한 mint, convert, lock 등 블록체인에 tx 전송에 대한 param',
  })
  params: string;

  @ApiProperty({
    example: 'MINT',
    description:
      'tx 타입 (MINT, BURN, LOCK, UNLOCK, CONVERTTOCURRENCY, CONVERTTOTOKEN)',
  })
  txType: string;

  @ApiProperty({
    example: 0,
    description:
      '트랜잭션 상태값 (0: broadcast 전, 1: broadcast 후, 2: tx 성공(블록체인 네트워크에서))',
  })
  status: number;

  @ApiProperty({
    example: 0,
    description:
      'rabbit mq에 데이터 전송 여부 (0 : 미전송, 1 : 전송완료, 2: 에러)',
  })
  queueStatus: string;

  @ApiProperty({
    example: 0,
    description: '{"code":0,"message":""}',
  })
  message?: string;

  @ApiProperty({
    example: '2023-02-08T06:10:45.817Z',
    description: '{"code":0,"message":""}',
  })
  createdAt: string;

  @ApiProperty({
    example: '2023-02-08T06:10:45.817Z',
    description: '{"code":0,"message":""}',
  })
  updatedAt: string;
}

export class TransactionListResDto {
  @ApiProperty({
    type: [Transaction],
  })
  lists: Transaction[];

  @ApiProperty({
    type: [paging],
  })
  paging: paging;
}
