import { MetadataEntity } from './metadata.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MetadataRepository {
  constructor(
    @InjectRepository(MetadataEntity)
    private readonly metadataRepository: Repository<MetadataEntity>,
  ) {}

  public async registerMetadata(
    metadataEntity: MetadataEntity,
  ): Promise<MetadataEntity> {
    return await this.metadataRepository.save(metadataEntity);
  }

  public async getMetadata(id: string): Promise<MetadataEntity> {
    return await this.metadataRepository.findOneBy({ fileName: id });
  }
}
