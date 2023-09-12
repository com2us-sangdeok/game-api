import { ApiResponseProperty } from '@nestjs/swagger';

export class CommonResponseDto<T> {
  constructor(code: number, message: string, data?: T) {
    this.statusCode = code;
    this.message = message;
    this.data = data;
  }

  @ApiResponseProperty()
  statusCode: number;

  @ApiResponseProperty()
  message: string;

  @ApiResponseProperty()
  data?: T;
}
