import {Inject, Injectable, LoggerService,} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {WINSTON_MODULE_NEST_PROVIDER} from 'nest-winston';
import {TransactionUtil} from '../../util/transacation.util';
import {AssetInfo} from "../../asset/v1/type/file-info";
import {AssetEntity} from "../repository/asset.entity";
import {ImageUtil} from "../../util/image.util";
import {customUuid} from "../../util/common.util";
import {extname} from 'path';
import {AssetInfoDto, ImageDto} from "./dto/asset-v1.dto";
import {AssetRepository} from "../repository/asset.repository";
import {s3upload} from "../../util/s3.mock";

@Injectable()
export class AssetV1Service {
    private TxUtil: TransactionUtil = new TransactionUtil(
        this.configService.get('SERVICE_USERAGENT'),
        this.configService.get(''),
        parseInt(this.configService.get('SERVICE_TIMEOUT')),
    );
    private imageUtil: ImageUtil = new ImageUtil(parseInt(this.configService.get('FILE_THUMBNAIL_SIZE')));

    constructor(
        private configService: ConfigService,
        private readonly assetRepository: AssetRepository,
        @Inject(WINSTON_MODULE_NEST_PROVIDER)
        private readonly logger: LoggerService,
    ) {}

    async uploadImage(file: Express.Multer.File): Promise<AssetInfo> {
        const imageName = `${customUuid()}${extname(file.originalname)}`;

        try {
            // todo: upload assets
            const uploadedImage = s3upload(customUuid());

            const thumbNail = await this.imageUtil.getImageBySharp(<ImageDto>{
                buffer: file.buffer,
                filename: 'uploadImage.png'
            });
            const thumbNailName = `thumbnail-${imageName}`;
            // todo: upload thumbnail
            const uploadedThumbnail = s3upload(customUuid());

            await this.assetRepository.registerAsset(<AssetEntity>{
                fileName: imageName,
                originalName: file.originalname,
                // todo: set file path
                filePath: uploadedImage.Location,
                thumbnailPath: uploadedThumbnail.Location
            });

            const assetInfo: AssetInfo = {
                assetName: imageName,
                contentType: file.mimetype,
                // todo:  url of set cloud storage
                uri: uploadedImage.Location,
                thumbnailUri: uploadedThumbnail.Location,
            }
            return assetInfo
        } catch (e) {
            this.logger.error(e)
            // todo: throw exception
        }

    }

    async uploadImageByUrl(assetInfoDto: AssetInfoDto): Promise<AssetInfo> {
        try {
            const image = await this.imageUtil.getImageByAxios(<ImageDto>{
                buffer: null,
                path: assetInfoDto.url,
                // todo: test code
                filename: 'uploadImageByUrl.png',
                isOriginal: true
            });
            const imageName = `${customUuid()}${extname(assetInfoDto.url)}`
            // // todo: upload asset cloud storage
            const uploadedImage = s3upload(customUuid());

            const thumbNail = await this.imageUtil.getImageBySharp(<ImageDto>{
                buffer: null,
                path: assetInfoDto.url,
                filename: 'output.png',
                isOriginal: false
            });
            const thumbNailName = `thumbnail-${imageName}`
            // // todo: upload thumbnail cloud storage
            const uploadedThumbnail = s3upload(customUuid());

            await this.assetRepository.registerAsset(<AssetEntity>{
                fileName: imageName,
                originalName: assetInfoDto.url.substring(assetInfoDto.url.lastIndexOf('/')+1),
                // todo: set file path
                filePath: '',
                thumbnailPath: ''
            });

            const assetInfo: AssetInfo = {
                assetName: imageName,
                contentType: image.contentType,
                // todo:  url of set cloud storage
                uri: uploadedImage.Location,
                thumbnailUri: uploadedThumbnail.Location
            }
            return assetInfo
        } catch (e) {
            this.logger.error(e)
            // todo: throw exception
        }

    }

    async getImageByName(assetName: string): Promise<AssetEntity> {
        try {
            return await this.assetRepository.getAsset(assetName);
        } catch (e) {
            this.logger.error(e)
            // todo: throw exception
        }
    }
}
