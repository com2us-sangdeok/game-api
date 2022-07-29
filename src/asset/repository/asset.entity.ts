import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    PrimaryGeneratedColumn,
} from "typeorm";

// export enum FileType {
//     META = 'metadata',
//     ASSET = 'asset',
// }

@Entity('Asset')
export class AssetEntity {
    @PrimaryGeneratedColumn()
    id: number;

    // @Column({ type: 'enum', enum: FileType })
    // fileType: FileType

    @Index({ unique: true })
    @Column({ type: 'varchar', nullable: false, length: 50 })
    fileName: string;

    @Column({ type: 'varchar', nullable: false, length: 100 })
    originalName: string;

    @Column({ type: 'varchar', nullable: false })
    filePath: string;

    @Column({ type: 'varchar', default: '' })
    thumbnailPath: string;

    @CreateDateColumn()
    createdAt: string;
}
