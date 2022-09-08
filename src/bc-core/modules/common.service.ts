import { HttpException, Injectable } from '@nestjs/common';
import { BlockchainService } from '../blockchain/blockchain.service';
import {
  Msg,
  MsgSend,
  Tx,
  Wallet,
  SignMode,
  isTxError,
  TxInfo,
} from '@xpla/xpla.js';
import { Coinbalance } from './modules.inerface';
import {
  BlockchainException,
  BlockchainStatus,
} from '../../exception/blockchain.exception';

@Injectable()
export class CommonService {
  private bc = this.blockchainService.blockChainClient();
  private lcd = this.blockchainService.lcdClient();

  constructor(private readonly blockchainService: BlockchainService) {}

  public async makeTx(signer: { address: string }[], msgs: Msg[]): Promise<Tx> {
    try {
      return await this.lcd.tx.create(signer, {
        msgs: msgs,
      });
    } catch (err) {
      throw new BlockchainException(
        {
          message: err.response.data.message,
        },
        err.message,
        BlockchainStatus.CREATE_TX_ERROR,
      );
    }
  }

  public async sign(wallet: Wallet, tx: Tx, sequence?: number): Promise<Tx> {
    const walletInfo = await wallet.accountNumberAndSequence();

    try {
      const sign = await wallet.key.signTx(tx, {
        chainID: this.lcd.config.chainID,
        signMode: SignMode.SIGN_MODE_LEGACY_AMINO_JSON,
        sequence: sequence ? sequence : walletInfo.sequence,
        accountNumber: walletInfo.account_number,
      });
      return sign;
    } catch (err) {
      console.log('%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%');
      console.log(err);
      console.log('%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%');
      throw new BlockchainException(
        {
          message: err.response.data.message,
        },
        err.message,
        BlockchainStatus.SIGN_ERROR,
      );
    }
  }

  public async getBalance(address: string): Promise<Coinbalance[]> {
    return await this.bc.client.getBalance(address);
  }

  public async transferCoin(
    sender: string,
    receiver: string,
    amount: string,
    denom: string,
  ): Promise<MsgSend> {
    try {
      return new MsgSend(sender, receiver, amount + denom);
    } catch (err) {
      throw new BlockchainException(
        {
          message: err.response.data.message,
        },
        err.message,
        BlockchainStatus.TRANSFER_COIN_ERROR,
      );
    }
  }

  public async broadcast(signedTx: Tx): Promise<any> {
    try {
      return await this.lcd.tx.broadcastSync(signedTx);
    } catch (err) {
      throw new BlockchainException(
        {
          message: err.response.data.message,
        },
        err.message,
        BlockchainStatus.BROADCAST_ERROR,
      );
    }
  }

  public async txDetail(tx: string): Promise<{
    error: boolean;
    code: number;
    txInfo: TxInfo | undefined;
    message: string;
  }> {
    try {
      let message = '';
      let error = true;
      let code = 0;

      const txInfo = await this.bc.client.getTx(tx).catch((e) => {
        message = e.response?.data.message;
        code = e.response?.data.code;
        return null;
      });

      if (txInfo) {
        error = isTxError(txInfo);
        code = txInfo.code;
      }
      return {
        error: error,
        code: code,
        txInfo: txInfo,
        message: message,
      };
    } catch (err) {
      console.log(err);
    }
  }
}
