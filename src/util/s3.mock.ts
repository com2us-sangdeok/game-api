export const s3upload = (data: any) => {
  return {
    Location: 'https://s3.aws.com/filestorage/' + data,
    ETag: data,
    Bucket: 'test bucket',
    Key: data,
  };
};

export const s3get = (data: any) => {
  return {
    name: "Arbiter's Robe",
    description: 'desc',
    image: 'https://image01.c2x.world/equip_92053030.gif',
    animationUrl: 'https://image01.c2x.world/equip_92053030.gif',
    externalUrl: 'https://dex.c2xnft.com/market?key=4423',
    attribute: {
      category: 'Game',
      collection: 'AFK Raid',
      creator: 'game creator',
      provider: 'game provider',
      thumbnailUrl: 'https://image01.c2x.world/equip_92053030.gif',
      extensionUrl: 'http://www.afkraid.com',
    },
  };
};