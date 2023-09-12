import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiFile } from '../../decorator/api-file.decorator';
import { ParseFile } from '../../pipe/parse-file.pipe';
import { fileMimetypeFilter } from '../../filter/file-mimetype.filter';
import { AssetV1Service } from './asset-v1.service';
import { AssetInfoDto } from './dto/asset-v1.dto';
import { CommonResponseDto } from '../../commom/dto/common-response.dto';
import { AssetEntity } from '../../entities/asset.entity';
import { GameApiHttpStatus } from '../../exception/exception';
import { AssetInfo } from './type/file-info';
import { ConfigService } from '@nestjs/config';

@ApiBearerAuth()
@ApiTags('Asset API')
@Controller({
  version: '1',
})
export class AssetV1Controller {
  constructor(private readonly apiV1Service: AssetV1Service) {}

  @Post('asset')
  @ApiOperation({ summary: 'upload asset-api' })
  @ApiFile('file', true, {
    fileFilter: fileMimetypeFilter('image'),
    limits: { fileSize: 15000000 }, //10MB
  })
  async uploadImage(
    @UploadedFile(ParseFile) file: Express.Multer.File,
  ): Promise<CommonResponseDto<AssetInfo>> {
    try {
      const result = await this.apiV1Service.uploadImage(file);
      return new CommonResponseDto<AssetInfo>(
        GameApiHttpStatus.OK,
        'success',
        result,
      );
    } catch (e) {
      throw e;
    }
  }
  // /f4aa905e-24ff-6d57-8c82-f96382bcf8ae.png
  @Post('asset-api-by-url')
  @ApiOperation({ summary: 'upload asset-api by public url' })
  async uploadImageByUrl(
    @Body() assetInfoDto: AssetInfoDto,
  ): Promise<CommonResponseDto<AssetInfo>> {
    const result = await this.apiV1Service.uploadImageByUrl(assetInfoDto);
    return new CommonResponseDto<AssetInfo>(
      GameApiHttpStatus.OK,
      'success',
      result,
    );
  }

  @Get('asset-api/:assetName')
  @ApiOperation({ summary: 'get asset-api info' })
  async getImageByName(
    @Param('assetName') assetName: string,
  ): Promise<CommonResponseDto<AssetEntity>> {
    const result = await this.apiV1Service.getImageByName(assetName);
    return new CommonResponseDto<AssetEntity>(
      GameApiHttpStatus.OK,
      'success',
      result,
    );
  }

  @Post('file')
  @ApiOperation({ summary: 'upload file-api' })
  @ApiFile('file', true, {
    limits: { fileSize: 15000000 }, //10MB
  })
  async uploadFile(
    @UploadedFile(ParseFile) file: Express.Multer.File,
  ): Promise<CommonResponseDto<AssetInfo>> {
    try {
      const result = await this.apiV1Service.uploadFile(file);
      return new CommonResponseDto<AssetInfo>(
        GameApiHttpStatus.OK,
        'success',
        result,
      );
    } catch (e) {
      throw e;
    }
  }
}
