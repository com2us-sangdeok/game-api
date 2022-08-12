import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Asset } from './type/file';
import { AssetEntity } from '../../entities/asset.entity';
import { ImageUtil } from '../../util/image.util';
import { customUuid } from '../../util/common.util';
import { extname } from 'path';
import { AssetDto, ImageDto } from './dto/asset-v1.dto';
import { AssetRepository } from '../repository/asset.repository';
import { S3storageUtil } from '../../util/s3storage.util';
import { AxiosClientUtil } from '../../util/axios-client.util';
import axios from 'axios';
import {
  GameApiException,
  GameApiHttpStatus,
} from '../../exception/request.exception';
import {AssetException, AssetHttpStatus} from "../../exception/asset.exception";

@Injectable()
export class AssetV1Service {
  constructor(
    private configService: ConfigService,
    private readonly assetRepository: AssetRepository,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
    private imageUtil: ImageUtil,
    private axiosClient: AxiosClientUtil,
    private s3: S3storageUtil,
  ) {}

  async uploadImage(file: Express.Multer.File): Promise<Asset> {
    const imageName = `${customUuid()}${extname(file.originalname)}`;

    try {
      const uploadedImageUrl = await this.s3.upload(imageName, file.buffer);

      const thumbNail = await this.imageUtil.getImageBySharp(<ImageDto>{
        buffer: file.buffer,
        // filename: 'uploadImage.png'
      });
      const thumbNailName = `thumbnail-${imageName}`;
      const uploadedThumbnailUrl = await this.s3.upload(
        thumbNailName,
        thumbNail.image,
      );

      await this.assetRepository.registerAsset(<AssetEntity>{
        fileName: imageName,
        originalName: file.originalname,
        filePath: uploadedImageUrl,
        thumbnailPath: uploadedThumbnailUrl,
      });

      const asset: Asset = {
        assetName: imageName,
        contentType: file.mimetype,
        uri: uploadedImageUrl,
        thumbnailUri: uploadedThumbnailUrl,
      };
      return asset;
    } catch (e) {
      this.logger.error(e);
      throw new AssetException(
        e.message,
        e.stack,
        AssetHttpStatus.IMAGE_UPLOAD_FAILED,
      );
    }
  }

  async uploadImageByUrl(assetDto: AssetDto): Promise<Asset> {
    try {
      // todo: check axios
      const response = await axios.get(assetDto.url, {
        responseType: 'arraybuffer',
      });
      // const image = await this.axiosClient.get(assetInfoDto.url, { responseType: 'arraybuffer'})
      const imageName = `${customUuid()}${extname(assetDto.url)}`;
      await this.s3.upload(imageName, response.data);

      const thumbNail = await this.imageUtil.getImageBySharp(<ImageDto>{
        buffer: null,
        path: assetDto.url,
        // filename: 'output.png',
        isOriginal: false,
      });
      const thumbNailName = `thumbnail-${imageName}`;
      await this.s3.upload(thumbNailName, thumbNail.image);

      const imageUrl = this.configService.get('FILE_CDN_URI') + imageName;
      const thumbnailUrl =
        this.configService.get('FILE_CDN_URI') + thumbNailName;

      await this.assetRepository.registerAsset(<AssetEntity>{
        fileName: imageName,
        originalName: assetDto.url.substring(
            assetDto.url.lastIndexOf('/') + 1,
        ),
        filePath: imageUrl,
        thumbnailPath: thumbnailUrl,
      });

      const asset: Asset = {
        assetName: imageName,
        contentType: response.headers['content-type'],
        uri: imageUrl,
        thumbnailUri: thumbnailUrl,
      };
      return asset;
    } catch (e) {
      this.logger.error(e);
      throw new AssetException(
        e.message,
        e.stack,
          AssetHttpStatus.IMAGE_URL_UPLOAD_FAILED,
      );
    }
  }

  async getImageByName(assetName: string): Promise<AssetEntity> {
    try {
      return await this.assetRepository.getAsset(assetName);
    } catch (e) {
      this.logger.error(e);
      throw new GameApiException(
        e.message,
        e.stack,
        GameApiHttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
