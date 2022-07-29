import {Injectable} from '@nestjs/common';
import {IRequestOptions} from 'typed-rest-client/Interfaces';
import * as restClient from 'typed-rest-client/RestClient';
import {IRequestOptions as IRequestHeaderOptions} from 'typed-rest-client/RestClient';
import {createNamespace, getNamespace, Namespace} from "cls-hooked";
import {isNullOrUndefined} from "util";
import {RequestContext} from "../commom/context/request.context";
import {ExternalServerException} from "../exception/external-server.exception";

@Injectable()
export class TransactionUtil {

    private restOption: IRequestOptions = <IRequestOptions>{
        socketTimeout: 5000,
    };
    private namespace: Namespace;
    private restc: restClient.RestClient;

    constructor(
        userAgent?: string,
        serverUrl?: string,
        socketTimeout?: number,
    ) {
        if (socketTimeout) {
            this.restOption.socketTimeout = socketTimeout;
        }
        this.namespace = getNamespace(RequestContext.NAMESPACE) || createNamespace(RequestContext.NAMESPACE);
        this.restc = new restClient.RestClient(userAgent ? userAgent : process.env.APP_NAME, serverUrl, undefined, this.restOption);
    }

    public async get<T = any>(querystring: string, headerOpts?: any): Promise<any> {
        try {
            let header = this.setHeaderData(headerOpts);
            let hres: restClient.IRestResponse<T>;
            hres = await this.restc.get<T>(querystring, header);

            const result = {
                statusCode: hres.statusCode,
                result: hres.result
            }

            return result;
        } catch (error) {
            throw new ExternalServerException(error);
        }
    }

    public async post<T = any>(querystring: string, param: T, headerOpts?: any): Promise<any> {
        try {
            let header = this.setHeaderData(headerOpts);
            let hres: restClient.IRestResponse<T>;
            hres = await this.restc.create<T>(querystring, param, header);
            const result = {
                statusCode: hres.statusCode,
                result: hres.result
            }

            return result;
        } catch (error) {
            throw new ExternalServerException(error);
        }
    }

    public async put<T = any>(querystring: string, param: T, headerOpts?: any): Promise<any> {
        try {
            let header = this.setHeaderData(headerOpts);
            let hres: restClient.IRestResponse<T>;
            hres = await this.restc.update<T>(querystring, param, header);
            const result = {
                statusCode: hres.statusCode,
                result: hres.result
            }

            return result;
        } catch (error) {
            throw new ExternalServerException(error);
        }
    }

    public async delete<T = any>(querystring: string, headerOpts?: any): Promise<any> {
        try {
            let header = this.setHeaderData(headerOpts);
            let hres: restClient.IRestResponse<T>;
            hres = await this.restc.del<T>(querystring, header);

            const result = {
                statusCode: hres.statusCode,
                result: hres.result
            }

            return result;
        } catch (error) {
            throw new ExternalServerException(error);
        }
    }

    private setHeaderData(additionalHeaders: any): IRequestHeaderOptions {
        let correlationId = !isNullOrUndefined(this.namespace.get(RequestContext.CORRELATION_ID)) ? this.namespace.get(RequestContext.CORRELATION_ID) : RequestContext.uniqueKeyGenerator();
        let restOptions: IRequestHeaderOptions = {
            acceptHeader: 'application/json',
            additionalHeaders: (additionalHeaders !== undefined)? additionalHeaders: {}
        };
        restOptions.additionalHeaders.correlationId = correlationId;

        return restOptions;
    }
}
