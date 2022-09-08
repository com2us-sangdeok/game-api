import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
import {name} from "ts-jest/dist/transformers/hoist-jest";

// export enum FileType {
//     META = 'metadata-api',
//     ASSET = 'asset-api',
// }

@Entity('tb_asset')
export class AssetEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column({ name: 'filename', type: 'varchar', nullable: false, length: 50 })
  fileName: string;

  @Column({
    name: 'original_filename',
    type: 'varchar',
    nullable: false,
    length: 100,
  })
  originalName: string;

  @Column({ name: 'file_path', type: 'varchar', nullable: false })
  filePath: string;

  @Column({ name: 'thumbnail_path', type: 'varchar', default: '' })
  thumbnailPath: string;

  @CreateDateColumn({ name: 'create_at' })
  createdAt: string;
}
