import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {SequenceEntity} from "./sequence.entity";

@Injectable()
export class GameApiRepository {
    constructor(
        @InjectRepository(SequenceEntity)
        private readonly seqRepo: Repository<SequenceEntity>,
    ) {
    }

    public async registerSequence(assetEntity: SequenceEntity): Promise <SequenceEntity> {
        return await this.seqRepo.save(assetEntity);
    }

    public async getSequence(address: string): Promise<SequenceEntity> {
        return await this.seqRepo.createQueryBuilder('sequence')
            .useTransaction(true)
            .setLock('pessimistic_read')
            .where('sequence.accAddress = :accAddress', {accAddress: address})
            .getOne()
    }


}