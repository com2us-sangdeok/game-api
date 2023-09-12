export interface AssetInfo {
  assetName: string;
  contentType: string;
  uri: string;
  thumbnailUri?: string;
}

export interface FileInfo {
  image?: any;
  buffer: Buffer;
  contentType?: string;
}

export interface AssetFileInfo {
  assetName: string;
  contentType: string;
  uri: string;
  viewUri?: string;
}
