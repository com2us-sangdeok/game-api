import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { WalletInfoEntity } from '../../../entities/wallet-info.entity';
import { WalletTypeEnum } from '../../../enum/wallet-type.enum';
import { DeleteYN } from '../../../enum/delete-yn.enum';
import { GameInfoEntity } from '../../../entities/common.entitty';
import { BlockchainGameEntitty } from '../../../entities/blockchain-game.entitty';

@Injectable()
export class ContractApiRepository {
  constructor(
    @InjectRepository(WalletInfoEntity)
    private readonly walletInfoRepo: Repository<WalletInfoEntity>,
    @InjectRepository(BlockchainGameEntitty)
    private readonly blockchainGameRepo: Repository<BlockchainGameEntitty>,
    @InjectRepository(GameInfoEntity)
    private readonly gameInfoRepo: Repository<GameInfoEntity>,
  ) {}

  async multiList(company: number): Promise<any> {
    return await this.walletInfoRepo.find({
      where: {
        company: company,
        walletType: WalletTypeEnum.MULTI,
        deleteYN: DeleteYN.N,
      },
    });
  }

  /**
   * wallet 주소별 베타 게임 승인된 게임 컨트랙트 정보 조회
   * @param lang
   * @param company
   * @param multiAddress
   * @param contractArr
   */
  async contractInfo(
    lang: string,
    company: number,
    multiAddress: string,
    contractArr: string[],
  ): Promise<any> {
    //한 페이지 10개 고정
    const take = 10;

    let query = this.blockchainGameRepo
      .createQueryBuilder('bg')
      .select([
        'bg.company as company',
        'bg.appid as appId',
        'bg.gameindex as gameIndex',
        'tgn.name as gameName',
        'bg.nft_contract as nftContract',
        'bg.lock_contract as lockContract',
        'bg.game_provider_address as singleAddress',
        'twi.address as multiAddress',
      ])
      .leftJoin(
        'tb_game_name',
        'tgn',
        'bg.gameindex = tgn.gameindex and tgn.language=:lang',
        { lang },
      )
      .leftJoin(
        'tb_wallet_info',
        'twi',
        'bg.game_provider_address = twi.provider_address',
        { multiAddress },
      )
      .where('bg.company=:company and bg.nft_contract is not null', {
        company,
      })
      .andWhere('bg.company = twi.company');
    if (contractArr.length > 0)
      query = query.andWhere('bg.nft_contract IN(:contractArr)', {
        contractArr: contractArr,
      });
    if (multiAddress)
      query = query.andWhere('twi.address=:multiAddress', { multiAddress });

    const list = await query.getRawMany();

    return { list };
  }

  /**
   * multisig별 게임리스트 조회
   * @param lang
   * @param company
   * @param multiAddress
   */
  async gameList(
    lang: string,
    company: number,
    multiAddress: string,
  ): Promise<any> {
    return await this.blockchainGameRepo
      .createQueryBuilder('bg')
      .select([
        'bg.company as company',
        'bg.gameindex as gameIndex',
        'tgn.name as gameName',
        'bg.nft_contract as nftContract',
        'bg.lock_contract as lockContract',
        'bg.game_provider_address as singleAddress',
        'twi.address as multiAddress',
      ])
      .leftJoin(
        'tb_game_name',
        'tgn',
        'bg.gameindex = tgn.gameindex and tgn.language=:lang',
        { lang },
      )
      .leftJoin(
        'tb_wallet_info',
        'twi',
        'bg.game_provider_address = twi.provider_address',
        { multiAddress },
      )
      .where('bg.company=:company', {
        company,
      })
      .andWhere('bg.company = twi.company')
      .andWhere('twi.address=:multiAddress', { multiAddress })
      // .andWhere('bg.nftContract is null and bg.lockContract is null')
      .orderBy('bg.reg_datetime', 'DESC')
      .getRawMany();
  }

  async gameInfo(company: number, gameIndex: number, multiAddress: string) {
    return await this.blockchainGameRepo
      .createQueryBuilder('bg')
      .select([
        'bg.company as company',
        'bg.gameindex as gameIndex',
        'bg.appId as appId',
        'tgn.name as gameName',
        'bg.nft_contract as nftContract',
        'bg.lock_contract as lockContract',
        'twi.address as address',
        'twi.provider_address as providerAddress',
      ])
      .leftJoin(
        'tb_game_name',
        'tgn',
        `bg.gameindex = tgn.gameindex and tgn.language='en'`,
      )
      .leftJoin(
        'tb_wallet_info',
        'twi',
        'bg.game_provider_address = twi.provider_address',
        { multiAddress },
      )
      .where('bg.company=:company and bg.gameIndex=:gameIndex', {
        company,
        gameIndex,
      })
      .getRawOne();
  }

  async updateContractInfo(
    company: number,
    gameIndex: number,
    contractAddress: string,
    contractType: string,
  ): Promise<any> {
    let query;
    if (contractType === 'NFT') {
      query = await this.blockchainGameRepo
        .createQueryBuilder('bg')
        .update(BlockchainGameEntitty)
        .set({ nftContract: contractAddress })
        .where('company =:company and gameindex =:gameIndex', {
          company,
          gameIndex,
        })
        .execute();
    }
    if (contractType === 'LOCK') {
      query = await this.blockchainGameRepo
        .createQueryBuilder('bg')
        .update(BlockchainGameEntitty)
        .set({ lockContract: contractAddress })
        .where('company =:company and gameindex =:gameIndex', {
          company,
          gameIndex,
        })
        .execute();
    }

    return query;
  }
}
