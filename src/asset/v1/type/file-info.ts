export interface AssetInfo {
    assetName: string;
    contentType: string;
    uri: string;
    thumbnailUri?: string;
}

export interface FileInfo {
    buffer: Buffer;
    contentType?: string;
}
