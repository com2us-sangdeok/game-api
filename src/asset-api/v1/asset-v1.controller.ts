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
import { AssetDto } from './dto/asset-v1.dto';
import { CommonResponseDto } from '../../commom/dto/common-response.dto';
import { AssetEntity } from '../../entities/asset.entity';
import { GameApiHttpStatus } from '../../exception/request.exception';
import { Asset } from './type/file';

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
  ): Promise<CommonResponseDto<Asset>> {
    try {
      const result = await this.apiV1Service.uploadImage(file);
      return new CommonResponseDto<Asset>(
        GameApiHttpStatus.OK,
        'success',
        result,
      );
    } catch (e) {
      throw e;
    }
  }

  @Post('asset-by-url')
  @ApiOperation({ summary: 'upload asset-api by public url' })
  async uploadImageByUrl(
    @Body() assetDto: AssetDto,
  ): Promise<CommonResponseDto<Asset>> {
    const result = await this.apiV1Service.uploadImageByUrl(assetDto);
    return new CommonResponseDto<Asset>(
      GameApiHttpStatus.OK,
      'success',
      result,
    );
  }

  @Get('asset/:assetName')
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

  @Get('test')
  @ApiOperation({ summary: 'get asset-api info' })
  async test(
  ): Promise<CommonResponseDto<AssetEntity>> {
    const result = await this.apiV1Service.test();
    return new CommonResponseDto<AssetEntity>(
        GameApiHttpStatus.OK,
        'success',
        result,
    );
  }
}
