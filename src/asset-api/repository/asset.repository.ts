import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AssetEntity } from '../../entities/asset.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AssetRepository {
  constructor(
    @InjectRepository(AssetEntity)
    private readonly assetRepository: Repository<AssetEntity>,
  ) {}

  public async registerAsset(assetEntity: AssetEntity): Promise<AssetEntity> {
    return await this.assetRepository.save(assetEntity);
  }

  public async getAsset(id: string): Promise<AssetEntity> {
    return await this.assetRepository.findOneBy({ fileName: id });
  }
}
