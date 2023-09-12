import { HttpStatus, Injectable } from '@nestjs/common';
import { WalletApiRepository } from './repository/wallet-api.repository';
import { Wallet } from './dto/wallet-api.dto';
import { WalletInfoEntity } from '../../entities/wallet-info.entity';
import { AxiosClientUtil } from '../../util/axios-client.util';
import {
  WalletApiException,
  WalletApiStatus,
} from '../../exception/wallet-api.exception';
import axios from 'axios';
import { DeleteYN } from '../../enum/delete-yn.enum';

@Injectable()
export class WalletApiService {
  constructor(
    private readonly walletApiRepository: WalletApiRepository,
    private readonly axiosUtil: AxiosClientUtil,
  ) {}

  public async walletList(param: any): Promise<{ walletList: Wallet[] }> {
    try {
      const walletList = await this.walletApiRepository.getWalletList(
        param.company,
        param.lang,
      );

      return { walletList: walletList };
    } catch (err) {
      throw new WalletApiException(
        err.message,
        JSON.stringify(err),
        err.status,
      );
    }
  }

  public async createWallet(param: any): Promise<any> {
    try {
      let wallet;

      const isWallet = await this.walletApiRepository.getWallet(
        param.company,
        param.address,
        param.walletType,
      );

      let error = false;
      if (isWallet && isWallet.deleteYN === 'N') {
        return {
          error: true,
          message: 'ALREADY_REGISTERED_WALLET',
          status: WalletApiStatus.ALREADY_REGISTERED_WALLET,
        };
      }

      if (isWallet && isWallet.deleteYN === 'Y') {
        const updRes = await this.walletApiRepository.updateWallet(
          param.company,
          param.address,
          DeleteYN.N,
        );
        if (updRes.affected !== 1) error = true;
      } else {
        switch (param.walletType) {
          case 'SINGLE':
            wallet = new WalletInfoEntity({
              company: param.company,
              address: param.address,
              walletType: param.walletType,
              providerAddress: '',
            });
            break;
          case 'MULTI':
            const authRes = await this.authApi();
            const accessToken = authRes.data.accessToken;

            const createRes = await this.axiosUtil
              .post(
                `${process.env.GAME_API_URL}/game/multi-sig/create`,
                { publicKey: param.publicKey },
                {
                  Authorization: 'Bearer ' + accessToken,
                  address: param.providerAddress,
                },
              )
              .catch((err) => err);

            if (axios.isAxiosError(createRes)) {
              error = true;
              break;
            }

            const multiAddress = createRes.body.data.multiSigWallet;

            wallet = new WalletInfoEntity({
              company: param.company,
              address: multiAddress,
              walletType: param.walletType,
              providerAddress: param.providerAddress,
            });

            break;
          default:
            break;
        }

        if (!error) await this.walletApiRepository.saveWallet(wallet);
      }

      const walletList = await this.walletApiRepository.getWalletList(
        param.company,
        param.lang,
      );
      return {
        error: error,
        walletList: walletList,
      };
    } catch (err) {
      throw new WalletApiException(
        err.message,
        JSON.stringify(err),
        err.status,
      );
    }
  }

  public async deleteWallet(
    param: any,
  ): Promise<{ error: boolean; walletList: Wallet[] }> {
    let error: boolean = false;
    try {
      const updRes = await this.walletApiRepository.updateWallet(
        param.company,
        param.address,
        DeleteYN.Y,
      );
      if (updRes.affected !== 1) error = true;

      const walletList = await this.walletApiRepository.getWalletList(
        param.company,
        param.lang,
      );

      return { error: error, walletList: walletList };
    } catch (err) {
      throw new WalletApiException(
        err.message,
        JSON.stringify(err),
        err.status,
      );
    }
  }

  private async authApi() {
    return (
      await this.axiosUtil.post(process.env.BLOCKCHAIN_AUTH_URL, {
        id: process.env.MULTISIG_AUTH_ID,
        secretKey: process.env.MULTISIG_SECRET_KEY,
      })
    ).body;
  }
}
