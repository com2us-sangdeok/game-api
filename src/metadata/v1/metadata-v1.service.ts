import {Inject, Injectable, LoggerService,} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {WINSTON_MODULE_NEST_PROVIDER} from 'nest-winston';
import {MetadataEntity} from "../repository/metadata.entity";
import {ExtensionDto} from "./dto/metadata-v1.dto";
import {customUuid} from "../../util/common.util";
import {Metadata} from "./type/meta-info";
import {MetadataRepository} from "../repository/metadata.repository";
import {s3get, s3upload} from "../../util/s3.mock";

@Injectable()
export class MetadataV1Service {
    constructor(
        private configService: ConfigService,
        private readonly metadataRepository: MetadataRepository,
        @Inject(WINSTON_MODULE_NEST_PROVIDER)
        private readonly logger: LoggerService,
    ) {}

    async uploadMetadata(extensionDto: ExtensionDto): Promise<Metadata> {
        const metadataId = `${customUuid()}.json`

        // todo: upload metadata to the public cloud storage
        const uploadedMetadata = s3upload(customUuid());

        try {
            const data = await this.metadataRepository.registerMetadata(<MetadataEntity>{
                fileName: metadataId,
                // todo: set url
                uri: uploadedMetadata.Location
            });

            const meta: Metadata = {
                id: data.fileName,
                url: data.uri
            }
            return meta;
        } catch (e) {
            // if (error instanceof GameApiException) {
            // code for failover
            // }
            this.logger.error(e);
            throw e;
            // throw new GameApiException('', e, GameApiHttpStatus.BAD_REQUEST)
        }
    }

    async getMetadata(id: string): Promise<Metadata> {
        try {
            const result = await this.metadataRepository.getMetadata(id);
            // todo: get metadata from cloud storage
            //       set extension
            const metadata = s3get(id)

            return <Metadata><unknown>{
                id: result.fileName,
                url: result.uri,
                extension: metadata
            }
        } catch (e) {
            this.logger.error(e);
            throw e;
        }
    }
}
