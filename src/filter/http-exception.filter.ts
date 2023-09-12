import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ServerException } from '../exception/server.exception';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('HTTP');

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    // const request = ctx.getRequest();
    console.log(exception);
    const httpStatus =
      exception instanceof ServerException
        ? HttpStatus.INTERNAL_SERVER_ERROR
        : exception?.getStatus() ?? 500;

    const code = exception?.getStatus()
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const errorResponse = {
      code: code,
      message: exception.message
        ? exception.message || null
        : 'Internal server error',
    };

    this.logger.error(errorResponse);
    response.status(httpStatus).json(errorResponse);
  }
}
