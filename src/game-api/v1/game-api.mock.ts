import { Key } from '@terra-money/terra.js';

export const betagameInfoApi = (appId: string) => {
  return {
    code: 200,
    message: 'success',
    data: {
      gameId: appId,
      constraintUrl: 'https://game.com2us.com/constraint-url/' + appId,
      updateItemUrl: 'https://game.com2us.com/update-item-url/' + appId,
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
