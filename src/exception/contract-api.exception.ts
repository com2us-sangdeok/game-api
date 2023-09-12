import { ServerException } from './server.exception';
import { Logger } from '@nestjs/common';

export class ContractApiException extends ServerException {
  private readonly logger = new Logger('WALLETAPI_EXCEPTION');

  constructor(message: any, error: any = '', statusCode: ContractApiStatus) {
    super(ServerException.createBody(message, error, statusCode), statusCode);
    this.logger.error(
      `[ContractApi Exception] code:${statusCode}, error:${error}, message:${message}`,
    );
  }
}

export enum ContractApiStatus {
  CONTRACT_API_ERROR = 4000,
}
