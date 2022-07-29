import {Body, Controller, Get, Param, Post} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import {ExtensionDto} from "./dto/metadata-v1.dto";
import {MetadataV1Service} from "./metadata-v1.service";
import {CommonResponseDto} from "../../commom/dto/common-response.dto";
import {Metadata} from "./type/meta-info";
import {GameApiHttpStatus} from "../../exception/request.exception";

@ApiBearerAuth()
@ApiTags('Metadata API')
@Controller({
    version: '1',
})
export class MetadataV1Controller {
    constructor(private readonly metadataV1Service: MetadataV1Service) {}

    @Post('metadata')
    @ApiOperation({ summary: 'upload metadata' })
    async uploadMetadata(
        @Body() extensionDto: ExtensionDto,
    ): Promise<CommonResponseDto<Metadata>>  {
        const result = await this.metadataV1Service.uploadMetadata(extensionDto)

        return new CommonResponseDto<Metadata>(
            GameApiHttpStatus.OK,
            'success',
            result
        )
    }

    @Get('metadata/:id')
    @ApiOperation({ summary: 'get metadata' })
    async getMetadata(
        @Param('id') id: string
    ): Promise<CommonResponseDto<Metadata>> {
        const result = await this.metadataV1Service.getMetadata(id);

        return new CommonResponseDto<Metadata>(
            GameApiHttpStatus.OK,
            'success',
            result
        )
    }
}
