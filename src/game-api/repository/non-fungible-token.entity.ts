import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
} from 'typeorm';

// todo: index 확인
@Entity('NonFungibleToken')
export class NonFungibleTokenEntity {
    @PrimaryGeneratedColumn()
    tokenId: number;

    @Column({ type: 'varchar', length: 64 })
    appId: string;

    @Column({ type: 'varchar', length: 64 })
    accAddress: string;

    @Column({ type: 'bigint'})
    playerId: number;

    @Column({ type: 'varchar', default: 'valid'})
    status: string;

    @CreateDateColumn()
    createdAt: string;
}
