// import { Injectable } from '@nestjs/common';
// import * as sharp from 'sharp';
// import axios from 'axios';
// import { File } from '../asset-api/v1/type/file';
// import { ImageDto } from '../asset-api/v1/dto/asset-v1.dto';
// import { ConfigService } from '@nestjs/config';
// import {
//   GameApiException,
//   GameApiHttpStatus,
// } from '../exception/request.exception';
//
// @Injectable()
// export class ImageUtil {
//   constructor(private configService: ConfigService) {}
//
//   public async getImageBySharp(imageDto: ImageDto): Promise<File> {
//     try {
//       let sharpObject;
//       if (
//         (Buffer.isBuffer(imageDto.buffer) && imageDto.buffer.length === 0) ||
//         imageDto.buffer === undefined ||
//         imageDto.buffer === null
//       ) {
//         let input: Buffer | string = imageDto.path;
//         const regex = new RegExp('^(https?|chrome):\\/\\/[^\\s$.?#].[^\\s]*$');
//         if (regex.test(imageDto.path)) {
//           input = (
//             await axios({ url: imageDto.path, responseType: 'arraybuffer' })
//           ).data as Buffer;
//         }
//         sharpObject = sharp(input);
//       } else {
//         sharpObject = await sharp(imageDto.buffer).grayscale();
//       }
//
//       if (!imageDto.isOriginal) {
//         sharpObject = sharpObject
//           .resize({
//             width: parseInt(this.configService.get('FILE_THUMBNAIL_SIZE')),
//           })
//           .blur(false)
//           .blur(true);
//       }
//
//       // await sharpObject.toFile(imageDto.filename);
//
//       const assetInfo: File = {
//         image: await sharpObject,
//         buffer: await sharpObject.toBuffer(),
//       };
//       return assetInfo;
//     } catch (e) {
//       throw new GameApiException(
//         e.message,
//         e.stack,
//         GameApiHttpStatus.INTERNAL_SERVER_ERROR,
//       );
//     }
//   }
//
// }
