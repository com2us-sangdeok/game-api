import { ServerException } from './server.exception';
import { Logger } from '@nestjs/common';

export class WalletApiException extends ServerException {
  private readonly logger = new Logger('WALLETAPI_EXCEPTION');

  constructor(message: any, error: any = '', statusCode: WalletApiStatus) {
    super(ServerException.createBody(message, error, statusCode), statusCode);
    this.logger.error(
      `[WalletApi Exception] code:${statusCode}, error:${error}, message:${message}`,
    );
  }
}

export enum WalletApiStatus {
  WALLET_API_ERROR = 3000,
  ALREADY_REGISTERED_WALLET,
}
