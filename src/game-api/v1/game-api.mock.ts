import { Key } from '@terra-money/terra.js';

export const betagameInfoApi = (appId: string) => {
  return {
    code: 200,
    message: 'success',
    data: {
      gameId: appId,
      constraintUrl: 'https://game.com2us.com/constraint-url/' + appId,
      updateItemUrl: 'https://game.com2us.com/update-item-url/' + appId,
      singleMintFee: {
        ctx: 20,
        gameToken: 10,
      },
      characterMintFee: {
        ctx: 20,
        gameToken: 10,
      },
      lockCa: 'terra1x46rqay4d3cssq8gxxvqz8xt6nwlz4td20k38v',
      c2xCa: '',
      gameProviderAddress: '',
      treasuryAddress: '',
      serverAddress: '',
      c2xHolderAddress: '',
      gameTokenCa: '',
      fanHolderAddress: '',
      nftCa: 'nftCa' + appId,
    },
  };
};

export const betagameFeeApi = (appId: string) => {
  return {
    code: 200,
    message: 'success',
    data: {
      gameTokenFee: 10,
      ctxTokenFee: 20,
    },
  };
};

export const getMinterKey = async (): Promise<Key> => {
  let hsmMinterKey: Key = undefined;
  return hsmMinterKey;
};

export const updateGameServerForMintingApi = (reqest: any) => {
  return {
    code: 200,
    message: 'success',
    data: {
      imageUrl: 'https://image01.c2x.world/equip_92053030.gif',
    },
  };
};

export const gameItemsForMint = (data: any) => {
  return {
    name: "Arbiter's Robe",
    description: "desc",
    image: "https://image01.c2x.world/equip_92053030.gif",
    animation_url: "https://image01.c2x.world/equip_92053030.gif",
    youtube_url: "",
    image_data: "",
    external_url: "https://dex.c2xnft.com/market?key=4423",
    background_color: "",
    attributes: [
      {
        trait_type: "Category",
        value: "Game",
      }
    ],
    feeCount: 4
  }
}