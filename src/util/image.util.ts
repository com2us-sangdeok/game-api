import { Injectable } from '@nestjs/common';
import { ExternalServerException } from '../exception/external-server.exception';
import * as sharp from 'sharp';
import axios from 'axios';
import * as Path from 'path';
import * as Fs from 'fs';
import * as fs from 'fs';
import { File } from '../asset-api/v1/type/file';
import { ImageDto } from '../asset-api/v1/dto/asset-v1.dto';
import { ConfigService } from '@nestjs/config';
import {
  GameApiException,
  GameApiHttpStatus,
} from '../exception/request.exception';

@Injectable()
export class ImageUtil {
  constructor(private configService: ConfigService) {}

  public async getImageBySharp(imageDto: ImageDto): Promise<File> {
    try {
      let sharpObject;
      if (
        (Buffer.isBuffer(imageDto.buffer) && imageDto.buffer.length === 0) ||
        imageDto.buffer === undefined ||
        imageDto.buffer === null
      ) {
        let input: Buffer | string = imageDto.path;
        const regex = new RegExp('^(https?|chrome):\\/\\/[^\\s$.?#].[^\\s]*$');
        if (regex.test(imageDto.path)) {
          input = (
            await axios({ url: imageDto.path, responseType: 'arraybuffer' })
          ).data as Buffer;
        }
        sharpObject = sharp(input);
      } else {
        sharpObject = await sharp(imageDto.buffer).grayscale();
      }

      if (!imageDto.isOriginal) {
        sharpObject = sharpObject
          .resize({
            width: parseInt(this.configService.get('FILE_THUMBNAIL_SIZE')),
          })
          .blur(false)
          .blur(true);
      }

      // await sharpObject.toFile(imageDto.filename);

      const assetInfo: File = {
        image: await sharpObject,
        buffer: await sharpObject.toBuffer(),
      };
      return assetInfo;
    } catch (e) {
      throw new GameApiException(
        e.message,
        e.stack,
        GameApiHttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // public async getImageByAxios (imageDto: ImageDto): Promise<File>  {
  //     const url = imageDto.path;
  //     const fileName = Path.basename(url);
  //     const filePath = Path.resolve(__dirname, '../files', fileName)
  //     this.mkdir(Path.dirname(filePath))
  //     const writer = Fs.createWriteStream(filePath);
  //
  //     try {
  //         const response = await axios({
  //             url,
  //             method: 'GET',
  //             responseType: 'stream'
  //         })
  //
  //         const assetInfo: File = {
  //             contentType: response.headers['content-type'],
  //             // buffer: await Buffer.from(response.data, "utf8")
  //             buffer: response.data
  //         }
  //
  //         return assetInfo;
  //
  //         // response.data.pipe(writer);
  //         // writer.on('finish', () => {
  //         //     return fs.statSync(filePath).size;
  //         // })
  //     } catch (e) {
  //         throw new ExternalServerException(e);
  //     }
  // }

  // private mkdir(dirPath: string) {
  //     const isExists = fs.existsSync(dirPath);
  //     if( !isExists ) {
  //         fs.mkdirSync(dirPath, { recursive: true });
  //     }
  // }
}
