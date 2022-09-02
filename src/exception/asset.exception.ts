import {ServerException} from "./server.exception";

export class AssetException extends ServerException {
  constructor(message: any, error: any, statusCode: AssetHttpStatus) {
    super(ServerException.createBody(message, error, statusCode), statusCode);
  }
}

export enum AssetHttpStatus {
  ASSET_UPLOAD_FAILED = 5100,
  ASSET_URL_UPLOAD_FAILED ,
}