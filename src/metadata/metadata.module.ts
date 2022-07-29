import { Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import {MetadataV1Controller} from "./v1/metadata-v1.controller";
import {MetadataV1Service} from "./v1/metadata-v1.service";
import {MetadataRepository} from "./repository/metadata.repository";
import {TypeOrmModule} from "@nestjs/typeorm";
import {MetadataEntity} from "./repository/metadata.entity";

@Module({
    exports: [MetadataV1Service],
    imports: [
        TypeOrmModule.forFeature([MetadataEntity]),
        WinstonModule,
    ],
    controllers: [MetadataV1Controller],
    providers: [
        MetadataRepository,
        MetadataV1Service,
    ],
})
export class MetadataModule {}
