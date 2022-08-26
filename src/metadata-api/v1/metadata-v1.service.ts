import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { MetadataEntity } from '../../entities/metadata.entity';
import { ExtensionDto } from './dto/metadata-v1.dto';
import { customUuid } from '../../util/common.util';
import { Metadata } from './type/meta-info';
import { MetadataRepository } from '../repository/metadata.repository';
import { S3storageUtil } from '../../util/s3storage.util';
import {
  GameApiException,
  GameApiHttpStatus,
} from '../../exception/request.exception';
import { AxiosClientUtil } from '../../util/axios-client.util';
import {MetadataException, MetadataHttpStatus} from "../../exception/metadata.exception";

@Injectable()
export class MetadataV1Service {
  constructor(
    private configService: ConfigService,
    private readonly metadataRepository: MetadataRepository,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
    private s3: S3storageUtil,
    private axiosClientUtil: AxiosClientUtil,
  ) {}

  async uploadMetadata(extensionDto: ExtensionDto): Promise<Metadata> {
    const metadataId = `${customUuid()}.json`;

    try {
      await this.s3.upload(
        metadataId,
        Buffer.from(JSON.stringify(extensionDto)),
      );

      const data = await this.metadataRepository.registerMetadata(<
        MetadataEntity
      >{
        fileName: metadataId,
        uri: this.configService.get('FILE_CDN_URI') + metadataId,
      });

      const meta: Metadata = {
        id: data.fileName,
        url: data.uri,
      };
      return meta;
    } catch (e) {
      // if (e instanceof GameApiException) {
      // code for failover
      // }
      this.logger.error(e);
      throw new MetadataException(
        e.message,
        e.stack,
          MetadataHttpStatus.METADATA_UPLOAD_FAILED,
      );
    }
  }

  async getMetadata(id: string): Promise<Metadata> {
    try {
      const metadataFromDb = await this.metadataRepository.getMetadata(id);
      const filePath =
        this.configService.get('FILE_CDN_URI') + metadataFromDb.fileName;
      const metadataFromS3 = await this.axiosClientUtil.get(filePath);

      return <Metadata>(<unknown>{
        id: metadataFromDb.fileName,
        url: metadataFromDb.uri,
        extension: metadataFromS3.body,
      });
    } catch (e) {
      this.logger.error(e);
      throw new MetadataException(
        e.message,
        e.stack,
        MetadataHttpStatus.SEARCHING_FAILED,
      );
    }
  }
}
