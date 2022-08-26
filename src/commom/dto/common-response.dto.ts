import { ApiResponseProperty } from '@nestjs/swagger';

export class CommonResponseDto<T> {
  constructor(code: number, message?: string, data?: T) {
    this.code = code;
    this.message = message;
    this.data = data;
  }

  @ApiResponseProperty()
  code: number;

  @ApiResponseProperty()
  message?: string;

  @ApiResponseProperty()
  data?: T;
}