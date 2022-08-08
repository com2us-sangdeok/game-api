import {
    Column,
    Entity,
    PrimaryColumn,
} from 'typeorm';

@Entity('Sequence')
export class SequenceEntity {
    @PrimaryColumn({ type: 'varchar', length: 64 })
    accAddress: string;

    @Column({ type: 'bigint' })
    sequenceNumber: number;
}
