import { Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import {AssetEntity} from "./repository/asset.entity";
import {AssetV1Controller} from "./v1/asset-v1.controller";
import {AssetV1Service} from "./v1/asset-v1.service";
import {TypeOrmModule} from "@nestjs/typeorm";
import {AssetRepository} from "./repository/asset.repository";

@Module({
    exports: [AssetV1Service],
    imports: [
        TypeOrmModule.forFeature([AssetEntity]),
        WinstonModule,
    ],
    controllers: [AssetV1Controller],
    providers: [
        AssetRepository,
        AssetV1Service,
    ],
})
export class AssetModule {}
