import { Injectable } from '@nestjs/common';
import { createNamespace, getNamespace, Namespace } from 'cls-hooked';
import { isNullOrUndefined } from 'util';
import { RequestContext } from '../commom/context/request.context';
import { ExternalServerException } from '../exception/external-server.exception';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { CommonResponseDto } from '../commom/dto/common-response.dto';

@Injectable()
export class AxiosClientUtil {
  private namespace: Namespace;

  constructor(private httpService: HttpService) {
    this.namespace =
      getNamespace(RequestContext.NAMESPACE) ||
      createNamespace(RequestContext.NAMESPACE);
  }

  public async get(
    url: string,
    headerOpts?: any,
  ): Promise<CommonResponseDto<any>> {
    let headers = this.setHeaderData(headerOpts);
    try {
      const response = await firstValueFrom(
        this.httpService.get(url, { headers: headers }),
      );

      return new CommonResponseDto<any>(response.status, response.data);
    } catch (e) {
      throw new ExternalServerException(e);
    }
  }

  public async post(url: string, data?: any, headerOpts?: any): Promise<any> {
    let headers = this.setHeaderData(headerOpts);
    try {
      const response = await firstValueFrom(
        this.httpService.post(url, data, { headers: headers }),
      );

      return new CommonResponseDto<any>(response.status, response.data);
    } catch (e) {
      throw new ExternalServerException(e);
    }
  }

  private setHeaderData(headerOptions: any): any {
    let correlationId = !isNullOrUndefined(
      this.namespace.get(RequestContext.CORRELATION_ID),
    )
      ? this.namespace.get(RequestContext.CORRELATION_ID)
      : RequestContext.uniqueKeyGenerator();
    let header = {
      'Content-Type': 'application/json',
      correlationId: correlationId,
    };
    Object.assign(header, headerOptions);
    return header;
  }
}
