import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { WalletInfoEntity } from '../../../entities/wallet-info.entity';
import { GameNameDBDto, Wallet } from '../dto/wallet-api.dto';
import { DeleteYN } from '../../../enum/delete-yn.enum';
import { BlockchainGameEntitty } from '../../../entities/blockchain-game.entitty';

@Injectable()
export class WalletApiRepository {
  constructor(
    @InjectRepository(WalletInfoEntity)
    private readonly walletInfoRepo: Repository<WalletInfoEntity>,
    @InjectRepository(BlockchainGameEntitty)
    private readonly blockchainGameRepo: Repository<BlockchainGameEntitty>,
  ) {}

  async getWallet(
    company: number,
    address: string,
    walletType: string,
  ): Promise<any> {
    return await this.walletInfoRepo.findOne({
      where: { company: company, address: address, walletType: walletType },
    });
  }

  /**
   * 같은 테이블 조인이라 alias를 a,b로 설정
   * @param company
   * @param lang
   */
  async getWalletList(company: number, lang: string): Promise<Wallet[]> {
    let walletList = await this.walletInfoRepo
      .createQueryBuilder('a')
      .select([
        'a.id as id',
        'a.company as company',
        'a.address as singleAddress',
        'b.address as multiAddress',
      ])
      .leftJoin(
        'tb_wallet_info',
        'b',
        'a.address = b.provider_address and b.company = :company',
        { company },
      )
      .orderBy('id', 'ASC')
      .where(
        `a.company = :company and a.wallet_type= 'SINGLE' and a.del_yn='N'`,
        { company },
      )
      .getRawMany();

    const gameName = await this.getGameName(lang, company);

    const contractArr = await this.contractList(lang, company);

    walletList = walletList.map((v) => {
      const gameList = [];
      for (let i = 0; i < gameName.length; i++) {
        if (v.singleAddress === gameName[i].address && gameName[i].gameIndex) {
          delete gameName[i].address;
          gameList.push(gameName[i]);
        }
      }
      return { ...v, gameList };
    });

    walletList = walletList.map((v) => {
      const contractList = [];
      for (let i = 0; i < contractArr.length; i++) {
        if (v.multiAddress === contractArr[i].multiAddress) {
          contractList.push(contractArr[i]);
        }
      }
      return { ...v, contractList };
    });

    return walletList;
  }

  async saveWallet(wallet: WalletInfoEntity) {
    return await this.walletInfoRepo.save(wallet);
  }

  /**
   * wallet 주소별 베타 게임 신청한 게임명 조회
   * @param lang
   * @param company
   */
  async getGameName(lang: string, company: number): Promise<GameNameDBDto[]> {
    return await this.walletInfoRepo
      .createQueryBuilder('twi')
      .select(['twi.address as address', 'tbgi.gameindex as gameIndex'])
      .addSelect(
        `(select tbn.name from tb_game_name AS tbn where tbn.gameindex = tbgi.gameindex and language ='${lang}') as gameName`,
      )
      .leftJoin(
        'tb_betagame_launcher_confirm_info',
        'tbgi',
        'twi.address = tbgi.game_provider_address and tbgi.company =:company',
        { company },
      )
      .where(`twi.company =:company and twi.wallet_type = 'SINGLE'`, {
        company,
      })
      .orderBy('tbgi.id', 'ASC')
      .getRawMany();
  }

  async contractList(lang: string, company: number): Promise<any> {
    return await this.blockchainGameRepo
      .createQueryBuilder('bg')
      .select([
        'bg.company as company',
        'bg.gameindex as gameIndex',
        'bg.appid as appId',
        'twi.address as multiAddress',
        `(select tbn.name from tb_game_name AS tbn where tbn.gameindex = bg.gameindex and language='${lang}') as gameName`,
      ])
      .leftJoin(
        'tb_wallet_info',
        'twi',
        'bg.game_provider_address = twi.provider_address and twi.company =:company',
        { company },
      )
      // .andWhere('twi.company =:')
      .where('bg.nft_contract is not null and bg.lock_contract is not null')
      .orderBy('bg.id', 'ASC')
      .getRawMany();
  }

  async updateWallet(
    company: number,
    address: string,
    delYN: DeleteYN,
  ): Promise<any> {
    return await this.walletInfoRepo
      .createQueryBuilder()
      .update(WalletInfoEntity)
      .set({ deleteYN: delYN })
      .where(
        `company =:company and address =:address and wallet_type='SINGLE'`,
        { company, address },
      )
      .execute();
  }
}
