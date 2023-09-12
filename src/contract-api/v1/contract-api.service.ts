import { HttpStatus, Injectable } from '@nestjs/common';
import { ContractApiRepository } from './repository/contract-api.repository';
import { AxiosClientUtil } from '../../util/axios-client.util';
import { isAxiosError } from '@nestjs/terminus/dist/utils';
import { ContractTypeEnum } from '../../enum/contract-type.enum';
import {
  ContractApiException,
  ContractApiStatus,
} from '../../exception/contract-api.exception';

@Injectable()
export class ContractApiService {
  constructor(
    private readonly contractApiRepo: ContractApiRepository,
    private readonly axiosUtil: AxiosClientUtil,
  ) {}

  public async walletContractInfo(param: any): Promise<any> {
    try {
      const walletList = await this.contractApiRepo.multiList(param.company);

      //auth
      const authRes = await this.authApi();
      const accessToken = authRes.data.accessToken;
      let error = false;

      //회사 정보로 발행된 contract list 가져오기
      const contractListRes = await this.axiosUtil
        .get(
          `${process.env.GAME_API_URL}/game/multi-sig/contract-list?multiAddress=${param.multiAddress}&company=${param.company}&page=${param.page}&orderBy=${param.orderBy}`,
          {
            Authorization: 'Bearer ' + accessToken,
          },
        )
        .catch((err) => err);

      let contractInfo;
      let contractArr = [];
      if (isAxiosError(contractListRes)) {
        error = true;
      } else {
        contractInfo = contractListRes.body.data;
        contractArr = contractInfo.list.map((v) => v.nftContract);
      }

      const gameInfo = await this.contractApiRepo.contractInfo(
        param.lang,
        param.company,
        param.multiAddress,
        contractArr,
      );

      const contractList = gameInfo.list
        .map((v) => {
          let nftIssueDate;
          let lockIssueDate;
          for (let i = 0; i < contractInfo.list.length; i++) {
            if (
              v.multiAddress === contractInfo.list[i].multiAddress &&
              v.appId === contractInfo.list[i].appId &&
              v.nftContract === contractInfo.list[i].nftContract
            ) {
              if (contractInfo.list[i].nftIssueDate)
                nftIssueDate = contractInfo.list[i].nftIssueDate;
              if (contractInfo.list[i].lockIssueDate)
                lockIssueDate = contractInfo.list[i].lockIssueDate;
            }
          }

          return { ...v, nftIssueDate, lockIssueDate };
        })
        .sort((a, b) => {
          if (param.orderBy === 'DESC')
            return (
              +new Date(b.nftIssueDate).valueOf() -
              +new Date(a.nftIssueDate).valueOf()
            );
          if (param.orderBy === 'ASC')
            return (
              +new Date(a.nftIssueDate).valueOf() -
              +new Date(b.nftIssueDate).valueOf()
            );
        });

      return {
        error: error,
        walletList: walletList,
        contractCount: contractInfo.count,
        contractList: contractList,
      };
    } catch (err) {
      throw new ContractApiException(
        err.message,
        JSON.stringify(err),
        ContractApiStatus.CONTRACT_API_ERROR,
      );
    }
  }

  public async multiList(param: any): Promise<any> {
    const walletList = await this.contractApiRepo.multiList(param.company);

    return { walletList: walletList };
  }

  public async gameList(param: any): Promise<any> {
    const walletList = await this.contractApiRepo.multiList(param.company);
    const gameList = await this.contractApiRepo.gameList(
      param.lang,
      param.company,
      param.multiAddress,
    );
    return { walletList: walletList, gameList: gameList };
  }

  public async createContract(param: any): Promise<any> {
    try {
      const gameInfo = await this.contractApiRepo.gameInfo(
        param.company,
        param.gameIndex,
        param.multiAddress,
      );

      let contractType = '';
      let data;

      if (param.contractType === ContractTypeEnum.NFT) {
        contractType = 'nft';
        data = {
          providerAddress: gameInfo.providerAddress,
          multiSigWallet: param.multiAddress,
          contractType: contractType,
          company: param.company,
          contractName: `${gameInfo.gameName} NFT`,
          contractSymbol: param.contractSymbol,
          contractLabel: `${gameInfo.gameName} NFT`,
        };
      }
      if (param.contractType === ContractTypeEnum.LOCK) {
        contractType = 'lock';
        data = {
          providerAddress: gameInfo.providerAddress,
          multiSigWallet: param.multiAddress,
          contractType: contractType,
          company: param.company,
          contractName: `${gameInfo.gameName} LOCK`,
          contractLabel: `${gameInfo.gameName} LOCK`,
        };
      }

      //auth
      const authRes = await this.authApi();
      const accessToken = authRes.data.accessToken;

      const createTxRes = await this.axiosUtil
        .post(`${process.env.GAME_API_URL}/game/multi-sig/contract`, data, {
          Authorization: 'Bearer ' + accessToken,
          appid: gameInfo.appId,
        })
        .catch((err) => err);

      let error = false;
      let txInfo = '';
      if (isAxiosError(createTxRes)) {
        error = true;
        txInfo = createTxRes.response.data;
      } else txInfo = createTxRes.body.data;
      return { error, txInfo };
    } catch (err) {
      throw new ContractApiException(
        err.message,
        JSON.stringify(err),
        ContractApiStatus.CONTRACT_API_ERROR,
      );
    }
  }

  public async contractDeploy(param: any): Promise<any> {
    try {
      const gameInfo = await this.contractApiRepo.gameInfo(
        param.company,
        param.gameIndex,
        param.multiAddress,
      );

      const authRes = await this.authApi();
      const accessToken = authRes.data.accessToken;

      const data = {
        requestId: param.requestId,
        multiSigWallet: param.multiAddress,
        signedTx: param.signedTx,
      };

      const deployTxRes = await this.axiosUtil
        .post(
          `${process.env.GAME_API_URL}/game/multi-sig/deploy`,
          data,
          {
            Authorization: 'Bearer ' + accessToken,
            appid: gameInfo.appId,
          },
          10000,
        )
        .catch((err) => err);

      let error = false;
      let txInfo;

      if (isAxiosError(deployTxRes)) {
        error = true;
      } else {
        txInfo = deployTxRes.body.data;
        //발행된 contract 내역 blockchain game table에 업데이트

        await this.contractApiRepo.updateContractInfo(
          param.company,
          param.gameIndex,
          txInfo.contractAddress,
          txInfo.contractType,
        );
      }
      return { error: error, txInfo: txInfo };
    } catch (err) {
      throw new ContractApiException(
        err.message,
        JSON.stringify(err),
        ContractApiStatus.CONTRACT_API_ERROR,
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
