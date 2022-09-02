import {ServerException} from "./server.exception";

export class MetadataException extends ServerException {
  constructor(message: any, error: any, statusCode: MetadataHttpStatus) {
    super(ServerException.createBody(message, error, statusCode), statusCode);
  }
}

export enum MetadataHttpStatus {
  METADATA_UPLOAD_FAILED = 5200,
  SEARCHING_FAILED
}