import { Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { AssetEntity } from '../entities/asset.entity';
import { AssetV1Controller } from './v1/asset-v1.controller';
import { AssetV1Service } from './v1/asset-v1.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssetRepository } from './repository/asset.repository';
import { S3storageUtil } from '../util/s3storage.util';
import { AxiosClientUtil } from '../util/axios-client.util';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ImageUtil } from '../util/image.util';

@Module({
  exports: [AssetV1Service],
  imports: [
    TypeOrmModule.forFeature([AssetEntity]),
    WinstonModule,
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        timeout: configService.get('HTTP_TIMEOUT'),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AssetV1Controller],
  providers: [
    AssetRepository,
    AssetV1Service,
    ImageUtil,
    AxiosClientUtil,
    S3storageUtil,
  ],
})
export class AssetModule {}
