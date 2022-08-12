export interface Asset {
  assetName: string;
  contentType: string;
  uri: string;
  thumbnailUri?: string;
}

export interface File {
  image?: any;
  buffer: Buffer;
  contentType?: string;
}
