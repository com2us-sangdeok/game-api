import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';
import {
  GameApiException,
  GameApiHttpStatus,
} from '../exception/request.exception';
import { Injectable } from '@nestjs/common';

@Injectable()
export class S3storageUtil {
  private S3: AWS.S3;

  constructor(private configService: ConfigService) {
    this.S3 = new AWS.S3({
      accessKeyId: this.configService.get('AWS_S3_ACCESS_KEY'),
      secretAccessKey: this.configService.get('AWS_S3_KEY_SECRET'),
      region: this.configService.get('AWS_REGION'),
      // credentials: {
      //   accessKeyId: this.configService.get('AWS_S3_ACCESS_KEY'),
      //   secretAccessKey: this.configService.get('AWS_S3_KEY_SECRET'),
      // },
    });
  }

  public async upload(key: string, data: any): Promise<string> {
    try {
      const uploadParams = {
        Bucket: this.configService.get('AWS_S3_BUCKET'),
        Key: key,
        Body: data,
      };
      const result = await this.S3.upload(uploadParams).promise();
      return result.Location;
    } catch (e) {
      console.log(
        '--------------------------------------------------------------------',
      );
      console.log(e);
      console.log(
        '--------------------------------------------------------------------',
      );
      throw new GameApiException(
        e.message,
        e.stack,
        GameApiHttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}