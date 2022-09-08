import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('tb_metadata')
export class MetadataEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column({ name: 'filename', type: 'varchar', nullable: false, length: 50 })
  fileName: string;

  @Column({ name: 'uri', type: 'varchar', nullable: false })
  uri: string;

  @CreateDateColumn({ name: 'created_at'})
  createdAt: string;
}
